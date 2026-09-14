(function () {
  'use strict';

  var header = document.getElementById('mob-header');
  var toggle = document.getElementById('mobNavToggle');
  var panel = document.getElementById('mob-nav-panel');

  if (!header || !toggle || !panel) return;

  var isOpen = false;

  // Scroll state
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 20) {
      header.classList.add('mob-header--scrolled');
    } else {
      header.classList.remove('mob-header--scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function openMenu() {
    isOpen = true;
    header.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close navigation');
    panel.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    isOpen = false;
    header.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
    panel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', function () {
    if (isOpen) closeMenu(); else openMenu();
  });

  // Close on nav link click
  panel.querySelectorAll('.mob-nav-link, .mob-nav-cta').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) closeMenu();
  });

  // Close on outside tap
  document.addEventListener('click', function (e) {
    if (isOpen && !header.contains(e.target)) closeMenu();
  });

  // Mark active page
  var currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  var pageName = currentPath.split('/').pop().replace('.html', '') || 'home';
  if (currentPath === '/') pageName = 'home';

  panel.querySelectorAll('.mob-nav-link').forEach(function (link) {
    var href = link.getAttribute('href');
    if (!href) return;
    var linkTarget = href.split('#')[0].replace(/\/$/, '') || '/';
    var linkName = linkTarget.split('/').pop().replace('.html', '') || 'home';
    if (linkTarget === '/' || linkTarget === '') linkName = 'home';

    if (linkName === pageName) {
      link.classList.add('active');
    }
  });
})();
