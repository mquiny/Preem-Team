#!/usr/bin/env node
// Applies an incoming showcase submission (fired by ncrbot as a
// `repository_dispatch` event once a #showcase post either gets reactions
// from enough different people, or a staff "instant feature" reaction) to
// docs/showcase/index.md.
//
// Submissions are grouped into a collapsible section per calendar month,
// newest month first, newest submission within a month first. Each
// submission is keyed by `submission_id` (the source Discord message ID)
// so a message that somehow triggers twice (e.g. reaction count wobbles
// near the threshold right after a staff star already featured it) is a
// no-op the second time, instead of a duplicate card.
//
// Invoked by .github/workflows/showcase-dispatch.yml with the payload
// JSON in the SHOWCASE_PAYLOAD env var.
//
// Payload fields: submission_id, image_url, username, channel, posted_at
// (ISO date), and optionally title / message_url.

const fs = require("fs");
const path = require("path");

const INDEX_PATH = path.join(__dirname, "..", "docs", "showcase", "index.md");

const GRID_START = "<!-- SHOWCASE:START -->";
const GRID_END = "<!-- SHOWCASE:END -->";

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

  const { start: entryStart, end: entryEnd } = entryMarkers(submissionId);
  if (content.includes(entryStart)) {
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
    // This month already has a section — prepend the new card to the top
    // of its grid, right after the opening <div>. Every other month's
    // section is untouched.
    const divOpenMarker = '<div class="grid cards" markdown="1">';
    const divOpenIdx = content.indexOf(divOpenMarker, monthIdx);
    if (divOpenIdx === -1) {
      throw new Error(`Could not find the cards grid for month "${monthKey}"`);
    }
    const insertAt = divOpenIdx + divOpenMarker.length;
    content = content.slice(0, insertAt) + `\n\n${newEntryBlock}` + content.slice(insertAt);
  } else {
    // First submission of this calendar month — build a whole new
    // collapsible section and add it to the top of the list. As long as
    // months arrive in real-world chronological order (which they will,
    // since this only ever runs live), each new month naturally lands
    // above all older ones.
    const monthSection = buildMonthSection(monthKey, monthLabel, newEntryBlock);
    const insertAt = grid.startIdx + GRID_START.length;
    content = content.slice(0, insertAt) + `\n\n${monthSection}` + content.slice(insertAt);
  }

  fs.writeFileSync(INDEX_PATH, content, "utf8");
  console.log(`Showcase updated: "${submissionId}" featured under ${monthLabel}.`);
}

main();
