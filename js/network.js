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
      img.src = '';
      img.style.cssText =
        'background:linear-gradient(135deg,#06100C 0%,#0d1a14 100%);' +
        'display:block;width:100%;height:100%;';
      img.alt = '';
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
