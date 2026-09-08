/* ==========================================================================
   Preem Team — Spawn Commands directory
   Fetches assets/spawn_commands.json (generated locally by
   scripts/generate-spawn-commands.js -- see that file's header for how)
   and renders a searchable, collapsible list. One <details> per mod;
   its command list is only built and inserted into the DOM the first
   time that mod's <details> is actually opened, so ~200 mods and ~7700
   commands total don't all sit in the page on load. Search matches
   against the full data in memory regardless of what's currently
   rendered/expanded, so searching by a command that's in a collapsed
   mod still finds it.
   ========================================================================== */
(function () {
  var container = null;
  var input = null;
  var countEl = null;
  var allMods = [];
  var loaded = false;

  function normalize(text) {
    return (text || "").toLowerCase();
  }

  function modMatches(mod, query) {
    if (!query) return true;
    if (normalize(mod.name).indexOf(query) !== -1) return true;
    if (mod.author && normalize(mod.author).indexOf(query) !== -1) return true;
    if (mod.aliases && mod.aliases.some(function (a) { return normalize(a).indexOf(query) !== -1; })) return true;
    return mod.commands.some(function (c) { return normalize(c).indexOf(query) !== -1; });
  }

  function buildModCard(mod) {
    var details = document.createElement("details");
    details.className = "pt-spawn-mod";

    var summary = document.createElement("summary");

    var nameSpan = document.createElement("span");
    nameSpan.className = "pt-spawn-mod-name";
    nameSpan.textContent = mod.name;
    summary.appendChild(nameSpan);

    var metaSpan = document.createElement("span");
    metaSpan.className = "pt-spawn-mod-meta";
    var bits = [];
    if (mod.author) bits.push(mod.author);
    bits.push(mod.commands.length + (mod.commands.length === 1 ? " command" : " commands"));
    metaSpan.textContent = bits.join(" · ");
    summary.appendChild(metaSpan);

    details.appendChild(summary);

    var body = document.createElement("div");
    body.className = "pt-spawn-mod-body";

    var actions = document.createElement("div");
    actions.className = "pt-spawn-mod-actions";

    if (mod.url) {
      var link = document.createElement("a");
      link.href = mod.url;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "View on Nexus";
      actions.appendChild(link);
    }

    var copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "pt-spawn-copy-btn";
    copyBtn.textContent = "Copy all";
    copyBtn.addEventListener("click", function () {
      var text = mod.commands.join("\n");
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        copyBtn.textContent = "Copy unsupported";
        return;
      }
      navigator.clipboard.writeText(text).then(
        function () {
          copyBtn.textContent = "Copied!";
          setTimeout(function () { copyBtn.textContent = "Copy all"; }, 1500);
        },
        function () {
          copyBtn.textContent = "Copy failed";
          setTimeout(function () { copyBtn.textContent = "Copy all"; }, 1500);
        }
      );
    });
    actions.appendChild(copyBtn);

    body.appendChild(actions);
    details.appendChild(body);

    var rendered = false;
    details.addEventListener("toggle", function () {
      if (details.open && !rendered) {
        var pre = document.createElement("pre");
        pre.className = "pt-spawn-commands";
        pre.textContent = mod.commands.join("\n");
        body.appendChild(pre);
        rendered = true;
      }
    });

    return details;
  }

  function render(mods) {
    container.innerHTML = "";

    if (mods.length === 0) {
      var empty = document.createElement("p");
      empty.className = "pt-spawn-empty";
      empty.textContent = "No mods matched that search.";
      container.appendChild(empty);
    } else {
      mods.forEach(function (mod) {
        container.appendChild(buildModCard(mod));
      });
    }

    if (countEl) {
      countEl.textContent = mods.length + (mods.length === 1 ? " mod" : " mods") + " with spawn commands";
    }
  }

  function applyFilter() {
    var query = normalize(input.value.trim());
    render(allMods.filter(function (mod) { return modMatches(mod, query); }));
  }

  function init() {
    container = document.getElementById("pt-spawn-results");
    input = document.getElementById("pt-spawn-search");
    countEl = document.getElementById("pt-spawn-count");
    if (!container || !input) return;

    if (loaded) {
      // Instant-navigation route change back to this page -- data's
      // already in memory, just re-render and re-bind to the fresh DOM.
      render(allMods);
      input.addEventListener("input", applyFilter);
      return;
    }

    var dataUrl = container.getAttribute("data-src");
    if (!dataUrl) return;

    container.textContent = "Loading…";

    fetch(dataUrl)
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        allMods = data;
        loaded = true;
        render(allMods);
        input.addEventListener("input", applyFilter);
      })
      .catch(function (err) {
        container.innerHTML = "";
        var errorEl = document.createElement("p");
        errorEl.className = "pt-spawn-empty";
        errorEl.textContent = "Could not load the spawn command directory.";
        container.appendChild(errorEl);
        console.error("[SPAWN_COMMANDS] Failed to load data:", err);
      });
  }

  if (typeof document$ !== "undefined") {
    document$.subscribe(init);
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
