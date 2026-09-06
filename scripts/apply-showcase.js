#!/usr/bin/env node
// Applies an incoming showcase submission (fired by ncrbot as a
// `repository_dispatch` event once a #showcase post either gets reactions
// from enough different people, or a staff "instant feature" reaction) to
// docs/showcase/index.md.
//
// index.md only ever shows the CURRENT calendar month's submissions
// (newest submission first). The moment the first submission of a new
// month is featured, whatever month was previously showing on index.md is
// moved wholesale to the top of docs/showcase/archive.md (newest archived
// month first) before the new month's section is created — so a quiet
// start to a new month (no submissions yet) leaves last month's section
// visible on the live page indefinitely, exactly as before: nothing here
// runs on a timer, it only ever reacts to a real submission event.
//
// Each submission is keyed by `submission_id` (the source Discord message
// ID) so a message that somehow triggers twice (e.g. reaction count
// wobbles near the threshold right after a staff star already featured
// it) is a no-op the second time, instead of a duplicate card — checked
// across both index.md and archive.md, since the original submission may
// have since been archived.
//
// Invoked by .github/workflows/showcase-dispatch.yml with the payload
// JSON in the SHOWCASE_PAYLOAD env var.
//
// Payload fields: submission_id, image_url, username, channel, posted_at
// (ISO date), and optionally title / message_url.

const fs = require("fs");
const path = require("path");

const INDEX_PATH = path.join(__dirname, "..", "docs", "showcase", "index.md");
const ARCHIVE_PATH = path.join(__dirname, "..", "docs", "showcase", "archive.md");

const GRID_START = "<!-- SHOWCASE:START -->";
const GRID_END = "<!-- SHOWCASE:END -->";
const ARCHIVE_GRID_START = "<!-- SHOWCASE:ARCHIVE:START -->";
const ARCHIVE_GRID_END = "<!-- SHOWCASE:ARCHIVE:END -->";

function readPayload() {
  const raw = process.env.SHOWCASE_PAYLOAD;
  if (!raw) {
    throw new Error("SHOWCASE_PAYLOAD env var is empty");
  }
  return JSON.parse(raw);
}

function monthKeyAndLabel(isoDate) {
  const date = isoDate ? new Date(isoDate) : new Date();
  const key = date.toISOString().slice(0, 7); // "2026-09"
  const label = date.toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  return { key, label };
}

function entryMarkers(submissionId) {
  return {
    start: `<!-- SHOWCASE:ENTRY:${submissionId}:START -->`,
    end: `<!-- SHOWCASE:ENTRY:${submissionId}:END -->`
  };
}

// Builds one gallery card as a Material "grid cards" list item — NOT
// wrapped in its own entry markers (the caller adds those).
function buildCard(payload) {
  const title = payload.title || "Showcase submission";
  const lines = [
    `-   ![Screenshot posted by ${payload.username} in ${payload.channel}](${payload.image_url})`,
    `    **${title}**`,
    `    *Posted by \`${payload.username}\` in ${payload.channel}*`
  ];
  if (payload.message_url) {
    lines.push(`    [View original post](${payload.message_url})`);
  }
  return lines.join("\n");
}

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

function buildMonthSection(monthKey, monthLabel, entryBlock) {
  return [
    `<details class="pt-showcase-month" open markdown="1" data-month="${monthKey}">`,
    `<summary>${monthLabel}</summary>`,
    ``,
    `<div class="grid cards" markdown="1">`,
    ``,
    entryBlock,
    ``,
    `</div>`,
    `</details>`
  ].join("\n");
}

// Finds every `<details class="pt-showcase-month" ... data-month="...">
// ... </details>` block inside `gridInner` (the raw content between
// index.md's GRID_START/END markers). Returns the sections found (in
// document order — newest month first, matching how they were written)
// plus whatever text is left over once they're all stripped out.
function extractMonthSections(gridInner) {
  const re = /<details class="pt-showcase-month"[^>]*data-month="([^"]+)"[\s\S]*?<\/details>/g;
  const sections = [];
  let match;
  while ((match = re.exec(gridInner)) !== null) {
    sections.push({ monthKey: match[1], block: match[0] });
  }
  const remaining = gridInner.replace(re, "").trim();
  return { sections, remaining };
}

function main() {
  const payload = readPayload();
  const submissionId = payload.submission_id;
  if (!submissionId) {
    throw new Error("Payload is missing submission_id");
  }
  if (!payload.image_url || !payload.username) {
    throw new Error("Payload is missing image_url or username");
  }

  let content = fs.readFileSync(INDEX_PATH, "utf8");
  // Only read archive.md if we might need it, but do it unconditionally up
  // front since a duplicate submission_id could be sitting in either file
  // (an old submission that's since been archived should still be a
  // no-op, not a second card).
  let archiveContent = fs.readFileSync(ARCHIVE_PATH, "utf8");

  const { start: entryStart, end: entryEnd } = entryMarkers(submissionId);
  if (content.includes(entryStart) || archiveContent.includes(entryStart)) {
    console.log(`Submission "${submissionId}" is already featured — nothing to do.`);
    return;
  }

  const grid = findMarkedBlock(content, GRID_START, GRID_END);
  if (!grid) {
    throw new Error("Could not find SHOWCASE markers in showcase/index.md");
  }

  const { key: monthKey, label: monthLabel } = monthKeyAndLabel(payload.posted_at);
  const newEntryBlock = `${entryStart}\n${buildCard(payload)}\n${entryEnd}`;

  const monthMarker = `data-month="${monthKey}"`;
  const monthIdx = content.indexOf(monthMarker);

  if (monthIdx !== -1) {
    // The current month already has a section on index.md — prepend the
    // new card to the top of its grid, right after the opening <div>.
    const divOpenMarker = '<div class="grid cards" markdown="1">';
    const divOpenIdx = content.indexOf(divOpenMarker, monthIdx);
    if (divOpenIdx === -1) {
      throw new Error(`Could not find the cards grid for month "${monthKey}"`);
    }
    const insertAt = divOpenIdx + divOpenMarker.length;
    content = content.slice(0, insertAt) + `\n\n${newEntryBlock}` + content.slice(insertAt);
    fs.writeFileSync(INDEX_PATH, content, "utf8");
    console.log(`Showcase updated: "${submissionId}" featured under ${monthLabel}.`);
    return;
  }

  // First submission of a new calendar month — whatever was previously
  // showing on index.md (normally just one month) gets archived wholesale
  // before the new month takes its place, so index.md always holds
  // exactly the current month and nothing older.
  const gridInner = content.slice(grid.startIdx + GRID_START.length, grid.endIdx - GRID_END.length);
  const { sections: oldSections } = extractMonthSections(gridInner);

  if (oldSections.length > 0) {
    const archiveGrid = findMarkedBlock(archiveContent, ARCHIVE_GRID_START, ARCHIVE_GRID_END);
    if (!archiveGrid) {
      throw new Error("Could not find SHOWCASE:ARCHIVE markers in showcase/archive.md");
    }
    const toPrepend = oldSections.map((s) => s.block).join("\n\n");
    const insertAt = archiveGrid.startIdx + ARCHIVE_GRID_START.length;
    archiveContent =
      archiveContent.slice(0, insertAt) + `\n\n${toPrepend}` + archiveContent.slice(insertAt);
    fs.writeFileSync(ARCHIVE_PATH, archiveContent, "utf8");
  }

  // Build a fresh grid on index.md containing only the new month.
  const monthSection = buildMonthSection(monthKey, monthLabel, newEntryBlock);
  content =
    content.slice(0, grid.startIdx + GRID_START.length) +
    `\n\n${monthSection}\n\n` +
    content.slice(grid.endIdx - GRID_END.length);
  fs.writeFileSync(INDEX_PATH, content, "utf8");

  const archivedNote =
    oldSections.length > 0
      ? `archived ${oldSections.length} previous month section(s)`
      : "no previous month to archive";
  console.log(`Showcase updated: "${submissionId}" featured under ${monthLabel} (${archivedNote}).`);
}

main();
