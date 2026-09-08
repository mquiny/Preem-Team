#!/usr/bin/env node
// scripts/add-manual-command.js
//
// Adds one mod's worth of spawn commands to docs/commands/manual-entries.json
// without you having to hand-escape any quotes -- paste the commands
// exactly as a mod author posted them (plain text, one per line, still
// wrapped in unescaped "double quotes") into a .txt file, then run:
//
//   node scripts/add-manual-command.js --file commands.txt --name "HK SMG Pack" --author "sabbath7991" --url "https://www.nexusmods.com/cyberpunk2077/mods/32144" --modId 32144
//
// --modId is optional (leave it off if you don't know it -- the mod just
// won't get auto-detected-and-skipped if the scanner later finds it for
// real, so double check manual-entries.json occasionally for entries
// that duplicate an automatically-found mod).
//
// If a mod with the same name already exists in manual-entries.json,
// its commands are merged (deduped) rather than creating a second entry.
// Re-run generate-spawn-commands.js afterwards to fold this into
// spawn_commands.json.

const fs = require('fs');
const path = require('path');

const MANUAL_ENTRIES_PATH = path.join(__dirname, '..', 'docs', 'commands', 'manual-entries.json');
const COMMAND_RE = /Game\.AddToInventory\([^)]*\)|Game\.GetVehicleSystem\(\):EnablePlayerVehicle\([^)]*\)/;

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      args[key] = argv[i + 1];
      i++;
    }
  }
  return args;
}

function loadManualEntries() {
  try {
    const raw = fs.readFileSync(MANUAL_ENTRIES_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.file || !args.name) {
    console.error('Usage: node add-manual-command.js --file <commands.txt> --name "<Mod Name>" [--author "<Author>"] [--url "<Nexus URL>"] [--modId <id>]');
    process.exit(1);
  }

  let rawText;
  try {
    rawText = fs.readFileSync(args.file, 'utf8');
  } catch (err) {
    console.error(`Could not read ${args.file}: ${err.message}`);
    process.exit(1);
  }

  const lines = rawText.split(/\r?\n/);
  const commands = [];
  const skippedLines = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (COMMAND_RE.test(trimmed)) {
      commands.push(trimmed);
    } else {
      skippedLines.push(trimmed);
    }
  }

  if (commands.length === 0) {
    console.error('No Game.AddToInventory(...) or Game.GetVehicleSystem():EnablePlayerVehicle(...) lines found in that file.');
    process.exit(1);
  }

  if (skippedLines.length > 0) {
    console.log(`Skipped ${skippedLines.length} line(s) that didn't look like a spawn command (headers like "LEGENDARY:", blank lines, etc. -- this is normal):`);
    skippedLines.slice(0, 10).forEach((l) => console.log(`  "${l}"`));
    if (skippedLines.length > 10) console.log(`  ...and ${skippedLines.length - 10} more`);
  }

  const entries = loadManualEntries();
  const existing = entries.find((e) => e.name.toLowerCase() === args.name.toLowerCase());

  if (existing) {
    const before = existing.commands.length;
    const merged = new Set([...existing.commands, ...commands]);
    existing.commands = Array.from(merged).sort();
    existing.author = args.author || existing.author;
    existing.url = args.url || existing.url;
    if (args.modId) existing.modId = Number(args.modId);
    console.log(`Merged into existing entry "${existing.name}": ${before} -> ${existing.commands.length} commands.`);
  } else {
    entries.push({
      modId: args.modId ? Number(args.modId) : null,
      name: args.name,
      author: args.author || null,
      url: args.url || null,
      version: null,
      sources: ['manual'],
      aliases: [],
      commands: commands.sort()
    });
    console.log(`Added new entry "${args.name}" with ${commands.length} commands.`);
  }

  fs.mkdirSync(path.dirname(MANUAL_ENTRIES_PATH), { recursive: true });
  fs.writeFileSync(MANUAL_ENTRIES_PATH, JSON.stringify(entries, null, 2) + '\n');

  console.log(`Wrote ${MANUAL_ENTRIES_PATH}`);
  console.log('Now re-run generate-spawn-commands.js (or refresh-commands.bat) to fold this into spawn_commands.json.');
}

main();
