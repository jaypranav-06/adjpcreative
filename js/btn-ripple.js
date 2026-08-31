(function () {
  function getMaxRadius(rect, x, y) {
    return Math.ceil(
      2 *
        Math.max(
          Math.hypot(x, y),
          Math.hypot(rect.width - x, y),
          Math.hypot(x, rect.height - y),
          Math.hypot(rect.width - x, rect.height - y)
        )
    );
  }

  function initButton(btn) {
    if (btn.dataset.rippleInit) return;
    btn.dataset.rippleInit = "1";

    // Add overflow:hidden so ripple is clipped
    btn.style.overflow = "hidden";

    const ripple = document.createElement("span");
    ripple.className = "btn__ripple";
    btn.insertBefore(ripple, btn.firstChild);

    // Wrap existing children in .btn__text so they sit above the ripple
    const children = Array.from(btn.childNodes).filter(
      (n) => n !== ripple && !(n.nodeType === 1 && n.classList.contains("btn__text"))
    );
    if (children.length) {
      const textWrap = document.createElement("span");
      textWrap.className = "btn__text";
      children.forEach((c) => textWrap.appendChild(c));
      btn.appendChild(textWrap);
    }

    function showRipple(x, y) {
      if (btn.disabled) return;
      const rect = btn.getBoundingClientRect();
      const diameter = getMaxRadius(rect, x, y);
      ripple.style.width = diameter + "px";
      ripple.style.height = diameter + "px";
      ripple.style.left = x + "px";
      ripple.style.top = y + "px";
      ripple.classList.add("is-active");
      btn.classList.add("btn--ripple-active");
    }

    function hideRipple() {
      ripple.classList.remove("is-active");
      btn.classList.remove("btn--ripple-active");
    }

    // Desktop: hover tracks pointer position
    btn.addEventListener("pointerenter", function (e) {
      if (e.pointerType === "touch") return; // handled by pointerdown on touch
      const rect = btn.getBoundingClientRect();
      showRipple(e.clientX - rect.left, e.clientY - rect.top);
    });

    btn.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      if (!ripple.classList.contains("is-active")) return;
      const rect = btn.getBoundingClientRect();
      ripple.style.left = (e.clientX - rect.left) + "px";
      ripple.style.top = (e.clientY - rect.top) + "px";
    });

    btn.addEventListener("pointerleave", function (e) {
      if (e.pointerType === "touch") return;
      hideRipple();
    });

    // Both desktop + mobile: show fill from exact tap/click point
    btn.addEventListener("pointerdown", function (e) {
      if (btn.disabled || e.button !== 0) return;
      const rect = btn.getBoundingClientRect();
      showRipple(e.clientX - rect.left, e.clientY - rect.top);
    });

    btn.addEventListener("pointerup", function () {
      setTimeout(hideRipple, 220);
    });

    btn.addEventListener("pointercancel", hideRipple);
  }

  function initAll() {
    document
      .querySelectorAll(".btn, .btn-see-more, .mob-header__cta, .mob-nav-cta")
      .forEach(initButton);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }
})();
