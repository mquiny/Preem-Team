#!/usr/bin/env node
// Applies an incoming StreetCred leaderboard snapshot (fired by ncrbot's
// daily cron as a `repository_dispatch` event) to
// docs/team/streetcred.md.
//
// The bot always sends its full top-N snapshot, not a diff -- this
// script just rewrites the whole table between markers every time, same
// approach as sync-issues.js / apply-autoresponders.js. Read-only
// reference page: nothing here can be edited from the site itself.
//
// Invoked by .github/workflows/streetcred-dispatch.yml with the payload
// JSON in the STREETCRED_PAYLOAD env var.
//
// Payload fields: guild_id, generated_at, entries (array of
// { rank, display_name, tier_label, score, is_staff }).

const fs = require("fs");
const path = require("path");

const PAGE_PATH = path.join(__dirname, "..", "docs", "team", "streetcred.md");

const TABLE_START = "<!-- BOT-INJECT:STREETCRED:START -->";
const TABLE_END = "<!-- BOT-INJECT:STREETCRED:END -->";

function readPayload() {
  const raw = process.env.STREETCRED_PAYLOAD;
  if (!raw) {
    throw new Error("STREETCRED_PAYLOAD env var is empty");
  }
  return JSON.parse(raw);
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildRow(entry) {
  return [
    `<tr data-staff="${entry.is_staff ? "true" : "false"}">`,
    `<td>${entry.rank}</td>`,
    `<td>${escapeHtml(entry.display_name)}</td>`,
    `<td>${escapeHtml(entry.tier_label)}</td>`,
    `<td>${entry.score}</td>`,
    `</tr>`
  ].join("");
}

function buildTable(entries, generatedAt) {
  const syncedAt = generatedAt ? generatedAt.replace("T", " ").slice(0, 16) + " UTC" : "unknown";
  const lines = [`**Last synced:** \`${syncedAt}\``, ""];

  if (!entries || entries.length === 0) {
    lines.push("*No leaderboard data yet.*");
    return lines.join("\n");
  }

  lines.push(
    '<table class="pt-streetcred-table">',
    "<thead><tr><th>Rank</th><th>Member</th><th>Tier</th><th>Score</th></tr></thead>",
    "<tbody>",
    ...entries.map(buildRow),
    "</tbody>",
    "</table>"
  );

  return lines.join("\n");
}

function main() {
  const payload = readPayload();
  const guildId = payload.guild_id;
  if (!guildId) {
    throw new Error("Payload is missing guild_id");
  }

  const table = buildTable(payload.entries, payload.generated_at);

  let content = fs.readFileSync(PAGE_PATH, "utf8");
  const startIdx = content.indexOf(TABLE_START);
  const endIdx = content.indexOf(TABLE_END);
  if (startIdx === -1 || endIdx === -1) {
    throw new Error("Could not find BOT-INJECT:STREETCRED markers in streetcred.md");
  }

  const before = content.slice(0, startIdx + TABLE_START.length);
  const after = content.slice(endIdx);
  content = `${before}\n\n${table}\n\n${after}`;

  fs.writeFileSync(PAGE_PATH, content, "utf8");
  console.log(`Synced ${payload.entries ? payload.entries.length : 0} leaderboard entr(y/ies) to streetcred.md`);
}

main();
