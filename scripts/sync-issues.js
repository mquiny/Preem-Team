#!/usr/bin/env node
// Syncs GitHub Issues into docs/troubleshooting/issue_viewer.md's live
// table (open issues) and docs/troubleshooting/issue_archive.md's table
// (closed issues). Runs entirely inside this repo via GitHub Actions
// (.github/workflows/sync-issues.yml) — no Discord bot involved. Users
// report bugs by clicking "Create an Issue" on that page, which takes them
// straight to GitHub; whenever an issue is opened/closed/commented on (or
// every 30 minutes as a fallback), this script re-fetches the current
// issue list via the GitHub REST API and rewrites both tables from
// scratch — GitHub's own issue state is the source of truth, there's no
// incremental bookkeeping like the changelog/showcase archives do.
//
// A closed issue therefore drops off the archive table once it's no
// longer among the most recently-updated closed issues (see
// ARCHIVE_MAX_ROWS below) — this isn't a permanent historical record, just
// a live snapshot of GitHub's own issue state, same as the open table
// always has been.

const fs = require("fs");
const path = require("path");

const OWNER = "mquiny";
const REPO = "Preem-Team";
const ISSUE_VIEWER_PATH = path.join(__dirname, "..", "docs", "troubleshooting", "issue_viewer.md");
const ISSUE_ARCHIVE_PATH = path.join(__dirname, "..", "docs", "troubleshooting", "issue_archive.md");

const OPEN_TABLE_START = "<!-- BOT-INJECT:ISSUE-TABLE:START -->";
const OPEN_TABLE_END = "<!-- BOT-INJECT:ISSUE-TABLE:END -->";
const ARCHIVE_TABLE_START = "<!-- BOT-INJECT:ISSUE-ARCHIVE-TABLE:START -->";
const ARCHIVE_TABLE_END = "<!-- BOT-INJECT:ISSUE-ARCHIVE-TABLE:END -->";

// Keep each page bounded rather than growing forever — newest-updated
// issues first, for whichever state ("open"/"closed") is being fetched.
const OPEN_MAX_ROWS = 30;
const ARCHIVE_MAX_ROWS = 50;

async function fetchIssues(state, limit) {
  const token = process.env.GITHUB_TOKEN;
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "preem-team-issue-sync"
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const url = `https://api.github.com/repos/${OWNER}/${REPO}/issues?state=${state}&sort=updated&direction=desc&per_page=${limit}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${await res.text()}`);
  }
  const issues = await res.json();
  // The issues endpoint also returns pull requests mixed in — exclude those.
  return issues.filter((issue) => !issue.pull_request);
}

function escapeCell(text) {
  // Keep a stray "|" in a title/label from breaking the table layout.
  return String(text).replace(/\|/g, "\\|");
}

function formatLabels(issue) {
  return issue.labels.length
    ? issue.labels.map((l) => `\`${escapeCell(typeof l === "string" ? l : l.name)}\``).join(", ")
    : "—";
}

function buildOpenRow(issue) {
  const opened = issue.created_at.slice(0, 10);
  return `| <span class="pt-chip pt-chip--open">Open</span> | [${escapeCell(issue.title)}](${issue.html_url}) | ${formatLabels(issue)} | \`${opened}\` | ${issue.comments} |`;
}

function buildClosedRow(issue) {
  const opened = issue.created_at.slice(0, 10);
  const closed = (issue.closed_at || issue.updated_at).slice(0, 10);
  return `| <span class="pt-chip pt-chip--resolved">Resolved</span> | [${escapeCell(issue.title)}](${issue.html_url}) | ${formatLabels(issue)} | \`${opened}\` | \`${closed}\` | ${issue.comments} |`;
}

function buildOpenTable(issues) {
  const syncedAt = new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC";
  const lines = [
    `**Last synced:** \`${syncedAt}\``,
    "",
    "| Status | Issue | Labels | Opened | Comments |",
    "|---|---|---|---|---|"
  ];

  if (issues.length === 0) {
    lines.push("| — | *No open issues right now — nice.* | — | — | — |");
  } else {
    for (const issue of issues) lines.push(buildOpenRow(issue));
  }

  return lines.join("\n");
}

function buildArchiveTable(issues) {
  const syncedAt = new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC";
  const lines = [
    `**Last synced:** \`${syncedAt}\``,
    "",
    "| Status | Issue | Labels | Opened | Closed | Comments |",
    "|---|---|---|---|---|---|"
  ];

  if (issues.length === 0) {
    lines.push("| — | *No closed issues yet.* | — | — | — | — |");
  } else {
    for (const issue of issues) lines.push(buildClosedRow(issue));
  }

  return lines.join("\n");
}

function replaceBetweenMarkers(filePath, start, end, table) {
  let content = fs.readFileSync(filePath, "utf8");
  const startIdx = content.indexOf(start);
  const endIdx = content.indexOf(end);
  if (startIdx === -1 || endIdx === -1) {
    throw new Error(`Could not find markers "${start}" / "${end}" in ${filePath}`);
  }

  const before = content.slice(0, startIdx + start.length);
  const after = content.slice(endIdx);
  content = `${before}\n\n${table}\n\n${after}`;
  fs.writeFileSync(filePath, content, "utf8");
}

async function main() {
  const [openIssues, closedIssues] = await Promise.all([
    fetchIssues("open", OPEN_MAX_ROWS),
    fetchIssues("closed", ARCHIVE_MAX_ROWS)
  ]);

  replaceBetweenMarkers(ISSUE_VIEWER_PATH, OPEN_TABLE_START, OPEN_TABLE_END, buildOpenTable(openIssues));
  replaceBetweenMarkers(ISSUE_ARCHIVE_PATH, ARCHIVE_TABLE_START, ARCHIVE_TABLE_END, buildArchiveTable(closedIssues));

  console.log(`Synced ${openIssues.length} open issue(s) to issue_viewer.md and ${closedIssues.length} closed issue(s) to issue_archive.md`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
