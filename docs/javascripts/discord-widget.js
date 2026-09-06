/* ==========================================================================
   Preem Team — floating Discord server widget
   Fixed panel docked to the right of the page (stylesheets/discord-widget.css
   hides it below a width where there's no real free space for it). Shows
   placeholder member/online numbers until assets/discord-stats.json exists
   — that file is meant to be written periodically by the Discord bot
   (guild.memberCount + presence count), same repository_dispatch pattern
   as the changelog/showcase integrations. Not wired up yet: this just
   reads the file if it's there and quietly keeps the placeholders if not.
   ========================================================================== */
(function () {
  var INVITE_URL = "https://discord.gg/QvYzYZFmnE";

  // Resolve asset paths relative to *this script's own* location rather
  // than the current page's URL — the page can be nested arbitrarily deep
  // (e.g. /troubleshooting/issue_viewer/), but this file always sits next
  // to docs/assets/ regardless of which page loaded it.
  var SCRIPT_URL = document.currentScript && document.currentScript.src;

  function assetUrl(relativePath) {
    if (!SCRIPT_URL) return relativePath; // best-effort fallback
    return new URL("../" + relativePath, SCRIPT_URL).toString();
  }

  var GAP = 24; // px between the TOC rail (or viewport edge) and the widget
  var MIN_ROOM = 16; // px of slack required beyond the widget's own width

  function ensureWidget() {
    var el = document.querySelector(".pt-discord-widget");
    if (!el) {
      el = document.createElement("a");
      el.className = "pt-discord-widget";
      el.href = INVITE_URL;
      el.target = "_blank";
      el.rel = "noopener";
      el.innerHTML = [
        '<img class="pt-discord-widget-banner" src="' + assetUrl("assets/bannercroppedpreem.png") + '" alt="">',
        '<div class="pt-discord-widget-body">',
        '<div class="pt-discord-widget-name">Preem Team</div>',
        '<div class="pt-discord-widget-stats">',
        '<span class="pt-discord-widget-stat" data-pt-member-count>12,458 members</span>',
        '<span class="pt-discord-widget-stat"><span class="pt-discord-widget-dot"></span><span data-pt-online-count>312 online</span></span>',
        '</div>',
        '</div>'
      ].join("");
      document.body.appendChild(el);
      loadStats(el);

      var reposition = function () { positionWidget(el); };
      window.addEventListener("resize", debounce(reposition, 150));
    }
    positionWidget(el);
  }

  // Docks the widget flush right of wherever the TOC rail (or, on a page
  // with no TOC, the main content column) actually ends — rather than a
  // fixed CSS offset, which broke as soon as root font-size wasn't the
  // 16px this was first eyeballed against. Hides itself entirely if that
  // leaves less room than the widget needs, instead of ever overlapping
  // real content.
  function positionWidget(el) {
    var anchor = document.querySelector(".md-sidebar--secondary") || document.querySelector(".md-content");
    if (!anchor) {
      el.style.display = "none";
      return;
    }

    var anchorRight = anchor.getBoundingClientRect().right;
    var widgetWidth = el.offsetWidth; // reliable even while visibility: hidden
    var left = anchorRight + GAP;
    var room = window.innerWidth - left - widgetWidth;

    if (room < MIN_ROOM) {
      el.style.visibility = "hidden";
      el.style.pointerEvents = "none";
      return;
    }

    el.style.left = left + "px";
    el.style.right = "auto";
    el.style.visibility = "visible";
    el.style.pointerEvents = "auto";
  }

  function debounce(fn, wait) {
    var timer;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(fn, wait);
    };
  }

  function loadStats(el) {
    fetch(assetUrl("assets/discord-stats.json"), { cache: "no-store" })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        if (!data) return;
        var memberEl = el.querySelector("[data-pt-member-count]");
        var onlineEl = el.querySelector("[data-pt-online-count]");
        if (memberEl && typeof data.member_count === "number") {
          memberEl.textContent = data.member_count.toLocaleString() + " members";
        }
        if (onlineEl && typeof data.online_count === "number") {
          onlineEl.textContent = data.online_count.toLocaleString() + " online";
        }
      })
      .catch(function () {
        /* stats file doesn't exist yet — keep the placeholder numbers */
      });
  }

  if (typeof document$ !== "undefined") {
    // Material's instant-navigation observable — fires on first load too.
    document$.subscribe(ensureWidget);
  } else {
    document.addEventListener("DOMContentLoaded", ensureWidget);
  }
})();
