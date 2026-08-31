/* PORTFOLIO FILTER — pure JS category filtering */
(function () {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.portfolio-card');
  const countEl = document.querySelector('.filter-count');
  const noResults = document.querySelector('.no-results');

  if (!filterBtns.length || !cards.length) return;

  function updateCount(visible) {
    if (countEl) {
      countEl.textContent = visible + ' ' + (visible === 1 ? 'project' : 'projects');
    }
  }

  function showAll() {
    cards.forEach(function (card) {
      card.classList.remove('hidden');
    });
    updateCount(cards.length);
    if (noResults) noResults.classList.remove('visible');
  }

  function filterBy(category) {
    let visibleCount = 0;
    cards.forEach(function (card) {
      const cats = card.dataset.category ? card.dataset.category.split(',').map(function (c) { return c.trim(); }) : [];
      if (cats.includes(category)) {
        card.classList.remove('hidden');
        visibleCount++;
      } else {
        card.classList.add('hidden');
      }
    });
    updateCount(visibleCount);
    if (noResults) {
      noResults.classList.toggle('visible', visibleCount === 0);
    }

    // GSAP re-entrance animation on visible cards
    if (typeof gsap !== 'undefined') {
      const visible = Array.from(cards).filter(function (c) { return !c.classList.contains('hidden'); });
      gsap.fromTo(visible,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out' }
      );
    }
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      const category = btn.dataset.filter;
      if (!category || category === 'all') {
        showAll();
      } else {
        filterBy(category);
      }
    });
  });

  // Init count
  updateCount(cards.length);
})();
