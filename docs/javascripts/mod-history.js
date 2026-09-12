/* ==========================================================================
   Preem Team — Mod History (Added / Removed)
   Fetches assets/mod-history.json (maintained by
   scripts/generate-spawn-commands.js -- see that file's recordModHistory()
   for how entries get logged) and renders two simple tables. Small,
   append-only dataset -- no search/filter needed, unlike spawn-commands.js.
   ========================================================================== */
(function () {
  function revisionLabel(entry, kind) {
    if (entry.revisionConfirmed) {
      return (kind === "added" ? "Added in " : "Removed in ") + entry.revisionConfirmed;
    }
    if (entry.scanRevision) {
      return (kind === "added"
        ? "Confirmed present as of " + entry.scanRevision
        : "No longer present as of " + entry.scanRevision) + " (exact revision uncertain)";
    }
    return "Revision unknown";
  }

  function buildRow(entry, kind) {
    const tr = document.createElement("tr");

    const nameTd = document.createElement("td");
    if (entry.url) {
      const link = document.createElement("a");
      link.href = entry.url;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = entry.name;
      nameTd.appendChild(link);
    } else {
      nameTd.textContent = entry.name;
    }
    tr.appendChild(nameTd);

    const revisionTd = document.createElement("td");
    revisionTd.textContent = revisionLabel(entry, kind);
    tr.appendChild(revisionTd);

    const dateTd = document.createElement("td");
    dateTd.textContent = entry.dateDetected || "—";
    tr.appendChild(dateTd);

    return tr;
  }

  function renderTable(container, entries, kind, emptyText) {
    container.innerHTML = "";

    if (!entries || entries.length === 0) {
      const empty = document.createElement("p");
      empty.className = "pt-spawn-empty";
      empty.textContent = emptyText;
      container.appendChild(empty);
      return;
    }

    const sorted = entries.slice().sort((a, b) => (b.dateDetected || "").localeCompare(a.dateDetected || ""));

    const table = document.createElement("table");
    table.className = "pt-mod-history-table";
    const thead = document.createElement("thead");
    thead.innerHTML = "<tr><th>Mod</th><th>Revision</th><th>Detected</th></tr>";
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    sorted.forEach((entry) => tbody.appendChild(buildRow(entry, kind)));
    table.appendChild(tbody);

    container.appendChild(table);
  }

  function init() {
    const addedContainer = document.getElementById("pt-mod-history-added");
    const removedContainer = document.getElementById("pt-mod-history-removed");
    if (!addedContainer && !removedContainer) return;

    const dataUrl = (addedContainer || removedContainer).getAttribute("data-src");
    if (!dataUrl) return;

    fetch(dataUrl)
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        if (addedContainer) renderTable(addedContainer, data.added, "added", "No additions logged yet.");
        if (removedContainer) renderTable(removedContainer, data.removed, "removed", "No removals logged yet.");
      })
      .catch(function (err) {
        [addedContainer, removedContainer].forEach(function (el) {
          if (!el) return;
          el.innerHTML = "";
          const errorEl = document.createElement("p");
          errorEl.className = "pt-spawn-empty";
          errorEl.textContent = "Could not load mod history.";
          el.appendChild(errorEl);
        });
        console.error("[MOD_HISTORY] Failed to load data:", err);
      });
  }

  if (typeof document$ !== "undefined") {
    document$.subscribe(init);
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
