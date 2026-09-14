/* NAV — hamburger, scroll state, active link */
(function () {
  const nav = document.querySelector('.nav');
  const hamburger = document.querySelector('.nav__hamburger');
  const mobileMenu = document.querySelector('.nav__mobile');

  // Scroll state
  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 20) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger toggle
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      const isOpen = mobileMenu.classList.toggle('is-open');
      hamburger.classList.toggle('is-open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (mobileMenu.classList.contains('is-open') &&
          !mobileMenu.contains(e.target) &&
          !hamburger.contains(e.target)) {
        closeMobile();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
        closeMobile();
      }
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMobile);
    });
  }

  function closeMobile() {
    if (mobileMenu) mobileMenu.classList.remove('is-open');
    if (hamburger) {
      hamburger.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
    document.body.style.overflow = '';
  }

  // Active link
  var currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  var pageName = currentPath.split('/').pop().replace('.html', '') || 'home';
  if (currentPath === '/') pageName = 'home';

  document.querySelectorAll('.nav__links a, .nav__mobile-links a').forEach(function (link) {
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
