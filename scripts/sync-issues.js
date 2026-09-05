#!/usr/bin/env node
// Syncs GitHub Issues into docs/troubleshooting/issue_viewer.md's live
// table. Runs entirely inside this repo via GitHub Actions
// (.github/workflows/sync-issues.yml) — no Discord bot involved. Users
// report bugs by clicking "Create an Issue" on that page, which takes them
// straight to GitHub; whenever an issue is opened/closed/commented on (or
// every 30 minutes as a fallback), this script re-fetches the current
// issue list via the GitHub REST API and rewrites the table.

const fs = require("fs");
const path = require("path");

const OWNER = "mquiny";
const REPO = "Preem-Team";
const ISSUE_VIEWER_PATH = path.join(__dirname, "..", "docs", "troubleshooting", "issue_viewer.md");

const TABLE_START = "<!-- BOT-INJECT:ISSUE-TABLE:START -->";
const TABLE_END = "<!-- BOT-INJECT:ISSUE-TABLE:END -->";

// Keep the page bounded rather than growing forever as the tracker
// accumulates history — newest-updated issues first.
const MAX_ROWS = 30;

async function fetchIssues() {
  const token = process.env.GITHUB_TOKEN;
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "preem-team-issue-sync"
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  // state=all so a just-closed issue still shows as "Resolved" for a while
  // instead of disappearing the instant it's closed.
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/issues?state=all&sort=updated&direction=desc&per_page=${MAX_ROWS}`;
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

function buildRow(issue) {
  const statusChip = issue.state === "open"
    ? '<span class="pt-chip pt-chip--open">Open</span>'
    : '<span class="pt-chip pt-chip--resolved">Resolved</span>';
  const labels = issue.labels.length
    ? issue.labels.map((l) => `\`${escapeCell(typeof l === "string" ? l : l.name)}\``).join(", ")
    : "—";
  const opened = issue.created_at.slice(0, 10);
  return `| ${statusChip} | [${escapeCell(issue.title)}](${issue.html_url}) | ${labels} | \`${opened}\` | ${issue.comments} |`;
}

function buildTable(issues) {
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
    for (const issue of issues) lines.push(buildRow(issue));
  }

  return lines.join("\n");
}

async function main() {
  const issues = await fetchIssues();
  const table = buildTable(issues);

  let content = fs.readFileSync(ISSUE_VIEWER_PATH, "utf8");
  const startIdx = content.indexOf(TABLE_START);
  const endIdx = content.indexOf(TABLE_END);
  if (startIdx === -1 || endIdx === -1) {
    throw new Error("Could not find BOT-INJECT:ISSUE-TABLE markers in issue_viewer.md");
  }

  const before = content.slice(0, startIdx + TABLE_START.length);
  const after = content.slice(endIdx);
  content = `${before}\n\n${table}\n\n${after}`;

  fs.writeFileSync(ISSUE_VIEWER_PATH, content, "utf8");
  console.log(`Synced ${issues.length} issue(s) to issue_viewer.md`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
