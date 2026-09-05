/* ==========================================================================
   Preem Team — changelog card -> popup modal
   Clicking a .pt-changelog-card opens the matching <dialog> instead of
   navigating anywhere or scrolling to it. Uses event delegation on
   `document` itself (never replaced by Material's instant-navigation page
   swaps), so this only needs to run once — no per-navigation re-binding
   needed, unlike backgrounds.js/steps.js which query specific elements.
   ========================================================================== */
(function () {
  document.addEventListener("click", function (e) {
    var opener = e.target.closest("[data-pt-changelog-open]");
    if (opener) {
      var dialog = document.getElementById(opener.getAttribute("data-pt-changelog-open"));
      if (dialog && typeof dialog.showModal === "function") {
        dialog.showModal();
      }
      return;
    }

    var closer = e.target.closest("[data-pt-changelog-close]");
    if (closer) {
      var openDialog = closer.closest("dialog");
      if (openDialog) {
        openDialog.close();
      }
      return;
    }

    // A click landing on the <dialog> element itself (not inside the inner
    // content wrapper) is a click on its backdrop area — close on that too.
    if (e.target.tagName === "DIALOG" && e.target.classList.contains("pt-changelog-modal")) {
      e.target.close();
    }
  });
})();
