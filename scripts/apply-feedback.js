#!/usr/bin/env node
// scripts/apply-feedback.js
//
// Applies an incoming feedback submission (fired by ncrbot as a
// `repository_dispatch` event when a staff member right-clicks a #feedback
// message and runs "Feature as Testimonial") to docs/feedback/index.md.
//
// Unlike showcase, this is a flat, newest-first wall with no month
// archiving -- testimonials are staff hand-picked (not reaction-driven),
// so the page grows slowly and doesn't need the same overflow handling.
//
// Each entry is keyed by `submission_id` (the source Discord message ID)
// so a message that somehow triggers twice is a no-op the second time,
// instead of a duplicate card.
//
// Invoked by .github/workflows/feedback-dispatch.yml with the payload JSON
// in the FEEDBACK_PAYLOAD env var.
//
// Payload fields: submission_id, message, username, channel, posted_at
// (ISO date), and optionally avatar_url / message_url.

const fs = require("fs");
const path = require("path");

const INDEX_PATH = path.join(__dirname, "..", "docs", "feedback", "index.md");

// The div itself is a fixed part of index.md (see its opening tag below) --
// new entries are inserted right after it opens, so the wrapper and every
// previously-featured card stay put. Only ENTRY markers are ever added or
// searched for; GRID_START/END aren't used to bound a replace.
const GRID_OPEN = '<div class="grid cards pt-feedback-grid" markdown="1">';

const MAX_MESSAGE_LENGTH = 400;

function readPayload() {
  const raw = process.env.FEEDBACK_PAYLOAD;
  if (!raw) {
    throw new Error("FEEDBACK_PAYLOAD env var is empty");
  }
  return JSON.parse(raw);
}

function entryMarkers(submissionId) {
  return {
    start: `<!-- FEEDBACK:ENTRY:${submissionId}:START -->`,
    end: `<!-- FEEDBACK:ENTRY:${submissionId}:END -->`
  };
}

// Card content is inside a Markdown list item (mirrors apply-showcase.js's
// approach) -- a raw multi-line message would break that list's
// indentation, and a literal quote mark right after the opening `> `
// reads fine but is worth trimming so the rendered blockquote doesn't
// start with a stray `""`. Truncated rather than rejected: staff picked
// this message on purpose, better to show most of it than nothing.
function sanitizeMessage(text) {
  let clean = text.replace(/\r\n/g, " ").replace(/\n+/g, " ").trim();
  clean = clean.replace(/^["“]+|["”]+$/g, "").trim();
  if (clean.length > MAX_MESSAGE_LENGTH) {
    clean = `${clean.slice(0, MAX_MESSAGE_LENGTH).trim()}…`;
  }
  return clean;
}

function buildEntry(payload) {
  const { start, end } = entryMarkers(payload.submission_id);
  const avatar = payload.avatar_url
    ? `![](${payload.avatar_url}){ .pt-feedback-avatar }`
    : "";
  const link = payload.message_url
    ? `[View original message](${payload.message_url})`
    : "";

  return [
    start,
    `-   > "${sanitizeMessage(payload.message)}"`,
    "",
    `    ${avatar} **${payload.username}** · *${payload.channel || "#feedback"}*${link ? ` · ${link}` : ""}`,
    end
  ].join("\n");
}

function main() {
  const payload = readPayload();

  if (!payload.message || !payload.username || !payload.submission_id) {
    throw new Error("Payload missing required field(s): submission_id, message, username");
  }

  let content = fs.readFileSync(INDEX_PATH, "utf8");

  const { start: entryStart } = entryMarkers(payload.submission_id);
  if (content.includes(entryStart)) {
    console.log(`Submission ${payload.submission_id} already featured -- no-op.`);
    return;
  }

  const gridOpenIdx = content.indexOf(GRID_OPEN);
  if (gridOpenIdx === -1) {
    throw new Error(`Could not find ${GRID_OPEN} in ${INDEX_PATH}`);
  }

  const entry = buildEntry(payload);
  const insertAt = gridOpenIdx + GRID_OPEN.length;
  content = content.slice(0, insertAt) + `\n\n${entry}\n` + content.slice(insertAt);

  fs.writeFileSync(INDEX_PATH, content);
  console.log(`Featured submission ${payload.submission_id} from ${payload.username}.`);
}

main();
