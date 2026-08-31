/* LAZY LOAD — Showreel tabbed player
   Supports both YouTube (data-video-id) and
   direct embed URLs (data-embed-src) e.g. Facebook
*/
(function () {
  var tabs          = document.querySelectorAll('.showreel__tab');
  var frameWrap     = document.getElementById('showreel-frame-wrap');
  var placeholder   = document.getElementById('showreel-placeholder');
  var activeTitle   = document.getElementById('showreel-active-title');
  var activeRuntime = document.getElementById('showreel-active-runtime');

  if (!tabs.length || !frameWrap) return;

  var currentSrc = null;

  function updateMeta(title, runtime) {
    if (activeTitle) {
      activeTitle.innerHTML = '<span class="showreel__meta-dot"></span>' + title;
    }
    if (activeRuntime) {
      activeRuntime.innerHTML =
        '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" width="12" height="12">' +
        '<circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 1.5"/></svg>' + runtime;
    }
  }

  var card = document.getElementById('showreel-card');

  function loadEmbed(src, title, runtime, allowAttr, directUrl, fbScale) {
    if (src === currentSrc) return;
    currentSrc = src;

    frameWrap.innerHTML = '';
    frameWrap.style.cssText = 'position:absolute;inset:0;z-index:2;';
    if (window._showreelResizeFn) {
      window.removeEventListener('resize', window._showreelResizeFn);
      window._showreelResizeFn = null;
    }
    if (placeholder) placeholder.style.display = 'none';

    updateMeta(title, runtime);

    var isFacebook = src.indexOf('facebook.com') !== -1;

    if (card) {
      card.style.height   = '';
      card.style.maxWidth = '';
      card.style.margin   = '';
    }

    /* Loader overlay */
    var loader = document.createElement('div');
    loader.className = 'embed-loader';
    loader.innerHTML =
      '<div class="embed-loader__spinner"></div>' +
      '<span class="embed-loader__text">Loading video…</span>';
    frameWrap.appendChild(loader);

    var iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.allow = allowAttr || 'autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.scrolling = 'no';
    iframe.title = title;

    var fbDirectUrl = directUrl || 'https://www.facebook.com';

    var fbErrorShown = false;
    function showFbError() {
      if (fbErrorShown) return;
      fbErrorShown = true;
      loader.classList.add('loaded');
      iframe.style.display = 'none';
      var fallback = document.createElement('div');
      fallback.className = 'embed-fb-fallback';
      fallback.innerHTML =
        '<svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40" aria-hidden="true"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.884v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>' +
        '<p>This video couldn\'t load here.<br>Click below to watch on Facebook.</p>' +
        '<a href="' + fbDirectUrl + '" target="_blank" rel="noopener">Watch on Facebook</a>';
      frameWrap.appendChild(fallback);
    }

    // Scale iframe to fill card (crop to fit, works on both desktop and mobile)
    function applyFbScale() {
      var fw = frameWrap.offsetWidth  || (card && card.offsetWidth)  || window.innerWidth || 960;
      var fh = frameWrap.offsetHeight || (card && card.offsetHeight) || Math.round(fw * 9 / 16);
      if (!fw || !fh) { setTimeout(applyFbScale, 100); return; }
      var scaleX = fw / 560;
      var scaleY = fh / 314;
      var scale  = Math.max(scaleX, scaleY);
      iframe.style.transform       = 'translate(-50%,-50%) scale(' + scale + ')';
      iframe.style.transformOrigin = 'center center';
    }

    var fbLoaded = false;
    iframe.addEventListener('load', function () {
      fbLoaded = true;
      loader.classList.add('loaded');
      if (isFacebook && fbScale) {
        requestAnimationFrame(function () {
          applyFbScale();
          setTimeout(applyFbScale, 150);
          setTimeout(applyFbScale, 500);
        });
      }
      if (isFacebook) {
        setTimeout(function () {
          try {
            if (!iframe.contentWindow || iframe.clientWidth === 0) showFbError();
          } catch (e) {
            showFbError();
          }
        }, 800);
      }
    });

    // Fallback timeout if load never fires (hard block)
    if (isFacebook) {
      setTimeout(function () {
        if (!fbLoaded) showFbError();
      }, 5000);
    }

    if (fbScale) {
      // Fixed native FB size, scaled up to crop-fill the card on both desktop and mobile
      iframe.style.cssText = 'border:none;width:560px;height:314px;position:absolute;top:50%;left:50%;transform-origin:center center;';
      frameWrap.style.cssText = 'position:absolute;inset:0;z-index:2;overflow:hidden;';
      frameWrap.appendChild(iframe);
      requestAnimationFrame(function () {
        applyFbScale();
        setTimeout(applyFbScale, 100);
        setTimeout(applyFbScale, 400);
      });
      window._showreelResizeFn = applyFbScale;
      window.addEventListener('resize', applyFbScale);
    } else {
      iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none;';
      frameWrap.style.cssText = 'position:absolute;inset:0;z-index:2;overflow:hidden;';
      frameWrap.appendChild(iframe);
    }
  }

  function handleTab(tab) {
    var title     = tab.dataset.title   || 'ADJP CREATIVE SHOWREEL';
    var runtime   = tab.dataset.runtime || '—';
    var embedSrc  = tab.dataset.embedSrc;
    var videoId   = tab.dataset.videoId;
    var fbScale   = tab.dataset.fbScale === 'true';
    if (card) card.style.aspectRatio = '';

    if (embedSrc) {
      var hrefParam = embedSrc.match(/href=([^&]+)/);
      var directUrl = hrefParam ? decodeURIComponent(hrefParam[1]) : 'https://www.facebook.com';
      loadEmbed(embedSrc, title, runtime,
        'autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share',
        directUrl, fbScale);
    } else if (videoId && !videoId.startsWith('YOUR_VIDEO_ID')) {
      loadEmbed(
        'https://www.youtube.com/embed/' + videoId + '?rel=0&modestbranding=1',
        title, runtime,
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
      );
    } else {
      // Placeholder video — show cinematic placeholder
      frameWrap.innerHTML = '';
      currentSrc = null;
      if (placeholder) placeholder.style.display = '';
      if (card) {
        card.style.aspectRatio = '';
        card.style.height      = '';
        card.style.maxWidth    = '';
        card.style.margin      = '';
      }
      updateMeta(title, runtime);
    }
  }

  // Tab click
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      handleTab(tab);
    });
  });

  // Main play button triggers active tab
  var mainPlay = document.getElementById('showreel-main-play');
  if (mainPlay) {
    mainPlay.addEventListener('click', function () {
      var active = document.querySelector('.showreel__tab.active');
      if (active) active.click();
    });
  }

  // Auto-load first tab on page load
  var firstTab = document.querySelector('.showreel__tab.active');
  if (firstTab) {
    handleTab(firstTab);
  }

})();
