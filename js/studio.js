
/* =============================================
   ADJP Creative — Cinematic Studio Hero
   LIGHTS / CAMERA / ACTION — GSAP-powered
   No synthetic beam overlays — the photo's own
   natural light is the only light source.
   ============================================= */
(function () {
  'use strict';

  if (typeof gsap === 'undefined') {
    console.warn('studio.js: GSAP not found');
    return;
  }

  const hero = document.querySelector('.studio-hero');
  if (!hero) return;

  /* ── Element refs ──────────────────────────── */
  const bgImg      = hero.querySelector('.studio-bg__img');
  const bgVideo    = hero.querySelector('.studio-bg__video');
  const loopFade   = hero.querySelector('.studio-bg__loop-fade');
  const overlay    = hero.querySelector('.studio-bg__overlay');
  const line1      = hero.querySelector('.hero-line-1');
  const line2      = hero.querySelector('.hero-line-2');
  const sub        = hero.querySelector('.studio-sub');
  const actions    = hero.querySelector('.studio-actions');
  const scrollInd  = hero.querySelector('.studio-scroll');
  const btns       = hero.querySelectorAll('.lca-btn');

  let masterTl     = null;
  let videoActive  = false;

  /* ── Initial state — fully lit, all content visible ── */
  gsap.set([line1, line2, sub, actions, scrollInd], { opacity: 1, y: 0 });
  gsap.set(bgImg,    { filter: 'brightness(1.00)' });
  gsap.set(overlay,  { opacity: 1 });

  /* ── Helpers ───────────────────────────────── */
  function setActiveBtn(mode) {
    btns.forEach(function (b) {
      var isThis = b.dataset.mode === mode;
      b.classList.toggle('is-active', isThis);
      b.setAttribute('aria-pressed', isThis ? 'true' : 'false');
    });
  }

  function killMaster() {
    if (masterTl) { masterTl.kill(); masterTl = null; }
  }

  /* ── Smooth video loop ─────────────────────── */
  var FADE_BEFORE_END = 0.8;
  var FADE_DURATION   = 0.5;

  function onVideoTimeUpdate() {
    if (!videoActive) return;
    var remaining = bgVideo.duration - bgVideo.currentTime;
    if (remaining <= FADE_BEFORE_END && loopFade.style.opacity < 0.01) {
      gsap.to(loopFade, {
        opacity: 1,
        duration: FADE_DURATION * 0.55,
        ease: 'power1.in',
        onComplete: function () {
          bgVideo.currentTime = 0;
          bgVideo.play();
          gsap.to(loopFade, {
            opacity: 0,
            duration: FADE_DURATION * 0.8,
            ease: 'power1.out'
          });
        }
      });
    }
  }

  bgVideo.addEventListener('timeupdate', onVideoTimeUpdate);

  function showVideo() {
    if (videoActive) return;
    videoActive = true;
    gsap.set(loopFade, { opacity: 0 });
    bgVideo.currentTime = 0;
    bgVideo.play();
    gsap.to(bgVideo, { opacity: 1, duration: 0.7, ease: 'power2.out' });
    gsap.to(bgImg,   { opacity: 0, duration: 0.7, ease: 'power2.out' });
  }

  function hideVideo() {
    videoActive = false;
    gsap.killTweensOf(loopFade);
    gsap.to(loopFade, { opacity: 0, duration: 0.2 });
    gsap.to(bgVideo, {
      opacity: 0, duration: 0.5, ease: 'power2.in',
      onComplete: function () {
        bgVideo.pause();
        bgVideo.currentTime = 0;
      }
    });
    gsap.to(bgImg, { opacity: 1, duration: 0.5, ease: 'power2.in' });
  }

  /* ── LIGHTS ────────────────────────────────── */
  function triggerLights() {
    killMaster();
    setActiveBtn('lights');

    hideVideo();

    masterTl = gsap.timeline();

    masterTl.to([line1, line2, sub, actions, scrollInd], {
      opacity: 0, y: 32, duration: 0.2, ease: 'power2.in'
    }, 0);

    masterTl.to(bgImg, { scale: 1, duration: 0.6, ease: 'power2.inOut' }, 0);

    masterTl
      .to(bgImg, { filter: 'brightness(0.25)', duration: 0.06 }, 0.3)
      .to(bgImg, { filter: 'brightness(0.05)', duration: 0.08 }, '+=0')
      .to(bgImg, { filter: 'brightness(0.55)', duration: 0.07 }, '+=0')
      .to(bgImg, { filter: 'brightness(0.10)', duration: 0.05 }, '+=0')
      .to(bgImg, { filter: 'brightness(0.70)', duration: 0.06 }, '+=0')
      .to(bgImg, { filter: 'brightness(0.30)', duration: 0.07 }, '+=0')
      .to(bgImg, { filter: 'brightness(0.85)', duration: 0.05 }, '+=0')
      .to(bgImg, { filter: 'brightness(0.60)', duration: 0.08 }, '+=0')
      .to(bgImg, { filter: 'brightness(1.00)', duration: 0.35, ease: 'power2.out' }, '+=0');
  }

  /* ── CAMERA ────────────────────────────────── */
  function triggerCamera() {
    killMaster();
    setActiveBtn('camera');

    gsap.set(bgImg, { filter: 'brightness(1.00)', scale: 1 });

    showVideo();

    masterTl = gsap.timeline();

    masterTl.to([sub, actions, scrollInd], {
      opacity: 0, y: 32, duration: 0.22, ease: 'power2.in'
    }, 0);

    masterTl.to(line1, {
      opacity: 1, y: 0, duration: 0.8, ease: 'power3.out'
    }, 0.7);
    masterTl.to(line2, {
      opacity: 1, y: 0, duration: 0.8, ease: 'power3.out'
    }, 0.95);
  }

  /* ── ACTION ────────────────────────────────── */
  function triggerAction() {
    killMaster();
    setActiveBtn('action');

    showVideo();

    gsap.set(bgImg,          { filter: 'brightness(1.00)', scale: 1 });
    gsap.set([line1, line2], { opacity: 1, y: 0 });

    masterTl = gsap.timeline();
    masterTl.to(sub, {
      opacity: 1, y: 0, duration: 0.6, ease: 'power2.out'
    }, 0);
    masterTl.to(actions, {
      opacity: 1, y: 0, duration: 0.6, ease: 'power2.out'
    }, 0.22);
    masterTl.to(scrollInd, {
      opacity: 1, y: 0, duration: 0.5, ease: 'power2.out'
    }, 0.46);
  }

  /* ── Button click handlers ─────────────────── */
  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var mode = btn.dataset.mode;
      if (mode === 'lights') triggerLights();
      if (mode === 'camera') triggerCamera();
      if (mode === 'action') triggerAction();
    });
  });

  /* ── No auto-advance — buttons only ─────────── */
  setActiveBtn(null);

})();
