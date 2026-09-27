#!/usr/bin/env node
// scripts/apply-removal.js
//
// Removes a previously-featured item from the site when its source Discord
// message gets deleted -- by staff moderating it (e.g. NSFW content) or by
// the original author taking their own post back. Fired by ncrbot's
// messageDelete handler as a `content_removed` repository_dispatch when the
// deleted message's id matches something the bot had tracked as already
// featured.
//
// Unlike apply-showcase.js / apply-feedback.js (additive, idempotent,
// marker-based inserts), this is a plain removal: strip the ENTRY block by
// id from wherever it lives, and for showcase also delete the downloaded
// image asset -- leaving a delinked file still reachable at its old
// GitHub Pages URL would defeat the point of scrubbing NSFW content.
//
// Invoked by .github/workflows/removal-dispatch.yml with the payload JSON
// in the REMOVAL_PAYLOAD env var.
//
// Payload fields: submission_id, source ("showcase" | "feedback")

const fs = require("fs");
const path = require("path");

const SHOWCASE_INDEX = path.join(__dirname, "..", "docs", "showcase", "index.md");
const SHOWCASE_ARCHIVE = path.join(__dirname, "..", "docs", "showcase", "archive.md");
const SHOWCASE_ASSETS_DIR = path.join(__dirname, "..", "docs", "showcase", "assets");
const FEEDBACK_INDEX = path.join(__dirname, "..", "docs", "feedback", "index.md");

function readPayload() {
  const raw = process.env.REMOVAL_PAYLOAD;
  if (!raw) {
    throw new Error("REMOVAL_PAYLOAD env var is empty");
  }
  return JSON.parse(raw);
}

function stripEntry(content, submissionId, markerPrefix) {
  const start = `<!-- ${markerPrefix}:ENTRY:${submissionId}:START -->`;
  const end = `<!-- ${markerPrefix}:ENTRY:${submissionId}:END -->`;
  const startIdx = content.indexOf(start);
  if (startIdx === -1) return { content, removed: false };
  const endIdx = content.indexOf(end, startIdx);
  if (endIdx === -1) return { content, removed: false };

  let newContent = content.slice(0, startIdx) + content.slice(endIdx + end.length);
  // Collapse the blank-line gap the removed block leaves behind.
  newContent = newContent.replace(/\n{3,}/g, "\n\n");
  return { content: newContent, removed: true };
}

// The asset's extension isn't known here (showcase images are saved as
// whatever the source content-type actually was -- see downloadImage() in
// apply-showcase.js), so match by id prefix rather than assuming a
// specific extension.
function removeShowcaseAsset(submissionId) {
  let files;
  try {
    files = fs.readdirSync(SHOWCASE_ASSETS_DIR);
  } catch {
    return null;
  }
  const match = files.find((f) => f.startsWith(`${submissionId}.`));
  if (!match) return null;
  fs.unlinkSync(path.join(SHOWCASE_ASSETS_DIR, match));
  return match;
}

function removeShowcase(submissionId) {
  let removedFrom = null;

  const index = fs.readFileSync(SHOWCASE_INDEX, "utf8");
  let result = stripEntry(index, submissionId, "SHOWCASE");
  if (result.removed) {
    fs.writeFileSync(SHOWCASE_INDEX, result.content, "utf8");
    removedFrom = "index.md";
  }

  const archive = fs.readFileSync(SHOWCASE_ARCHIVE, "utf8");
  result = stripEntry(archive, submissionId, "SHOWCASE");
  if (result.removed) {
    fs.writeFileSync(SHOWCASE_ARCHIVE, result.content, "utf8");
    removedFrom = removedFrom ? `${removedFrom} and archive.md` : "archive.md";
  }

  const deletedAsset = removeShowcaseAsset(submissionId);

  if (!removedFrom) {
    console.log(`Submission "${submissionId}" not found on showcase index or archive -- nothing to remove.`);
    return;
  }
  console.log(
    `Removed showcase entry "${submissionId}" from ${removedFrom}` +
      (deletedAsset ? ` and deleted asset ${deletedAsset}` : "") +
      "."
  );
}

function removeFeedback(submissionId) {
  const content = fs.readFileSync(FEEDBACK_INDEX, "utf8");
  const result = stripEntry(content, submissionId, "FEEDBACK");
  if (!result.removed) {
    console.log(`Submission "${submissionId}" not found on feedback page -- nothing to remove.`);
    return;
  }
  fs.writeFileSync(FEEDBACK_INDEX, result.content, "utf8");
  console.log(`Removed feedback entry "${submissionId}".`);
}

function main() {
  const payload = readPayload();
  if (!payload.submission_id || !payload.source) {
    throw new Error("Payload missing required field(s): submission_id, source");
  }

  if (payload.source === "showcase") {
    removeShowcase(payload.submission_id);
  } else if (payload.source === "feedback") {
    removeFeedback(payload.submission_id);
  } else {
    throw new Error(`Unknown source "${payload.source}" -- expected "showcase" or "feedback"`);
  }
}

main();
