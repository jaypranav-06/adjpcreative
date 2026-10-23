(function () {
  'use strict';

  /* ── 1. OFFLINE / RECONNECT BANNER ─────────────── */
  var banner = document.createElement('div');
  banner.id = 'network-banner';
  banner.setAttribute('role', 'status');
  banner.setAttribute('aria-live', 'polite');
  banner.innerHTML =
    '<span class="network-banner__icon" aria-hidden="true"></span>' +
    '<span class="network-banner__msg" id="network-banner-msg">You are offline. Some content may not be available.</span>';
  document.body.appendChild(banner);

  var hideTimer = null;

  function showBanner(msg, type) {
    clearTimeout(hideTimer);
    var msgEl = document.getElementById('network-banner-msg');
    if (msgEl) msgEl.textContent = msg;
    banner.className = 'network-banner--' + type + ' is-visible';
    if (type === 'online' || type === 'slow') {
      hideTimer = setTimeout(function () {
        banner.classList.remove('is-visible');
      }, 5000);
    }
  }

  function hideBanner() {
    clearTimeout(hideTimer);
    banner.classList.remove('is-visible');
  }

  window.addEventListener('offline', function () {
    showBanner('You are offline. Some content may not be available.', 'offline');
  });

  window.addEventListener('online', function () {
    showBanner('Connection restored.', 'online');
  });

  /* ── 2. SLOW CONNECTION DETECTION ───────────────── */
  var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (connection) {
    var slowTypes = ['slow-2g', '2g'];

    function checkSlow() {
      if (slowTypes.indexOf(connection.effectiveType) !== -1 || connection.saveData) {
        showBanner('Slow connection detected — videos may take longer to load.', 'slow');
      }
    }

    checkSlow();
    connection.addEventListener('change', checkSlow);
  }

  /* ── 3. IMAGE ERROR FALLBACK ─────────────────────── */
  function attachImageFallback(img) {
    img.addEventListener('error', function () {
      if (img.dataset.fallbackApplied) return;
      img.dataset.fallbackApplied = '1';

      /* Replace the img with a message placeholder inside its parent */
      var parent = img.parentNode;
      if (!parent) return;

      img.style.display = 'none';

      if (parent.querySelector('.img-load-error')) return;

      var box = document.createElement('div');
      box.className = 'img-load-error';
      box.innerHTML =
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>' +
          '<line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>' +
        '</svg>' +
        '<span>Poor connection —<br>image unavailable</span>';
      parent.appendChild(box);
    });
  }

  /* Attach to all current images */
  document.querySelectorAll('img').forEach(attachImageFallback);

  /* Watch for dynamically added images (gallery thumbs etc.) */
  if (window.MutationObserver) {
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          if (node.tagName === 'IMG') attachImageFallback(node);
          node.querySelectorAll && node.querySelectorAll('img').forEach(attachImageFallback);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  /* ── 4. SERVICE WORKER REGISTRATION ────────────── */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
  }

})();
