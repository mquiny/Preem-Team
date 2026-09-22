/* ==========================================================================
   Preem Team — auto-hiding navbar
   The whole header (logo, tabs, search, Discord, CTA -- one merged row,
   see overrides/partials/header.html) collapses out of the way once the
   page is scrolled down past it, giving page content the room back, then
   reappears once the user scrolls back up near the top -- including via
   Material's own "back to top" button (navigation.top in mkdocs.yml),
   since clicking it scrolls to y=0 and that alone satisfies the reveal
   condition below, no separate wiring needed.

   Previously this only targeted the separate tabs row underneath a
   permanently-pinned banner; now that they're one merged row there's just
   one thing to hide/show. Hysteresis (two different thresholds for hide
   vs. show) stops it flickering open/closed right at one boundary value.
   ========================================================================== */
(function () {
  var HIDE_AT = 220;  // px scrolled before the header hides
  var SHOW_BELOW = 80; // px scrolled below which it reappears

  var hidden = false;
  var ticking = false;

  function update() {
    ticking = false;
    var header = document.querySelector(".md-header");
    if (!header) return;

    var y = window.scrollY || window.pageYOffset || 0;
    if (!hidden && y > HIDE_AT) {
      header.classList.add("pt-header-hidden");
      hidden = true;
    } else if (hidden && y < SHOW_BELOW) {
      header.classList.remove("pt-header-hidden");
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
  // page can land you scrolled-to-top with the header still marked
  // hidden from the previous page otherwise.
  if (typeof document$ !== "undefined") {
    document$.subscribe(update);
  } else {
    document.addEventListener("DOMContentLoaded", update);
  }
})();
