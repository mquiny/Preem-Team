#!/usr/bin/env node
// Applies an incoming changelog payload (fired by ncrbot's
// utils/siteChangelogDispatcher.js as a `repository_dispatch` event) to
// docs/changelog/index.md + archive.md, following the process defined in
// docs/changelog/template.md.
//
// Multiple collections are tracked independently: each has its own
// card+popup on index.md, keyed by collection_slug. Posting an update for
// one collection only replaces THAT collection's card (archiving its old
// one) — every other collection's card is untouched.
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
const ARCHIVE_PREPEND_MARKER = "<!-- CHANGELOG:PREPEND_HERE -->";

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
  const card = [
    `<button type="button" class="pt-changelog-card" data-pt-changelog-open="${dialogId}">`,
    `<span class="pt-changelog-card-version">${payload.version}</span>`,
    `<span class="pt-changelog-card-date">${payload.date} · CP2077 ${payload.game_version}</span>`,
    `<span class="pt-changelog-card-chips">${buildChipsHtml(payload)}</span>`,
    `</button>`
  ].join("\n");

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
    // This collection already has a card — pull its old one out to archive,
    // then swap in the fresh one in the exact same spot.
    const versionMatch = existingEntry.block.match(/<span class="pt-changelog-card-version">([^<]+)<\/span>/);
    const oldVersion = versionMatch ? versionMatch[1] : "entry";
    const archiveDialogId = `changelog-${slugify(oldVersion)}`;

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
    // First time this collection has posted — add its card to the grid,
    // right after the opening <div>, without archiving anything.
    const divOpenMarker = '<div class="pt-changelog-cards" markdown="1">';
    const divOpenIdx = indexContent.indexOf(divOpenMarker, grid.startIdx);
    if (divOpenIdx === -1) {
      throw new Error('Could not find the .pt-changelog-cards opening <div> inside the CURRENT grid');
    }
    const insertAt = divOpenIdx + divOpenMarker.length;
    indexContent =
      indexContent.slice(0, insertAt) +
      `\n\n${newEntryBlock}` +
      indexContent.slice(insertAt);
  }

  fs.writeFileSync(INDEX_PATH, indexContent, "utf8");

  if (archivedEntryForThisSlug) {
    const prependIdx = archiveContent.indexOf(ARCHIVE_PREPEND_MARKER);
    if (prependIdx === -1) {
      throw new Error("Could not find CHANGELOG:PREPEND_HERE marker in changelog/archive.md");
    }
    const insertAt = prependIdx + ARCHIVE_PREPEND_MARKER.length;
    archiveContent =
      archiveContent.slice(0, insertAt) +
      `\n\n${archivedEntryForThisSlug}` +
      archiveContent.slice(insertAt);
    fs.writeFileSync(ARCHIVE_PATH, archiveContent, "utf8");
  }

  const archivedNote = archivedEntryForThisSlug ? "previous entry archived" : "first entry for this collection";
  console.log(`Changelog updated for "${slug}": "${payload.version}" is now live (${archivedNote}).`);
}

main();
