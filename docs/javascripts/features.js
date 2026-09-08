/* ==========================================================================
   Preem Team — feature category card -> popup modal
   Same pattern as javascripts/changelog.js: clicking a .pt-feature-category
   opens the matching <dialog> instead of scrolling to it inline. Event
   delegation on `document` itself (never replaced by Material's
   instant-navigation page swaps), so this only needs to run once.
   ========================================================================== */
(function () {
  document.addEventListener("click", function (e) {
    var opener = e.target.closest("[data-pt-feature-open]");
    if (opener) {
      var dialog = document.getElementById(opener.getAttribute("data-pt-feature-open"));
      if (dialog && typeof dialog.showModal === "function") {
        dialog.showModal();
      }
      return;
    }

    var closer = e.target.closest("[data-pt-feature-close]");
    if (closer) {
      var openDialog = closer.closest("dialog");
      if (openDialog) {
        openDialog.close();
      }
      return;
    }

    // A click landing on the <dialog> element itself (not inside the inner
    // content wrapper) is a click on its backdrop area — close on that too.
    if (e.target.tagName === "DIALOG" && e.target.classList.contains("pt-feature-modal")) {
      e.target.close();
    }
  });
})();
