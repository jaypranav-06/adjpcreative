var CACHE = 'adjp-v3';

var PRECACHE = [
  '/',
  '/about',
  '/contact',
  '/portfolio',
  '/blog',
  '/css/base.css',
  '/css/layout.css',
  '/css/components.css',
  '/css/pages/home.css',
  '/css/pages/about.css',
  '/css/pages/contact.css',
  '/js/nav.js',
  '/js/animations.js',
  '/js/lazy-load.js',
  '/js/about-gallery.js',
  '/js/mv-lightbox.js',
  '/js/contact-form.js',
  '/js/studio.js',
  '/js/network.js',
  '/assets/logo/ADJP Logo for Dark Background Transparent.png',
  '/assets/logo/ADJP favicon.png'
];

/* Helper to strip the 'redirected' flag from responses.
   Chrome throws if a response with redirected: true is returned
   to a navigation request whose redirect mode is 'manual'. */
function cleanResponse(response) {
  if (!response || !response.redirected) {
    return Promise.resolve(response);
  }
  return response.blob().then(function (blob) {
    return new Response(blob, {
      headers: response.headers,
      status: response.status,
      statusText: response.statusText
    });
  });
}

/* Install — pre-cache shell assets with clean non-redirected responses */
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return Promise.all(
        PRECACHE.map(function (url) {
          return fetch(url, { redirect: 'follow' })
            .then(function (res) {
              if (!res.ok) return null;
              return cleanResponse(res).then(function (clean) {
                return cache.put(url, clean);
              });
            })
            .catch(function () {
              /* ignore single failure during precache */
            });
        })
      );
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

/* Activate — clear old caches */
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE; })
            .map(function (k) { return caches.delete(k); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

/* Fetch — network-first for navigation with cleanResponse, cache-first for static assets */
self.addEventListener('fetch', function (e) {
  var req = e.request;

  /* Only handle GET requests on same origin */
  if (req.method !== 'GET') return;
  if (req.url.indexOf(self.location.origin) === -1) return;

  /* Skip Facebook / YouTube / external embeds — always network */
  if (req.url.indexOf('facebook.com') !== -1 ||
      req.url.indexOf('youtube.com') !== -1 ||
      req.url.indexOf('googleapis.com') !== -1 ||
      req.url.indexOf('cdnjs.cloudflare.com') !== -1) {
    return;
  }

  /* Handle navigation requests (page loads) */
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(function (response) {
          return cleanResponse(response).then(function (clean) {
            if (clean && clean.status === 200) {
              var clone = clean.clone();
              caches.open(CACHE).then(function (cache) {
                cache.put(req, clone);
              });
            }
            return clean;
          });
        })
        .catch(function () {
          /* Offline fallback */
          return caches.match(req).then(function (cached) {
            if (cached) return cleanResponse(cached);
            return caches.match('/').then(function (root) {
              return root ? cleanResponse(root) : null;
            });
          });
        })
    );
    return;
  }

  /* Static assets: cache-first with cleanResponse fallback */
  e.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) {
        return cleanResponse(cached);
      }

      return fetch(req).then(function (response) {
        if (response && response.status === 200 && response.type === 'basic') {
          var clone = response.clone();
          caches.open(CACHE).then(function (cache) {
            cache.put(req, clone);
          });
        }
        return cleanResponse(response);
      });
    })
  );
});
