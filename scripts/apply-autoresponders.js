#!/usr/bin/env node
// Applies an incoming auto-responder list (fired by ncrbot as a
// `repository_dispatch` event whenever a mod adds/edits/removes a
// Discord auto-response via /autoresponder) to
// docs/troubleshooting/quick_commands.md.
//
// The bot always sends its FULL current list, not a diff -- so this
// script just rewrites the whole table between markers every time,
// same approach as scripts/sync-issues.js. Read-only reference page:
// nothing here can be edited from the site itself.
//
// Invoked by .github/workflows/autoresponder-dispatch.yml with the
// payload JSON in the AUTORESPONDER_PAYLOAD env var.
//
// Payload fields: guild_id, responses (array of { trigger, response,
// wildcard, allowed_channel_ids }).

const fs = require("fs");
const path = require("path");

const PAGE_PATH = path.join(__dirname, "..", "docs", "troubleshooting", "quick_commands.md");

const TABLE_START = "<!-- BOT-INJECT:AUTORESPONDERS:START -->";
const TABLE_END = "<!-- BOT-INJECT:AUTORESPONDERS:END -->";

function readPayload() {
  const raw = process.env.AUTORESPONDER_PAYLOAD;
  if (!raw) {
    throw new Error("AUTORESPONDER_PAYLOAD env var is empty");
  }
  return JSON.parse(raw);
}

// Keep a stray "|" or newline in a trigger/response from breaking the
// table layout -- responses can be multi-line free text.
function escapeCell(text) {
  return String(text)
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, "<br>");
}

function formatChannels(guildId, channelIds) {
  if (!channelIds || channelIds.length === 0) {
    return "All (global)";
  }
  return channelIds
    .map((id) => `[#channel](https://discord.com/channels/${guildId}/${id})`)
    .join(", ");
}

function buildRow(guildId, entry) {
  const trigger = `\`${escapeCell(entry.trigger)}\``;
  const wildcard = entry.wildcard ? "Wildcard" : "Exact match";
  const response = escapeCell(entry.response);
  const channels = formatChannels(guildId, entry.allowed_channel_ids);
  return `| ${trigger} | ${wildcard} | ${response} | ${channels} |`;
}

function buildTable(guildId, responses) {
  if (!responses || responses.length === 0) {
    return "*No auto-responses configured yet.*";
  }

  const sorted = [...responses].sort((a, b) => a.trigger.localeCompare(b.trigger));

  const lines = [
    "| Trigger | Match | Response | Channels |",
    "|---|---|---|---|"
  ];
  for (const entry of sorted) lines.push(buildRow(guildId, entry));

  return lines.join("\n");
}

function main() {
  const payload = readPayload();
  const guildId = payload.guild_id;
  if (!guildId) {
    throw new Error("Payload is missing guild_id");
  }

  const table = buildTable(guildId, payload.responses);

  let content = fs.readFileSync(PAGE_PATH, "utf8");
  const startIdx = content.indexOf(TABLE_START);
  const endIdx = content.indexOf(TABLE_END);
  if (startIdx === -1 || endIdx === -1) {
    throw new Error("Could not find BOT-INJECT:AUTORESPONDERS markers in quick_commands.md");
  }

  const before = content.slice(0, startIdx + TABLE_START.length);
  const after = content.slice(endIdx);
  content = `${before}\n\n${table}\n\n${after}`;

  fs.writeFileSync(PAGE_PATH, content, "utf8");
  console.log(`Synced ${payload.responses ? payload.responses.length : 0} auto-response(s) to quick_commands.md`);
}

main();
