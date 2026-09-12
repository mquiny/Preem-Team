/* ==========================================================================
   Preem Team — Config Version History
   Fetches assets/version-history.json (built by
   scripts/diff_config_versions.py -- see that file for how) and renders
   one collapsible section per version transition, newest first. Small,
   append-only dataset -- no search needed, unlike spawn-commands.js.
   ========================================================================== */
(function () {
  function buildSettingsTable(settingsChanged) {
    const table = document.createElement("table");
    table.className = "pt-config-history-table";
    const thead = document.createElement("thead");
    thead.innerHTML = "<tr><th>Mod</th><th>Setting</th><th>Before</th><th>After</th></tr>";
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    settingsChanged.forEach(function (c) {
      const tr = document.createElement("tr");
      [c.mod, c.setting, String(c.before), String(c.after)].forEach(function (text, i) {
        const td = document.createElement("td");
        td.textContent = text;
        if (i === 1) td.className = "pt-config-history-setting";
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    return table;
  }

  function buildModList(names, className) {
    const ul = document.createElement("ul");
    ul.className = className;
    names.forEach(function (name) {
      const li = document.createElement("li");
      li.textContent = name;
      ul.appendChild(li);
    });
    return ul;
  }

  function buildEntry(entry) {
    const details = document.createElement("details");
    details.className = "pt-config-history-entry";

    const summary = document.createElement("summary");
    const totalChanges = entry.modsAdded.length + entry.modsRemoved.length + entry.settingsChanged.length;
    summary.innerHTML =
      '<span class="pt-config-history-version">' + entry.version + "</span>" +
      '<span class="pt-config-history-meta">from ' + entry.previousVersion + " · " +
      totalChanges + (totalChanges === 1 ? " change" : " changes") + "</span>";
    details.appendChild(summary);

    const body = document.createElement("div");
    body.className = "pt-config-history-body";

    if (entry.modsAdded.length > 0) {
      const h = document.createElement("h4");
      h.className = "pt-config-history-h-added";
      h.textContent = "Added";
      body.appendChild(h);
      body.appendChild(buildModList(entry.modsAdded, "pt-config-history-list"));
    }

    if (entry.modsRemoved.length > 0) {
      const h = document.createElement("h4");
      h.className = "pt-config-history-h-removed";
      h.textContent = "Removed";
      body.appendChild(h);
      body.appendChild(buildModList(entry.modsRemoved, "pt-config-history-list"));
    }

    if (entry.settingsChanged.length > 0) {
      const h = document.createElement("h4");
      h.textContent = "Settings changed";
      body.appendChild(h);
      body.appendChild(buildSettingsTable(entry.settingsChanged));
    }

    if (totalChanges === 0) {
      const p = document.createElement("p");
      p.className = "pt-spawn-empty";
      p.textContent = "No tracked changes in this release.";
      body.appendChild(p);
    }

    details.appendChild(body);
    return details;
  }

  function init() {
    const container = document.getElementById("pt-config-history");
    if (!container) return;

    const dataUrl = container.getAttribute("data-src");
    if (!dataUrl) return;

    container.textContent = "Loading…";

    fetch(dataUrl)
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        container.innerHTML = "";
        if (!data || data.length === 0) {
          const empty = document.createElement("p");
          empty.className = "pt-spawn-empty";
          empty.textContent = "No version history recorded yet.";
          container.appendChild(empty);
          return;
        }
        data.slice().reverse().forEach(function (entry) {
          container.appendChild(buildEntry(entry));
        });
      })
      .catch(function (err) {
        container.innerHTML = "";
        const errorEl = document.createElement("p");
        errorEl.className = "pt-spawn-empty";
        errorEl.textContent = "Could not load config version history.";
        container.appendChild(errorEl);
        console.error("[CONFIG_VERSION_HISTORY] Failed to load data:", err);
      });
  }

  if (typeof document$ !== "undefined") {
    document$.subscribe(init);
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
