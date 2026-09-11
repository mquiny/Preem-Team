/* ==========================================================================
   Preem Team — hover dropdown on the top nav tabs
   Material's tabs bar doesn't render a hover flyout of a section's
   sub-pages by itself (only the left sidebar shows them, and only once
   you're already inside that section) -- this adds one for sections that
   have more than a single page, so e.g. hovering "Installation" from
   anywhere on the site shows every install guide, not just after you've
   clicked into that section.

   SECTIONS below mirrors mkdocs.yml's nav tree by hand (same approach
   backgrounds.js already uses for per-tab background art) -- keep it in
   sync whenever a nav section's sub-pages change. Only sections with
   more than one page get an entry; a tab with no entry here just stays a
   plain link, matching Home/Features/Commands/FAQ which have nothing to
   drop down to.

   Hrefs are relative segments resolved against each tab's OWN href
   (which Material already renders correctly for wherever the site is
   actually deployed -- the apex domain, or a GitHub Pages project
   subpath) via the URL constructor, rather than hardcoding root-relative
   paths that would silently break under a subpath deployment.

   The dropdown is appended to <body> with position:fixed and shown/hidden
   via JS on hover/focus, rather than living inside .md-tabs__item with
   plain CSS :hover -- .md-tabs has overflow:hidden (needed for
   nav-autohide.js's collapse-on-scroll animation), which would silently
   clip a dropdown nested inside it regardless of z-index.
   ========================================================================== */
(function () {
  var SECTIONS = {
    "Installation": [
      { label: "Installing the CPE Collection", href: "" },
      { label: "Updating the CPE Collection", href: "updating_cpe_collection/" },
      { label: "Installing the Subnautica 2 Collection", href: "subnautica2_collection/" },
      { label: "Installing the Expedition 33 Collection", href: "expedition33_collection/" }
    ],
    "Guides": [
      { label: "Guides", href: "" },
      { label: "Clean Install", href: "clean_install/" },
      { label: "First Boot", href: "first_time_boot/" },
      { label: "CET Setup", href: "cet_setup/" },
      { label: "Changing Your Body Mod", href: "changing_body_mod/" },
      { label: "How to Use Ultra Plus Mod", href: "ultra_plus_mod/" },
      { label: "Installing and Using RESHADE", href: "reshade/" },
      { label: "Adding Personal Mods to Preem Edition", href: "adding_personal_mods/" },
      { label: "Character Creation Guide", href: "character_creation/" }
    ],
    "Changelog": [
      { label: "Current Revision", href: "" },
      { label: "Archived Revisions", href: "archive/" }
    ],
    "Showcase": [
      { label: "Showcase", href: "" },
      { label: "Archive", href: "archive/" }
    ],
    "Troubleshooting": [
      { label: "Troubleshooting", href: "" },
      { label: "Common Problems", href: "common_problems/" },
      { label: "How to Bisect", href: "how_to_bisect/" },
      { label: "Issue Viewer", href: "issue_viewer/" },
      { label: "Issue Archive", href: "issue_archive/" },
      { label: "Quick Commands", href: "quick_commands/" }
    ],
    "Meet the Team": [
      { label: "Meet the Team", href: "" },
      { label: "StreetCred Leaderboard", href: "streetcred/" }
    ]
  };

  var HIDE_DELAY_MS = 150; // small grace period so moving the mouse from the tab down into the dropdown doesn't close it first

  // Whichever dropdown is currently open, tracked so a different tab's
  // show() can force it closed immediately -- without this, sweeping the
  // mouse quickly across several tabs left the previous dropdown lingering
  // for its own HIDE_DELAY_MS and overlapping the new one, since each
  // dropdown only knew about its own hide timer.
  var openDropdown = null;

  function hideImmediately(dropdown) {
    dropdown.classList.remove("pt-nav-dropdown--visible");
    if (openDropdown === dropdown) openDropdown = null;
  }

  function buildDropdown(tabHref, entries) {
    var ul = document.createElement("ul");
    ul.className = "pt-nav-dropdown";

    entries.forEach(function (entry) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = new URL(entry.href, tabHref).href;
      a.textContent = entry.label;
      li.appendChild(a);
      ul.appendChild(li);
    });

    document.body.appendChild(ul);
    return ul;
  }

  function positionDropdown(dropdown, tabEl) {
    var rect = tabEl.getBoundingClientRect();
    dropdown.style.top = rect.bottom + "px";
    dropdown.style.left = rect.left + "px";
  }

  function wireUp(li, dropdown) {
    var hideTimer = null;

    function clearHide() {
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
    }

    function show() {
      clearHide();
      if (openDropdown && openDropdown !== dropdown) hideImmediately(openDropdown);
      openDropdown = dropdown;
      positionDropdown(dropdown, li);
      dropdown.classList.add("pt-nav-dropdown--visible");
    }

    function scheduleHide() {
      clearHide();
      hideTimer = setTimeout(function () {
        hideImmediately(dropdown);
      }, HIDE_DELAY_MS);
    }

    li.addEventListener("mouseenter", show);
    li.addEventListener("mouseleave", scheduleHide);
    li.addEventListener("focusin", show);
    li.addEventListener("focusout", scheduleHide);
    dropdown.addEventListener("mouseenter", clearHide);
    dropdown.addEventListener("mouseleave", scheduleHide);

    window.addEventListener("scroll", function () {
      if (dropdown.classList.contains("pt-nav-dropdown--visible")) {
        positionDropdown(dropdown, li);
      }
    }, { passive: true });
  }

  function init() {
    var items = document.querySelectorAll(".md-tabs__item");
    items.forEach(function (li) {
      if (li.dataset.ptDropdownWired) return; // already wired up, don't duplicate

      var link = li.querySelector(".md-tabs__link");
      if (!link) return;

      var entries = SECTIONS[link.textContent.trim()];
      if (!entries) return;

      var dropdown = buildDropdown(link.href, entries);
      wireUp(li, dropdown);
      li.dataset.ptDropdownWired = "true";
    });
  }

  if (typeof document$ !== "undefined") {
    document$.subscribe(init);
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
