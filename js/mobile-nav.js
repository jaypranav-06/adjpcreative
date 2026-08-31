(function () {
  'use strict';

  var header = document.getElementById('mob-header');
  var toggle = document.getElementById('mobNavToggle');
  var panel = document.getElementById('mob-nav-panel');

  if (!header || !toggle || !panel) return;

  var isOpen = false;

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
  var page = window.location.pathname.split('/').pop() || 'index.html';
  panel.querySelectorAll('.mob-nav-link').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();
