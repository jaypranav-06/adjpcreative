
/* Blog page — filter, search, load more, scroll animations */
(function () {
  'use strict';

  const CARDS_PER_PAGE = 6;
  let currentPage = 1;
  let activeFilter = 'all';
  let searchQuery = '';

  const grid        = document.getElementById('bl-grid');
  const featured    = document.querySelector('.bl-featured');
  const loadMoreBtn = document.getElementById('bl-load-more');
  const loadMoreWrap= document.getElementById('bl-load-more-wrap');
  const emptyState  = document.querySelector('.bl-empty');
  const searchInput = document.getElementById('bl-search');
  const filterBtns  = document.querySelectorAll('.bl-filter');

  if (!grid) return;

  const allCards = Array.from(grid.querySelectorAll('.bl-card'));

  // ── Filter buttons ───────────────────────
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      currentPage = 1;
      applyFilters();
    });
  });

  // ── Search ───────────────────────────────
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      searchQuery = searchInput.value.trim().toLowerCase();
      currentPage = 1;
      applyFilters();
    });
  }

  // ── Load More ────────────────────────────
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function () {
      currentPage += 1;
      applyFilters(true);
    });
  }

  // ── Core filter + render ─────────────────
  function applyFilters(append) {
    const visible = allCards.filter(function (card) {
      const cat = card.dataset.category || '';
      const title = (card.dataset.title || '').toLowerCase();
      const excerpt = (card.dataset.excerpt || '').toLowerCase();

      const matchCat = activeFilter === 'all' || cat === activeFilter;
      const matchSearch = !searchQuery ||
        title.includes(searchQuery) ||
        cat.includes(searchQuery) ||
        excerpt.includes(searchQuery);

      return matchCat && matchSearch;
    });

    // Handle featured article visibility
    if (featured) {
      const featCat = featured.dataset.category || '';
      const featTitle = (featured.dataset.title || '').toLowerCase();
      const featExcerpt = (featured.dataset.excerpt || '').toLowerCase();
      const featMatch =
        (activeFilter === 'all' || featCat === activeFilter) &&
        (!searchQuery || featTitle.includes(searchQuery) || featCat.includes(searchQuery) || featExcerpt.includes(searchQuery));
      featured.hidden = !featMatch;
    }

    // Hide all cards first
    allCards.forEach(function (card) {
      card.hidden = true;
      card.classList.remove('visible');
    });

    const toShow = visible.slice(0, currentPage * CARDS_PER_PAGE);

    toShow.forEach(function (card, i) {
      card.hidden = false;
      // Stagger animate on non-append or for newly revealed cards
      const delay = append ? Math.max(0, i - (currentPage - 1) * CARDS_PER_PAGE) * 80 : i * 80;
      setTimeout(function () {
        card.classList.add('visible');
      }, delay);
    });

    // Empty state
    const nothingVisible = toShow.length === 0 && (featured ? featured.hidden : true);
    if (emptyState) {
      emptyState.hidden = !nothingVisible;
    }

    // Load more button
    if (loadMoreWrap) {
      loadMoreWrap.hidden = visible.length <= currentPage * CARDS_PER_PAGE;
    }
  }

  // ── Intersection observer for card anims ─
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  // ── Initial render ───────────────────────
  applyFilters();

  // Observe visible cards for scroll-in animation
  allCards.forEach(function (card) {
    if (!card.hidden) observer.observe(card);
  });

  // Also animate featured on load
  if (featured) {
    setTimeout(function () {
      featured.classList.add('bl-card-anim', 'visible');
    }, 100);
  }

})();
