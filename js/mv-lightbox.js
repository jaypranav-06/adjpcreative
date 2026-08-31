/* MUSIC VIDEOS — Thumbnail grid lightbox */
(function () {
  var lightbox       = document.getElementById('mv-lightbox');
  var backdrop       = document.getElementById('mv-lightbox-backdrop');
  var closeBtn       = document.getElementById('mv-lightbox-close');
  var playerWrap     = document.getElementById('mv-lightbox-player');
  var titleEl        = document.getElementById('mv-lightbox-title');

  if (!lightbox || !playerWrap) return;

  var _resizeFn = null;

  function buildSrc(card) {
    var source  = card.dataset.source  || 'youtube';
    var videoId = card.dataset.videoId;
    var embedSrc = card.dataset.embedSrc;

    if (embedSrc) return { src: embedSrc, isFacebook: embedSrc.indexOf('facebook.com') !== -1 };

    if (source === 'youtube' && videoId && !videoId.startsWith('YOUR') && !videoId.startsWith('YOUTUBE_ID')) {
      return {
        src: 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0&modestbranding=1',
        isFacebook: false
      };
    }

    return null;
  }

  function openLightbox(card) {
    var result = buildSrc(card);
    var title  = card.dataset.title || '';

    // Clear previous content
    playerWrap.innerHTML = '';
    if (_resizeFn) {
      window.removeEventListener('resize', _resizeFn);
      _resizeFn = null;
    }

    if (titleEl) titleEl.textContent = title;

    if (!result) {
      // No video configured yet — show a placeholder message
      playerWrap.innerHTML = '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#797F6C;font-size:0.9rem;">Video coming soon</div>';
    } else {
      // Loader overlay
      var loader = document.createElement('div');
      loader.className = 'embed-loader';
      loader.innerHTML =
        '<div class="embed-loader__spinner"></div>' +
        '<span class="embed-loader__text">Loading video…</span>';
      playerWrap.appendChild(loader);

      var iframe = document.createElement('iframe');
      iframe.src = result.src;
      iframe.allow = 'autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      iframe.title = title;

      iframe.addEventListener('load', function () {
        loader.classList.add('loaded');
      });

      if (result.isFacebook) {
        // Facebook iframes have fixed internal 560×314 — scale to fill
        iframe.style.cssText = 'border:none;width:560px;height:314px;position:absolute;top:50%;left:50%;transform-origin:center center;';
        playerWrap.style.overflow = 'hidden';
        playerWrap.appendChild(iframe);

        function scaleFb() {
          var w = playerWrap.offsetWidth;
          var h = playerWrap.offsetHeight;
          var scale = Math.max(w / 560, h / 314);
          iframe.style.transform = 'translate(-50%,-50%) scale(' + scale + ')';
        }
        scaleFb();
        _resizeFn = scaleFb;
        window.addEventListener('resize', scaleFb);
      } else {
        iframe.style.cssText = 'border:none;position:absolute;inset:0;width:100%;height:100%;';
        playerWrap.appendChild(iframe);
      }
    }

    lightbox.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.setAttribute('hidden', '');
    document.body.style.overflow = '';
    playerWrap.innerHTML = '';
    if (titleEl) titleEl.textContent = '';
    if (_resizeFn) {
      window.removeEventListener('resize', _resizeFn);
      _resizeFn = null;
    }
  }

  // Card clicks
  document.querySelectorAll('.mv-card').forEach(function (card) {
    card.addEventListener('click', function () { openLightbox(card); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(card); }
    });
    // Make cards keyboard-focusable
    if (!card.getAttribute('tabindex')) card.setAttribute('tabindex', '0');
  });

  // Close via backdrop
  if (backdrop) backdrop.addEventListener('click', closeLightbox);

  // Close via button
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

  // Close via ESC
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !lightbox.hasAttribute('hidden')) closeLightbox();
  });
})();
