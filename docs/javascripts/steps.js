/* ==========================================================================
   Preem Team — collapsible step tracker
   Powers the [data-pt-steps] blocks (currently just docs/installation/index.md):
   each [data-pt-step] is a <details> with a "mark complete" checkbox in its
   <summary>. Checked state is remembered per-page in this browser's
   localStorage, and the [data-pt-progress] bar above step 1 is kept in sync.
   Runs on initial load and on every instant-navigation route change.
   ========================================================================== */
(function () {
  function initStepTrackers(root) {
    var containers = (root || document).querySelectorAll("[data-pt-steps]");

    containers.forEach(function (container) {
      var steps = Array.prototype.slice.call(container.querySelectorAll("[data-pt-step]"));
      if (!steps.length) {
        return;
      }

      var storageKey = "pt-steps:" + window.location.pathname;
      var state = {};
      try {
        state = JSON.parse(window.localStorage.getItem(storageKey) || "{}");
      } catch (e) {
        state = {};
      }

      var progressLabel = container.querySelector("[data-pt-progress-label]");
      var progressFill = container.querySelector("[data-pt-progress-fill]");
      var progressCheck = container.querySelector("[data-pt-progress-check]");

      function persist() {
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(state));
        } catch (e) {
          // Private browsing / storage disabled — progress just won't stick.
        }
      }

      function updateProgress() {
        var total = steps.length;
        var done = steps.filter(function (step) {
          return !!state[step.getAttribute("data-pt-step")];
        }).length;

        if (progressLabel) {
          progressLabel.textContent = done + " / " + total + " steps complete";
        }
        if (progressFill) {
          progressFill.style.width = (total ? (done / total) * 100 : 0) + "%";
        }
        if (progressCheck) {
          progressCheck.checked = total > 0 && done === total;
        }
      }

      steps.forEach(function (step) {
        var id = step.getAttribute("data-pt-step");
        var checkbox = step.querySelector("[data-pt-step-check]");
        if (!checkbox) {
          return;
        }

        var isDone = !!state[id];
        checkbox.checked = isDone;
        step.classList.toggle("is-complete", isDone);

        // Only the checkbox itself marks a step complete. Clicking it
        // shouldn't also expand/collapse the <details> — stop the click
        // before it reaches <summary>'s default toggle behaviour. Clicking
        // anywhere else in the summary (the title, the rest of the banner)
        // is left alone, so it falls through to the normal expand/collapse.
        checkbox.addEventListener("click", function (e) {
          e.stopPropagation();
        });

        checkbox.addEventListener("change", function () {
          state[id] = checkbox.checked;
          step.classList.toggle("is-complete", checkbox.checked);
          persist();
          updateProgress();
        });
      });

      updateProgress();
    });
  }

  if (typeof document$ !== "undefined") {
    // Material's instant-navigation observable — fires on first load too.
    document$.subscribe(function () {
      initStepTrackers(document);
    });
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      initStepTrackers(document);
    });
  }
})();
