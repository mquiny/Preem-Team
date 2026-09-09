/* ==========================================================================
   Preem Team — feature category card -> popup modal
   Same pattern as javascripts/changelog.js: clicking a .pt-feature-category
   opens the matching <dialog> instead of scrolling to it inline. Event
   delegation on `document` itself (never replaced by Material's
   instant-navigation page swaps), so this only needs to run once.

   Only one .pt-feature-modal-entry per dialog is ever shown at a time,
   with prev/next controls to page between a category's mods -- and
   crucially, an entry's <img> only gets its real `src` set (from
   data-src) the first time it's actually paged to. loading="lazy" alone
   doesn't help here since the whole dialog is already within the
   viewport once opened; without this, a category with 3-4 heavy AVIF
   clips loaded every single one of them the moment it was opened, which
   was grinding mobile devices to a halt.
   ========================================================================== */
(function () {
  function getEntries(dialog) {
    return Array.prototype.slice.call(dialog.querySelectorAll(".pt-feature-modal-entry"));
  }

  function loadEntryImages(entry) {
    var imgs = entry.querySelectorAll("img[data-src]");
    imgs.forEach(function (img) {
      img.src = img.getAttribute("data-src");
      img.removeAttribute("data-src");
    });
  }

  function showEntry(dialog, index) {
    var entries = getEntries(dialog);
    if (entries.length === 0) return;

    var wrapped = ((index % entries.length) + entries.length) % entries.length;

    entries.forEach(function (entry, i) {
      entry.classList.toggle("pt-feature-modal-entry--active", i === wrapped);
    });

    loadEntryImages(entries[wrapped]);
    dialog.dataset.ptFeatureIndex = String(wrapped);

    var countEl = dialog.querySelector("[data-pt-feature-count]");
    if (countEl) {
      countEl.textContent = (wrapped + 1) + " / " + entries.length;
    }

    var nav = dialog.querySelector(".pt-feature-modal-nav");
    if (nav) {
      nav.hidden = entries.length <= 1;
    }
  }

  document.addEventListener("click", function (e) {
    var opener = e.target.closest("[data-pt-feature-open]");
    if (opener) {
      var dialog = document.getElementById(opener.getAttribute("data-pt-feature-open"));
      if (dialog && typeof dialog.showModal === "function") {
        dialog.showModal();
        showEntry(dialog, 0);
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

    var prevBtn = e.target.closest("[data-pt-feature-prev]");
    if (prevBtn) {
      var prevDialog = prevBtn.closest("dialog");
      if (prevDialog) {
        var prevIndex = Number(prevDialog.dataset.ptFeatureIndex || 0) - 1;
        showEntry(prevDialog, prevIndex);
      }
      return;
    }

    var nextBtn = e.target.closest("[data-pt-feature-next]");
    if (nextBtn) {
      var nextDialog = nextBtn.closest("dialog");
      if (nextDialog) {
        var nextIndex = Number(nextDialog.dataset.ptFeatureIndex || 0) + 1;
        showEntry(nextDialog, nextIndex);
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
