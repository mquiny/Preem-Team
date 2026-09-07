/* ==========================================================================
   Preem Team — auto-hiding tabs bar
   The "PREEM EDITION" banner (.md-header) stays pinned at the top of the
   page always, at every resolution -- see backgrounds.css. The tabs bar
   underneath it collapses out of the way once the page is scrolled down
   past it, so the banner + page content get the room back, then reappears
   once the user scrolls back up near the top. Hysteresis (two different
   thresholds for hide vs. show) stops it flickering open/closed right at
   one boundary value.
   ========================================================================== */
(function () {
  var HIDE_AT = 220;  // px scrolled before the tabs bar hides
  var SHOW_BELOW = 80; // px scrolled below which it reappears

  var hidden = false;
  var ticking = false;

  function update() {
    ticking = false;
    var tabs = document.querySelector(".md-tabs");
    if (!tabs) return;

    var y = window.scrollY || window.pageYOffset || 0;
    if (!hidden && y > HIDE_AT) {
      tabs.classList.add("pt-tabs-hidden");
      hidden = true;
    } else if (hidden && y < SHOW_BELOW) {
      tabs.classList.remove("pt-tabs-hidden");
      hidden = false;
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  // Re-check on every instant-navigation route change too -- a shorter
  // page can land you scrolled-to-top with the tabs bar still marked
  // hidden from the previous page otherwise.
  if (typeof document$ !== "undefined") {
    document$.subscribe(update);
  } else {
    document.addEventListener("DOMContentLoaded", update);
  }
})();
