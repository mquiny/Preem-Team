/* ==========================================================================
   Preem Team — scroll fallback for the merged navbar's tab links
   .pt-header-tabs-slot (see backgrounds.css) lets the tab list scroll
   horizontally when 11 sections don't fit next to the logo/search/
   Discord/CTA in one row -- confirmed via a real report: in a narrow
   preview pane (editor + browser side by side, well under a full desktop
   width), the row was simply clipped with no visible sign anything was
   cut off or scrollable, since a bare `overflow-x: auto` with no
   scrollbar gives zero discoverability on its own.

   This adds two things, both conditional on the list actually
   overflowing (checked on load and on resize, since the same page can
   cross that threshold either way as a window/pane is resized):
   - Small prev/next buttons that scroll the list, appearing only on
     whichever side still has more to reveal.
   - An edge fade (mask-image, applied in backgrounds.css keyed off the
     classes this sets) so it's visually obvious there's more before you
     even reach for a button.
   ========================================================================== */
(function () {
  var PREV_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 6-6 6 6 6"/></svg>';
  var NEXT_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 6 6 6-6 6"/></svg>';
  var SCROLL_STEP = 160;

  function setupOne(slot) {
    if (slot.dataset.ptScrollWired) return;
    slot.dataset.ptScrollWired = "true";

    var list = slot.querySelector(".md-tabs__list");
    if (!list) return;

    var prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "pt-tabs-scroll-btn pt-tabs-scroll-btn--prev";
    prevBtn.setAttribute("aria-label", "Scroll navigation left");
    prevBtn.innerHTML = PREV_SVG;

    var nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "pt-tabs-scroll-btn pt-tabs-scroll-btn--next";
    nextBtn.setAttribute("aria-label", "Scroll navigation right");
    nextBtn.innerHTML = NEXT_SVG;

    slot.appendChild(prevBtn);
    slot.appendChild(nextBtn);

    function update() {
      var overflowing = list.scrollWidth > list.clientWidth + 1;
      slot.classList.toggle("pt-tabs-overflowing", overflowing);
      slot.classList.toggle("pt-tabs-at-start", list.scrollLeft <= 1);
      slot.classList.toggle("pt-tabs-at-end", list.scrollLeft + list.clientWidth >= list.scrollWidth - 1);
    }

    prevBtn.addEventListener("click", function () {
      list.scrollBy({ left: -SCROLL_STEP, behavior: "smooth" });
    });
    nextBtn.addEventListener("click", function () {
      list.scrollBy({ left: SCROLL_STEP, behavior: "smooth" });
    });

    list.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  function setup() {
    document.querySelectorAll(".pt-header-tabs-slot").forEach(setupOne);
  }

  if (typeof document$ !== "undefined") {
    document$.subscribe(setup);
  } else {
    document.addEventListener("DOMContentLoaded", setup);
  }
})();
