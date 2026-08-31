var CACHE = 'adjp-v1';

var PRECACHE = [
  '/',
  '/index.html',
  '/about.html',
  '/contact.html',
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

/* Install — pre-cache shell assets */
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(PRECACHE);
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

/* Fetch — cache-first for shell, network-first for everything else */
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

  e.respondWith(
    caches.match(req).then(function (cached) {
      var networkFetch = fetch(req).then(function (response) {
        if (response && response.status === 200 && response.type === 'basic') {
          var clone = response.clone();
          caches.open(CACHE).then(function (cache) {
            cache.put(req, clone);
          });
        }
        return response;
      });

      /* Return cache immediately if available, otherwise wait for network */
      return cached || networkFetch;
    }).catch(function () {
      /* Offline fallback for navigation requests */
      if (req.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});
