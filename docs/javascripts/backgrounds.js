/* ==========================================================================
   Preem Team — per-tab background switcher
   Adds a pt-bg-* class to <body> based on the current page's top-level nav
   tab, so stylesheets/backgrounds.css can swap in that tab's backdrop image.
   Runs on initial load and on every instant-navigation route change.
   ========================================================================== */
(function () {
  var ROUTES = [
    { test: /\/features\//, cls: "pt-bg-features" },
    { test: /\/installation\//, cls: "pt-bg-installation" },
    { test: /\/guides\//, cls: "pt-bg-guides" },
    { test: /\/changelog\//, cls: "pt-bg-changelog" },
    { test: /\/faq\//, cls: "pt-bg-faq" },
    { test: /\/showcase\//, cls: "pt-bg-showcase" },
    { test: /\/troubleshooting\//, cls: "pt-bg-troubleshooting" },
    { test: /\/team\//, cls: "pt-bg-team" },
    { test: /\/systems\//, cls: "pt-bg-systems" }
  ];
  var ALL_CLASSES = ["pt-bg-home"].concat(ROUTES.map(function (r) { return r.cls; }));

  function applyBackground() {
    var path = window.location.pathname;
    var body = document.body;

    ALL_CLASSES.forEach(function (cls) {
      body.classList.remove(cls);
    });

    var match = null;
    for (var i = 0; i < ROUTES.length; i++) {
      if (ROUTES[i].test.test(path)) {
        match = ROUTES[i];
        break;
      }
    }
    body.classList.add(match ? match.cls : "pt-bg-home");
  }

  if (typeof document$ !== "undefined") {
    // Material's instant-navigation observable — fires on first load too.
    document$.subscribe(applyBackground);
  } else {
    document.addEventListener("DOMContentLoaded", applyBackground);
  }
})();
