#!/usr/bin/env node
// Applies an incoming changelog payload (fired by ncrbot's
// utils/siteChangelogDispatcher.js as a `repository_dispatch` event) to
// docs/changelog/index.md + archive.md, following the process defined in
// docs/changelog/template.md:
//   1. Pull the current release's card+popup block out of index.md
//   2. Re-ID it (it used the fixed id "changelog-current") and prepend it
//      to archive.md's shared card grid
//   3. Build a fresh card+popup from the payload and put it in index.md
//   4. Update the "Supported Game Version" summary block
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

const CURRENT_START = "<!-- CHANGELOG:CURRENT:START -->";
const CURRENT_END = "<!-- CHANGELOG:CURRENT:END -->";
const PREPEND_MARKER = "<!-- CHANGELOG:PREPEND_HERE -->";
const CURRENT_DIALOG_ID = "changelog-current";

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
  body += `\`${payload.date}\` · Posted by **${payload.author}** · Synced from \`${payload.source_channel}\`\n\n`;
  body += buildSection("Added", payload.added_items, "pt-changelog-h-added");
  body += buildSection("Updated", payload.updated_items, null);
  body += buildSection("Removed", payload.removed_items, "pt-changelog-h-removed");
  return body.trim();
}

// Returns the card <button> + <dialog> pair for one entry, as a single
// markdown="1"-ready HTML fragment. Both need markdown="1" on themselves
// (not just the innermost div) — md_in_html treats a whole subtree as
// opaque raw HTML the moment it hits an ancestor without that attribute.
function buildCardAndDialog(payload, dialogId) {
  const card = [
    `<button type="button" class="pt-changelog-card" data-pt-changelog-open="${dialogId}">`,
    `<span class="pt-changelog-card-version">${payload.version}</span>`,
    `<span class="pt-changelog-card-date">${payload.date}</span>`,
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

function extractCurrentEntry(indexContent) {
  const startIdx = indexContent.indexOf(CURRENT_START);
  const endIdx = indexContent.indexOf(CURRENT_END);
  if (startIdx === -1 || endIdx === -1) {
    throw new Error("Could not find CHANGELOG:CURRENT markers in changelog/index.md");
  }
  const block = indexContent.slice(startIdx, endIdx + CURRENT_END.length);
  const before = indexContent.slice(0, startIdx);
  const after = indexContent.slice(endIdx + CURRENT_END.length);
  return { block, before, after };
}

// The old "current" block always used the fixed id "changelog-current" for
// both the card's data-pt-changelog-open reference and the dialog's own id.
// Re-ID it to something unique (slugified from its own version) before it
// joins the archive, where multiple entries coexist on one page. Also strip
// the CURRENT:START/END comments and outer .pt-changelog-entry wrapper —
// archive.md's entries share ONE outer .pt-changelog-cards grid instead.
function reIdForArchive(oldBlock) {
  const versionMatch = oldBlock.match(/<span class="pt-changelog-card-version">([^<]+)<\/span>/);
  const oldVersion = versionMatch ? versionMatch[1] : "entry";
  const newId = `changelog-${slugify(oldVersion)}`;

  let inner = oldBlock
    .replace(CURRENT_START, "")
    .replace(CURRENT_END, "")
    .replace(/<div class="pt-changelog-entry" markdown="1">\s*/, "")
    .replace(/\s*<\/div>\s*$/, "");

  return inner.trim().split(CURRENT_DIALOG_ID).join(newId);
}

function updateGameVersionBlock(indexContent, payload) {
  return indexContent
    .replace(/(\*\*Cyberpunk 2077:\*\* `)[^`]*(`)/, `$1${payload.game_version}$2`)
    .replace(/(\*\*Collection Build:\*\* `)[^`]*(`)/, `$1${payload.version}$2`)
    .replace(/(\*\*Last Updated:\*\* `)[^`]*(`)/, `$1${payload.date}$2`);
}

function main() {
  const payload = readPayload();

  let indexContent = fs.readFileSync(INDEX_PATH, "utf8");
  let archiveContent = fs.readFileSync(ARCHIVE_PATH, "utf8");

  // 1. Pull the current entry out of index.md
  const { block: oldBlock, before, after } = extractCurrentEntry(indexContent);

  // 2. Build the new entry (dialog id stays the fixed "changelog-current")
  const newInner = buildCardAndDialog(payload, CURRENT_DIALOG_ID);
  const newBlock = [
    CURRENT_START,
    `<div class="pt-changelog-entry" markdown="1">`,
    ``,
    newInner,
    ``,
    `</div>`,
    CURRENT_END
  ].join("\n");

  // Exactly one blank line after the block, regardless of how much
  // whitespace happened to follow the END marker in the source file (the
  // repo checks out with CRLF line endings on Windows, so this has to
  // strip \r\n, not just \n).
  indexContent = `${before}${newBlock}\n\n${after.replace(/^(\r?\n)+/, "")}`;
  indexContent = updateGameVersionBlock(indexContent, payload);

  // 3. Re-id the old entry and prepend it into archive.md's card grid
  const archivedEntry = reIdForArchive(oldBlock);
  const prependIdx = archiveContent.indexOf(PREPEND_MARKER);
  if (prependIdx === -1) {
    throw new Error("Could not find CHANGELOG:PREPEND_HERE marker in changelog/archive.md");
  }
  const insertAt = prependIdx + PREPEND_MARKER.length;
  archiveContent =
    archiveContent.slice(0, insertAt) +
    `\n\n${archivedEntry}` +
    archiveContent.slice(insertAt);

  fs.writeFileSync(INDEX_PATH, indexContent, "utf8");
  fs.writeFileSync(ARCHIVE_PATH, archiveContent, "utf8");

  const oldVersionMatch = oldBlock.match(/<span class="pt-changelog-card-version">([^<]+)<\/span>/);
  const oldVersion = oldVersionMatch ? oldVersionMatch[1] : "previous entry";
  console.log(`Changelog updated: "${oldVersion}" archived, "${payload.version}" is now live.`);
}

main();
