#!/usr/bin/env node
// Applies an incoming changelog payload (fired by ncrbot's
// utils/siteChangelogDispatcher.js as a `repository_dispatch` event) to
// docs/changelog/index.md + archive.md, following the process defined in
// docs/changelog/template.md.
//
// Multiple collections are tracked independently: each has its own
// collapsible section (a <details class="pt-changelog-collection">) on
// both index.md and archive.md, keyed by collection_slug. Posting an
// update for one collection only ever touches that collection's own
// section — every other collection's section is left untouched. On
// index.md, that section holds exactly one "current" card+popup, expanded
// by default. On archive.md, it holds every past release for that
// collection, newest first.
//
// Invoked by .github/workflows/changelog-dispatch.yml with the payload
// JSON in the CHANGELOG_PAYLOAD env var.
//
// Payload fields: collection_slug, version, game_version, date, author,
// source_channel, added_items, updated_items, removed_items (each a
// pre-built Markdown bullet list, or "" if that category is empty).

const fs = require("fs");
const path = require("path");

const INDEX_PATH = path.join(__dirname, "..", "docs", "changelog", "index.md");
const ARCHIVE_PATH = path.join(__dirname, "..", "docs", "changelog", "archive.md");

const CURRENT_GRID_START = "<!-- CHANGELOG:CURRENT:START -->";
const CURRENT_GRID_END = "<!-- CHANGELOG:CURRENT:END -->";
const ARCHIVE_GRID_START = "<!-- CHANGELOG:ENTRIES:START -->";
const ARCHIVE_GRID_END = "<!-- CHANGELOG:ENTRIES:END -->";

// Collection slug -> thumbnail filename in docs/changelog/assets/. Add a
// line here (and drop the image in that folder) whenever a new collection
// starts posting to the site. A slug with no entry here just gets a
// text-only card — nothing breaks, it's purely cosmetic.
const COLLECTION_IMAGES = {
  usushu: "cpe.webp",
  "9htmlb": "sub2.webp",
  jzmqt4: "e33.webp"
};

// Collection slug -> display name used as the <summary> label on its
// collapsible section. A slug with no entry here just falls back to the
// raw slug — nothing breaks, it's purely cosmetic.
const COLLECTION_NAMES = {
  usushu: "CPE Collection",
  "9htmlb": "Subnautica 2 Reborn",
  jzmqt4: "Expedition 33"
};

function collectionLabel(slug) {
  return COLLECTION_NAMES[slug] || slug;
}

function readPayload() {
  const raw = process.env.CHANGELOG_PAYLOAD;
  if (!raw) {
    throw new Error("CHANGELOG_PAYLOAD env var is empty");
  }
  return JSON.parse(raw);
}

function slugify(str) {
  const slug = String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug || "entry";
}

function entryMarkers(slug) {
  return {
    start: `<!-- CHANGELOG:CURRENT:ENTRY:${slug}:START -->`,
    end: `<!-- CHANGELOG:CURRENT:ENTRY:${slug}:END -->`
  };
}

function archivePrependMarker(slug) {
  return `<!-- CHANGELOG:ARCHIVE:${slug}:PREPEND_HERE -->`;
}

function buildChipsHtml(payload) {
  const chips = [];
  if (payload.added_items) chips.push('<span class="pt-chip pt-chip--added">Added</span>');
  if (payload.updated_items) chips.push('<span class="pt-chip pt-chip--updated">Updated</span>');
  if (payload.removed_items) chips.push('<span class="pt-chip pt-chip--removed">Removed</span>');
  return chips.join("\n");
}

// Headings get an attr_list class so Added/Removed can be colour-coded —
// see docs/stylesheets/changelog.css. "Updated" needs no class: h3s are
// already yellow site-wide.
function buildSection(heading, items, headingClass) {
  if (!items) return "";
  const headingLine = headingClass ? `### ${heading} {: .${headingClass} }` : `### ${heading}`;
  return `${headingLine}\n\n${items}\n\n`;
}

function buildModalBody(payload) {
  let body = `## ${payload.version}\n\n`;
  body += `${buildChipsHtml(payload)}\n\n`;
  body += `\`${payload.date}\` · Game Version \`${payload.game_version}\` · Posted by **${payload.author}** · Synced from \`${payload.source_channel}\`\n\n`;
  body += buildSection("Added", payload.added_items, "pt-changelog-h-added");
  body += buildSection("Updated", payload.updated_items, null);
  body += buildSection("Removed", payload.removed_items, "pt-changelog-h-removed");
  return body.trim();
}

// Returns one collection's card <button> + <dialog> pair as a single
// markdown="1"-ready HTML fragment, NOT wrapped in its own entry markers
// (the caller adds those, since index.md and archive.md wrap entries
// differently — index.md keys them by slug, archive.md doesn't need to).
// Both button and dialog need markdown="1" on themselves, not just the
// innermost div — md_in_html treats a whole subtree as opaque raw HTML
// the moment it hits an ancestor without that attribute, any depth deep.
function buildCardAndDialog(payload, dialogId) {
  const thumbFile = COLLECTION_IMAGES[payload.collection_slug];
  const thumbImg = thumbFile
    ? `<img class="pt-changelog-card-thumb" src="assets/${thumbFile}" alt="">`
    : "";

  const card = [
    `<button type="button" class="pt-changelog-card" data-pt-changelog-open="${dialogId}">`,
    thumbImg,
    `<span class="pt-changelog-card-body">`,
    `<span class="pt-changelog-card-version">${payload.version}</span>`,
    `<span class="pt-changelog-card-date">${payload.date} · CP2077 ${payload.game_version}</span>`,
    `<span class="pt-changelog-card-chips">${buildChipsHtml(payload)}</span>`,
    `</span>`,
    `</button>`
  ].filter(Boolean).join("\n");

  const dialog = [
    `<dialog class="pt-changelog-modal" id="${dialogId}" markdown="1">`,
    `<div class="pt-changelog-modal-inner" markdown="1">`,
    ``,
    `<button type="button" class="pt-changelog-modal-close" data-pt-changelog-close aria-label="Close changelog">×</button>`,
    ``,
    buildModalBody(payload),
    ``,
    `</div>`,
    `</dialog>`
  ].join("\n");

  return `${card}\n\n${dialog}`;
}

// Wraps a collection's card grid in its own collapsible <details> section,
// labelled via COLLECTION_NAMES. Starts collapsed on both index.md and
// archive.md -- visitors open whichever collection they actually want to
// read. `innerHtml` is whatever markers/entries go inside the grid div.
function buildCollectionSection(slug, innerHtml) {
  return [
    `<details class="pt-changelog-collection" markdown="1" data-collection-slug="${slug}">`,
    `<summary>${collectionLabel(slug)}</summary>`,
    `<div class="pt-changelog-cards" markdown="1">`,
    ``,
    innerHtml,
    ``,
    `</div>`,
    `</details>`
  ].join("\n");
}

// Finds `<!-- MARKER:START -->...<!-- MARKER:END -->` (inclusive) inside
// `content`, returning null if not present.
function findMarkedBlock(content, start, end) {
  const startIdx = content.indexOf(start);
  if (startIdx === -1) return null;
  const endIdx = content.indexOf(end, startIdx);
  if (endIdx === -1) return null;
  return {
    block: content.slice(startIdx, endIdx + end.length),
    startIdx,
    endIdx: endIdx + end.length
  };
}

function main() {
  const payload = readPayload();
  const slug = payload.collection_slug;
  if (!slug) {
    throw new Error("Payload is missing collection_slug");
  }

  let indexContent = fs.readFileSync(INDEX_PATH, "utf8");
  let archiveContent = fs.readFileSync(ARCHIVE_PATH, "utf8");

  const grid = findMarkedBlock(indexContent, CURRENT_GRID_START, CURRENT_GRID_END);
  if (!grid) {
    throw new Error("Could not find CHANGELOG:CURRENT markers in changelog/index.md");
  }

  const { start: entryStart, end: entryEnd } = entryMarkers(slug);
  const existingEntry = findMarkedBlock(indexContent, entryStart, entryEnd);

  const dialogId = `changelog-current-${slug}`;
  const newEntryInner = buildCardAndDialog(payload, dialogId);
  const newEntryBlock = `${entryStart}\n${newEntryInner}\n${entryEnd}`;

  let archivedEntryForThisSlug = null;

  if (existingEntry) {
    // This collection already has a card (and therefore already has its own
    // collapsible section) — pull its old card out to archive, then swap in
    // the fresh one in the exact same spot. The surrounding <details> for
    // this collection is untouched.
    const versionMatch = existingEntry.block.match(/<span class="pt-changelog-card-version">([^<]+)<\/span>/);
    const oldVersion = versionMatch ? versionMatch[1] : "entry";
    // Guard against two archived entries ending up with the same id (e.g.
    // a collection re-posted with an identical version string while
    // testing) -- that would break click-to-open for whichever one isn't
    // first, since both a <button> and a <dialog> would share one id.
    let archiveDialogId = `changelog-${slugify(oldVersion)}`;
    let suffix = 2;
    while (archiveContent.includes(`id="${archiveDialogId}"`)) {
      archiveDialogId = `changelog-${slugify(oldVersion)}-${suffix}`;
      suffix += 1;
    }

    let oldInner = existingEntry.block
      .replace(entryStart, "")
      .replace(entryEnd, "")
      .trim();
    archivedEntryForThisSlug = oldInner.split(dialogId).join(archiveDialogId);

    indexContent =
      indexContent.slice(0, existingEntry.startIdx) +
      newEntryBlock +
      indexContent.slice(existingEntry.endIdx);
  } else {
    // First time this collection has posted — it has no section yet, so
    // build a whole new collapsible section (card grid + this one entry)
    // and add it to the top of the CURRENT list. Nothing to archive yet.
    const collectionSection = buildCollectionSection(slug, newEntryBlock);
    const insertAt = grid.startIdx + CURRENT_GRID_START.length;
    indexContent =
      indexContent.slice(0, insertAt) +
      `\n\n${collectionSection}` +
      indexContent.slice(insertAt);
  }

  fs.writeFileSync(INDEX_PATH, indexContent, "utf8");

  if (archivedEntryForThisSlug) {
    const archiveGrid = findMarkedBlock(archiveContent, ARCHIVE_GRID_START, ARCHIVE_GRID_END);
    if (!archiveGrid) {
      throw new Error("Could not find CHANGELOG:ENTRIES markers in changelog/archive.md");
    }

    const prependMarker = archivePrependMarker(slug);
    const prependIdx = archiveContent.indexOf(prependMarker);

    if (prependIdx !== -1) {
      // This collection already has its own archive section — prepend the
      // newly-retired entry right after its marker, pushing its older
      // entries down. Every other collection's section is untouched.
      const insertAt = prependIdx + prependMarker.length;
      archiveContent =
        archiveContent.slice(0, insertAt) +
        `\n\n${archivedEntryForThisSlug}` +
        archiveContent.slice(insertAt);
    } else {
      // First-ever archived entry for this collection — build its
      // collapsible section (with its own prepend marker for next time)
      // and add it to the top of the archive list.
      const sectionInner = `${prependMarker}\n\n${archivedEntryForThisSlug}`;
      const collectionSection = buildCollectionSection(slug, sectionInner);
      const insertAt = archiveGrid.startIdx + ARCHIVE_GRID_START.length;
      archiveContent =
        archiveContent.slice(0, insertAt) +
        `\n\n${collectionSection}` +
        archiveContent.slice(insertAt);
    }

    fs.writeFileSync(ARCHIVE_PATH, archiveContent, "utf8");
  }

  const archivedNote = archivedEntryForThisSlug ? "previous entry archived" : "first entry for this collection";
  console.log(`Changelog updated for "${slug}": "${payload.version}" is now live (${archivedNote}).`);
}

main();
