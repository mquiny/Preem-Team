#!/usr/bin/env node
// Applies an incoming known-issue update (fired by PreemBot's
// /known-issue command as a `repository_dispatch` event) to
// docs/troubleshooting/known_issues.md.
//
// Each issue is keyed by `issue_id` (the source Discord message ID), and
// entries are wrapped in <!-- KNOWN-ISSUE:<id>:START/END --> markers,
// mirroring scripts/apply-showcase.js's dedup-by-id pattern:
//
//   status "open"     -- insert a new entry at the top of the Open
//                         section, unless one already exists anywhere
//                         (Open or Resolved) for this id, in which case
//                         this is a safe no-op.
//   status "resolved" -- move the entry from Open into Resolved (styled
//                         as resolved, with a resolved date added). If it
//                         isn't found in Open for some reason (a missed
//                         "open" dispatch, say), it's built fresh
//                         straight into Resolved instead of failing --
//                         and if it's already in Resolved, this is a
//                         no-op too.
//
// Invoked by .github/workflows/known-issues-dispatch.yml with the
// payload JSON in the KNOWN_ISSUE_PAYLOAD env var.
//
// Payload fields: issue_id, status ("open"|"resolved"), title,
// description, and optionally message_url, posted_by, posted_at,
// resolved_at.

const fs = require("fs");
const path = require("path");

const PAGE_PATH = path.join(__dirname, "..", "docs", "troubleshooting", "known_issues.md");

const OPEN_START = "<!-- KNOWN-ISSUES:OPEN:START -->";
const OPEN_END = "<!-- KNOWN-ISSUES:OPEN:END -->";
const RESOLVED_START = "<!-- KNOWN-ISSUES:RESOLVED:START -->";
const RESOLVED_END = "<!-- KNOWN-ISSUES:RESOLVED:END -->";

const EMPTY_OPEN_PLACEHOLDER = "_No known issues at this time._";
const EMPTY_RESOLVED_PLACEHOLDER = "_Nothing resolved yet._";

function readPayload() {
  const raw = process.env.KNOWN_ISSUE_PAYLOAD;
  if (!raw) {
    throw new Error("KNOWN_ISSUE_PAYLOAD env var is empty");
  }
  return JSON.parse(raw);
}

function entryMarkers(issueId) {
  return {
    start: `<!-- KNOWN-ISSUE:${issueId}:START -->`,
    end: `<!-- KNOWN-ISSUE:${issueId}:END -->`
  };
}

function formatDate(iso) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

// Indents every line of a markdown body by 4 spaces, as required for
// content nested inside a pymdownx.details (`???`) admonition block.
function indent(text) {
  return text
    .split("\n")
    .map(line => (line.trim().length ? `    ${line}` : ""))
    .join("\n");
}

function buildEntry(payload, resolved) {
  const { start, end } = entryMarkers(payload.issue_id);
  const admonition = resolved ? "success" : "warning";
  const title = payload.title || "Untitled issue";
  const description = payload.description || "";

  const metaParts = [];
  const posted = formatDate(payload.posted_at);
  if (posted) metaParts.push(`Posted ${posted}`);
  if (resolved) {
    const resolvedDate = formatDate(payload.resolved_at);
    if (resolvedDate) metaParts.push(`resolved ${resolvedDate}`);
  }
  if (payload.message_url) metaParts.push(`[View original message](${payload.message_url})`);

  const bodyLines = [description];
  if (metaParts.length > 0) {
    bodyLines.push("", `*${metaParts.join(" — ")}*`);
  }

  const block = [
    `??? ${admonition} "${title.replace(/"/g, "'")}"`,
    indent(bodyLines.join("\n"))
  ].join("\n");

  return `${start}\n${block}\n${end}`;
}

function findMarkedBlock(content, start, end) {
  const startIdx = content.indexOf(start);
  if (startIdx === -1) return null;
  const endIdx = content.indexOf(end, startIdx);
  if (endIdx === -1) return null;
  return {
    inner: content.slice(startIdx + start.length, endIdx).trim(),
    startIdx,
    endIdx: endIdx + end.length,
    innerStart: startIdx + start.length,
    innerEnd: endIdx
  };
}

function replaceSectionInner(content, start, end, newInner) {
  const section = findMarkedBlock(content, start, end);
  if (!section) {
    throw new Error(`Could not find markers ${start} / ${end} in known_issues.md`);
  }
  return content.slice(0, section.innerStart) + `\n\n${newInner}\n\n` + content.slice(section.innerEnd);
}

function extractEntry(sectionInner, issueId) {
  const { start, end } = entryMarkers(issueId);
  const startIdx = sectionInner.indexOf(start);
  if (startIdx === -1) return { found: false, remaining: sectionInner };
  const endIdx = sectionInner.indexOf(end, startIdx);
  if (endIdx === -1) return { found: false, remaining: sectionInner };

  const remaining = (sectionInner.slice(0, startIdx) + sectionInner.slice(endIdx + end.length)).trim();
  return { found: true, remaining };
}

function main() {
  const payload = readPayload();
  if (!payload.issue_id || !payload.status || !payload.title) {
    throw new Error("Payload is missing issue_id, status, or title");
  }

  let content = fs.readFileSync(PAGE_PATH, "utf8");
  const { start: entryStart } = entryMarkers(payload.issue_id);

  const openSection = findMarkedBlock(content, OPEN_START, OPEN_END);
  const resolvedSection = findMarkedBlock(content, RESOLVED_START, RESOLVED_END);
  if (!openSection || !resolvedSection) {
    throw new Error("Could not find KNOWN-ISSUES:OPEN / KNOWN-ISSUES:RESOLVED markers");
  }

  if (payload.status === "open") {
    if (openSection.inner.includes(entryStart) || resolvedSection.inner.includes(entryStart)) {
      console.log(`Issue "${payload.issue_id}" is already tracked — nothing to do.`);
      return;
    }

    const newEntry = buildEntry(payload, false);
    const existingOpen = openSection.inner === EMPTY_OPEN_PLACEHOLDER ? "" : openSection.inner;
    const newOpenInner = [newEntry, existingOpen].filter(Boolean).join("\n\n");

    content = replaceSectionInner(content, OPEN_START, OPEN_END, newOpenInner);
    fs.writeFileSync(PAGE_PATH, content, "utf8");
    console.log(`Known issue "${payload.issue_id}" added: "${payload.title}"`);
    return;
  }

  if (payload.status === "resolved") {
    if (resolvedSection.inner.includes(entryStart)) {
      console.log(`Issue "${payload.issue_id}" is already resolved — nothing to do.`);
      return;
    }

    const { found, remaining: newOpenRaw } = extractEntry(openSection.inner, payload.issue_id);
    const newOpenInner = newOpenRaw || EMPTY_OPEN_PLACEHOLDER;

    const resolvedEntry = buildEntry(payload, true);
    const existingResolved = resolvedSection.inner === EMPTY_RESOLVED_PLACEHOLDER ? "" : resolvedSection.inner;
    const newResolvedInner = [resolvedEntry, existingResolved].filter(Boolean).join("\n\n");

    // Re-read markers fresh each time content is rewritten, since string
    // indices shift after the first replacement.
    content = replaceSectionInner(content, OPEN_START, OPEN_END, newOpenInner);
    content = replaceSectionInner(content, RESOLVED_START, RESOLVED_END, newResolvedInner);
    fs.writeFileSync(PAGE_PATH, content, "utf8");

    console.log(
      found
        ? `Known issue "${payload.issue_id}" moved to Resolved: "${payload.title}"`
        : `Known issue "${payload.issue_id}" wasn't found in Open — added directly to Resolved: "${payload.title}"`
    );
    return;
  }

  throw new Error(`Unknown status "${payload.status}" — expected "open" or "resolved"`);
}

main();
