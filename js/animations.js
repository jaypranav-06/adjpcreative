/* ANIMATIONS — GSAP ScrollTrigger setup */
(function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Default ScrollTrigger defaults
  ScrollTrigger.defaults({
    start: 'top 85%',
    once: true,
  });

  // Fade-in elements
  gsap.utils.toArray('.anim-fade-in').forEach(function (el) {
    gsap.to(el, {
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: el,
    });
  });

  // Slide-up elements
  gsap.utils.toArray('.anim-slide-up').forEach(function (el) {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: el,
    });
  });

  // Stagger children
  gsap.utils.toArray('.anim-stagger-children').forEach(function (parent) {
    const children = parent.children;
    gsap.to(children, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
      stagger: 0.12,
      scrollTrigger: {
        trigger: parent,
        start: 'top 85%',
        once: true,
      },
    });
  });

  // Studio hero entrance — fade content in on load
  const studioContent = document.querySelector('.studio-content');
  if (studioContent) {
    studioContent.style.opacity = '0';
    studioContent.style.transform = 'translateY(30px)';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        studioContent.style.transition = 'opacity 0.9s ease, transform 0.9s ease';
        studioContent.style.opacity = '1';
        studioContent.style.transform = 'translateY(0)';
      });
    });
  }

  // Counter animation for stat numbers
  gsap.utils.toArray('.stat__number[data-count], .stat-card__number[data-count], .stat-item__number[data-count]').forEach(function (el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const obj = { val: 0 };
    el.textContent = '0' + suffix;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: function () {
        gsap.to(obj, {
          val: target,
          duration: 1.8,
          ease: 'power2.out',
          snap: { val: 1 },
          onUpdate: function () {
            el.textContent = Math.round(obj.val) + suffix;
          },
          onComplete: function () {
            el.textContent = target + suffix;
          },
        });
      },
    });
  });

  // Page hero (non-home pages)
  const pageHero = document.querySelector('.page-hero');
  if (pageHero) {
    const tl = gsap.timeline({ delay: 0.15 });
    const label = pageHero.querySelector('.page-hero__label');
    const heading = pageHero.querySelector('h1');
    const sub = pageHero.querySelector('p');
    if (label) tl.from(label, { opacity: 0, x: -20, duration: 0.5, ease: 'power2.out' });
    if (heading) tl.from(heading, { opacity: 0, y: 24, duration: 0.6, ease: 'power2.out' }, '-=0.2');
    if (sub) tl.from(sub, { opacity: 0, y: 16, duration: 0.5, ease: 'power2.out' }, '-=0.2');
  }
})();
