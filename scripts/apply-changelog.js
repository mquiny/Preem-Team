#!/usr/bin/env node
// Applies an incoming changelog payload (fired by ncrbot's
// utils/siteChangelogDispatcher.js as a `repository_dispatch` event) to
// docs/changelog/index.md + archive.md, following the exact process
// defined in docs/changelog/template.md:
//   1. Pull the current "Latest Release" block out of index.md
//   2. Prepend it to archive.md (retitled to a plain "## vX" heading)
//   3. Replace it in index.md with a freshly built entry from the payload
//   4. Update the "Supported Game Version" summary block
//
// Invoked by .github/workflows/changelog-dispatch.yml with the payload
// JSON in the CHANGELOG_PAYLOAD env var.

const fs = require("fs");
const path = require("path");

const INDEX_PATH = path.join(__dirname, "..", "docs", "changelog", "index.md");
const ARCHIVE_PATH = path.join(__dirname, "..", "docs", "changelog", "archive.md");

function readPayload() {
  const raw = process.env.CHANGELOG_PAYLOAD;
  if (!raw) {
    throw new Error("CHANGELOG_PAYLOAD env var is empty");
  }
  return JSON.parse(raw);
}

function buildChips(payload) {
  const chips = [];
  if (payload.added_items) chips.push('<span class="pt-chip pt-chip--added">Added</span>');
  if (payload.changed_items) chips.push('<span class="pt-chip pt-chip--changed">Changed</span>');
  if (payload.fixed_items) chips.push('<span class="pt-chip pt-chip--fixed">Fixed</span>');
  if (payload.removed_items) chips.push('<span class="pt-chip pt-chip--removed">Removed</span>');
  return chips.join("\n");
}

function buildSection(heading, items) {
  if (!items) return "";
  return `### ${heading}\n\n${items}\n\n`;
}

function buildEntryBody(payload) {
  let body = `${buildChips(payload)}\n\n`;
  body += `\`${payload.date}\` · Posted by **${payload.author}** · Synced from \`${payload.source_channel}\`\n\n`;
  body += buildSection("Added", payload.added_items);
  body += buildSection("Changed", payload.changed_items);
  body += buildSection("Fixed", payload.fixed_items);
  body += buildSection("Removed", payload.removed_items);
  return body.trim();
}

// Splits index.md into: everything before "## Latest Release", the block
// itself (up to but not including the next "\n---\n"), and everything
// from that "---" onward.
function extractLatestBlock(indexContent) {
  const startMarker = "## Latest Release";
  const startIdx = indexContent.indexOf(startMarker);
  if (startIdx === -1) {
    throw new Error('Could not find "## Latest Release" block in changelog/index.md');
  }

  const afterStart = indexContent.slice(startIdx);
  const endMarker = "\n---\n";
  const endIdx = afterStart.indexOf(endMarker);
  if (endIdx === -1) {
    throw new Error('Could not find end-of-entry marker ("---") after "## Latest Release"');
  }

  const block = afterStart.slice(0, endIdx).trim();
  const before = indexContent.slice(0, startIdx);
  const after = afterStart.slice(endIdx); // includes the leading "\n---\n"

  return { block, before, after };
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
  const archiveContent = fs.readFileSync(ARCHIVE_PATH, "utf8");

  // 1. Pull the current "Latest Release" block out of index.md
  const { block: oldBlock, before, after } = extractLatestBlock(indexContent);

  // 2. Build the new entry and splice it in place of the old one
  const newEntryTitle = `## Latest Release — ${payload.version}`;
  const newEntryBody = buildEntryBody(payload);
  const newBlock = `${newEntryTitle}\n\n${newEntryBody}`;

  indexContent = `${before}${newBlock}\n${after}`;
  indexContent = updateGameVersionBlock(indexContent, payload);

  // 3. Prepend the old block into archive.md (right after its intro,
  //    before the first existing "## " entry), retitled to a plain
  //    "## vX" archive-style heading.
  const archiveHeadingMatch = archiveContent.match(/^## /m);
  if (!archiveHeadingMatch) {
    throw new Error('Could not find first "## " entry in changelog/archive.md');
  }
  const archiveSplitIdx = archiveHeadingMatch.index;
  const archiveBefore = archiveContent.slice(0, archiveSplitIdx);
  const archiveAfter = archiveContent.slice(archiveSplitIdx);

  const oldVersionMatch = oldBlock.match(/^## Latest Release — (.+)$/m);
  const oldVersion = oldVersionMatch ? oldVersionMatch[1] : "Unknown";
  const archivedBlock = oldBlock.replace(/^## Latest Release — .+$/m, `## ${oldVersion}`);

  const newArchiveContent = `${archiveBefore}${archivedBlock}\n\n---\n\n${archiveAfter}`;

  fs.writeFileSync(INDEX_PATH, indexContent, "utf8");
  fs.writeFileSync(ARCHIVE_PATH, newArchiveContent, "utf8");

  console.log(`Changelog updated: "${oldVersion}" archived, "${payload.version}" is now live.`);
}

main();
