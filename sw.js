var CACHE = 'adjp-v9';

var PRECACHE = [
  '/',
  '/about',
  '/contact',
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
  '/js/mobile-nav.js',
  '/js/btn-ripple.js',
  '/assets/logo/ADJP Logo for Dark Background Transparent.png',
  '/assets/logo/favicon-dark-32x32.png',
  '/assets/logo/favicon-light-32x32.png',
  '/assets/logo/favicon-dark.png',
  '/assets/logo/favicon-light.png'
];

/* Rebuild a non-redirected response so Chrome doesn't reject it on navigate */
function cleanResponse(response) {
  if (!response || !response.redirected) return Promise.resolve(response);
  return response.blob().then(function (body) {
    return new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  });
}

/* Install — precache core shell, then activate immediately */
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (cache) {
      /* addAll with individual error suppression so one bad asset doesn't
         block the whole install */
      return Promise.all(
        PRECACHE.map(function (url) {
          return cache.add(url).catch(function () {});
        })
      );
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

/* Activate — delete every cache that isn't the current version */
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

/* Fetch strategy:
   - External resources (fonts, CDNs, Facebook, YouTube) → bypass SW entirely
   - Navigation requests (HTML pages)                    → network-first, cache fallback
   - Static assets (CSS, JS, images)                     → cache-first, update in background
*/
self.addEventListener('fetch', function (e) {
  var req = e.request;

  if (req.method !== 'GET') return;

  var url = new URL(req.url);

  /* Bypass external origins */
  if (url.origin !== self.location.origin) return;

  /* ── Navigation (page loads) — always try network first ── */
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(function (response) {
          if (response && response.status === 200) {
            var clone = response.clone();
            caches.open(CACHE).then(function (cache) { cache.put(req, clone); });
          }
          return cleanResponse(response);
        })
        .catch(function () {
          /* Offline: serve cached HTML if available */
          return caches.match(req).then(function (cached) {
            if (cached) return cleanResponse(cached);
            /* Try adding .html suffix for clean-URL misses */
            var htmlUrl = url.pathname.replace(/\/$/, '') + '.html';
            return caches.match(htmlUrl).then(function (htmlCached) {
              return htmlCached
                ? cleanResponse(htmlCached)
                : caches.match('/').then(function (root) {
                    return root ? cleanResponse(root) : null;
                  });
            });
          });
        })
    );
    return;
  }

  /* ── Static assets — cache-first, stale-while-revalidate ── */
  e.respondWith(
    caches.open(CACHE).then(function (cache) {
      return cache.match(req).then(function (cached) {
        var fetchPromise = fetch(req).then(function (response) {
          if (response && response.status === 200 && response.type === 'basic') {
            cache.put(req, response.clone());
          }
          return response;
        }).catch(function () { return cached; });

        /* Return cached immediately if available, fetch in background to update */
        return cached || fetchPromise;
      });
    })
  );
});
