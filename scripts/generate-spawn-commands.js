#!/usr/bin/env node
// scripts/generate-spawn-commands.js
//
// Local dev-machine tool, NOT run in CI -- unlike scripts/apply-*.js (which
// GitHub Actions runs against a bot-dispatched payload), this reads your
// local Vortex staging folder and/or Nexus "mod-extra-files" folder
// directly, so it only works run by hand on your own PC.
//
// Scans every mod folder for two console-spawn-command conventions:
//   Game.AddToInventory("Items.xxx")                          -- items
//   Game.GetVehicleSystem():EnablePlayerVehicle("Vehicle.xxx", true, false) -- vehicles
// (checked against ~8700 real item-command occurrences; every other
// candidate pattern like bare ".AddItem(" turned out to be unrelated reds
// script internals, not user-facing commands). Lines are picked up
// whether they're a standalone comment or a trailing comment on a YAML
// data line, since mod authors do both, and regardless of single vs.
// double quotes, since both show up across different authors' mods.
//
// NOT every mod that HAS a spawn command puts it in its own files --
// some authors only post it as text (or worse, an image) on the Nexus
// mod page description and nowhere in the actual download. There's
// nothing this script (or any local file scan) can do about those; they
// just won't appear here.
//
// Each mod folder's name is parsed for a Nexus mod ID (two naming
// conventions exist across the collection -- see parseModFolderName),
// and where one's found, that mod's real name/author is looked up from
// the Nexus API rather than trusted from the folder name, which is often
// truncated/decorated with staging tags like "(PM)(F)". Lookups are
// cached locally (data/nexus-mod-cache.json, gitignored) so re-running
// this after adding a handful of new mods doesn't re-fetch the other
// ~300 every time.
//
// Usage (from repo root):
//   NEXUS_API_KEY=xxx node scripts/generate-spawn-commands.js "F:\Vortex\Vortex Staging\Cyberpunk 2077" "F:\GOG Galaxy\Cyberpunk 2077\Cyberpunk 2077\V2077\mod-extra-files"
//
// Writes docs/commands/assets/spawn_commands.json, which
// docs/javascripts/spawn-commands.js fetches client-side.

const fs = require('fs');
const path = require('path');

const SCAN_EXTENSIONS = new Set(['.yaml', '.yml', '.reds', '.txt', '.md', '.lua', '.json', '.ini', '.cfg']);
const COMMAND_RE = /Game\.AddToInventory\([^)]*\)|Game\.GetVehicleSystem\(\):EnablePlayerVehicle\([^)]*\)/g;
const CACHE_PATH = path.join(__dirname, '..', 'data', 'nexus-mod-cache.json');
const OUTPUT_PATH = path.join(__dirname, '..', 'docs', 'commands', 'assets', 'spawn_commands.json');
const DOMAIN = 'cyberpunk2077';
const NEXUS_API_KEY = process.env.NEXUS_API_KEY;
const APP_NAME = process.env.APP_NAME || 'PreemTeamSite';
const APP_VERSION = process.env.APP_VERSION || '1.0.0';
const REQUEST_DELAY_MS = 300; // polite pacing for a one-off bulk run, not the hourly-budget concern the bot's collection-health sweep has
const MAX_NEW_LOOKUPS_PER_RUN = 80; // safety net for a cold/deleted cache -- at 300ms spacing this is well under Nexus's ~100/hr limit even alone, with headroom for the bot's own API usage on the same key. Anything left over just falls back to its folder name and resolves itself on the next run.

// Two folder-naming conventions seen in the wild:
//   "Zenitex Armor Pads 12044 4.1 2026-06-20T11-45Z MTheTj2uo (V2077)"   (Nexus Collections-style download)
//   "SOLO Vol9-28315-1-0-1774002865"                                     (classic Vortex/NXM download)
// Anything matching neither just keeps its raw folder name and gets no
// Nexus lookup (no modId to look up with) -- still included in the
// output, just without an author.
function parseModFolderName(folderName) {
  // The trailing "(V2077)"-style domain tag only shows up in some listings
  // (e.g. the GOG mod-extra-files folder) -- Vortex's own staging folder
  // names for the exact same download drop it entirely, so it has to be
  // optional here or every staging-folder mod silently fails to parse.
  let m = folderName.match(/^(.*?)\s+(\d{2,7})\s+([\d.]+)\s+\d{4}-\d{2}-\d{2}T\d{2}-\d{2}Z\s+\S+?(?:\s+\([^)]*\))?\s*$/);
  if (m) return { name: m[1].trim(), modId: Number(m[2]), version: m[3] };

  m = folderName.match(/^(.*)-(\d{2,7})-([\d-]+)-(\d{9,11})$/);
  if (m) return { name: m[1].trim(), modId: Number(m[2]), version: m[3].replace(/-/g, '.') };

  return { name: folderName.trim(), modId: null, version: null };
}

function walkFiles(dir) {
  let results = [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walkFiles(full));
    } else if (SCAN_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      results.push(full);
    }
  }

  return results;
}

function extractCommandsFromFile(filePath) {
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch {
    return [];
  }
  return content.match(COMMAND_RE) || [];
}

function scanModsRoot(rootDir, sourceLabel, modsByKey) {
  let folders;
  try {
    folders = fs.readdirSync(rootDir, { withFileTypes: true }).filter((e) => e.isDirectory());
  } catch (err) {
    console.error(`Could not read ${rootDir}: ${err.message}`);
    return;
  }

  for (const folderEntry of folders) {
    const folderPath = path.join(rootDir, folderEntry.name);
    const files = walkFiles(folderPath);
    const commandSet = new Set();

    for (const file of files) {
      for (const cmd of extractCommandsFromFile(file)) {
        commandSet.add(cmd.trim());
      }
    }

    if (commandSet.size === 0) continue;

    const parsed = parseModFolderName(folderEntry.name);
    const key = parsed.modId != null ? `id:${parsed.modId}` : `name:${parsed.name.toLowerCase()}`;

    if (!modsByKey.has(key)) {
      modsByKey.set(key, {
        modId: parsed.modId,
        folderName: parsed.name,
        version: parsed.version,
        commands: new Set(),
        sources: new Set()
      });
    }

    const entryData = modsByKey.get(key);
    entryData.sources.add(sourceLabel);
    for (const cmd of commandSet) entryData.commands.add(cmd);
  }
}

async function fetchNexusInfo(modId, cache) {
  if (cache[modId]) return cache[modId];
  if (!NEXUS_API_KEY) return null;

  const url = `https://api.nexusmods.com/v1/games/${DOMAIN}/mods/${modId}.json`;
  try {
    const res = await fetch(url, {
      headers: {
        apikey: NEXUS_API_KEY,
        'Application-Name': APP_NAME,
        'Application-Version': APP_VERSION
      }
    });

    if (!res.ok) {
      console.warn(`  Nexus lookup failed for mod ${modId}: HTTP ${res.status}`);
      return null;
    }

    const data = await res.json();
    const info = {
      name: data.name,
      author: data.author || data.uploaded_by || null,
      url: `https://www.nexusmods.com/${DOMAIN}/mods/${modId}`
    };
    cache[modId] = info;
    return info;
  } catch (err) {
    console.warn(`  Nexus lookup error for mod ${modId}: ${err.message}`);
    return null;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const roots = process.argv.slice(2);
  if (roots.length === 0) {
    console.error('Usage: node generate-spawn-commands.js <root folder 1> [root folder 2] ...');
    process.exit(1);
  }

  const modsByKey = new Map();
  for (const root of roots) {
    scanModsRoot(root, path.basename(root), modsByKey);
  }

  console.log(`Found ${modsByKey.size} mod folders with spawn commands across ${roots.length} root(s).`);

  if (!NEXUS_API_KEY) {
    console.warn('NEXUS_API_KEY not set -- skipping author/name lookups, falling back to folder names for everything.');
  }

  let cache = {};
  try {
    cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
  } catch {
    // no cache yet, start fresh
  }

  const results = [];
  let lookedUp = 0;

  for (const entry of modsByKey.values()) {
    let displayName = entry.folderName;
    let author = null;
    let url = null;

    if (entry.modId != null) {
      const wasCached = Boolean(cache[entry.modId]);

      if (wasCached || lookedUp < MAX_NEW_LOOKUPS_PER_RUN) {
        const info = await fetchNexusInfo(entry.modId, cache);
        if (info) {
          displayName = info.name || displayName;
          author = info.author;
          url = info.url;
        }
        if (!wasCached && info) {
          lookedUp++;
          await sleep(REQUEST_DELAY_MS);
        }
      }
      // else: hit the per-run cap on brand-new lookups -- leave this one
      // on its folder name for now, it'll resolve on the next run instead
      // of risking the rest of this run hitting Nexus's rate limit.
    }

    results.push({
      modId: entry.modId,
      name: displayName,
      author,
      url,
      version: entry.version,
      sources: Array.from(entry.sources),
      commands: Array.from(entry.commands).sort()
    });
  }

  const merged = mergeDuplicatesByCommandSet(results);
  merged.sort((a, b) => a.name.localeCompare(b.name));

  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(merged, null, 2));

  console.log(`Looked up ${lookedUp} new mod(s) on Nexus this run (${Object.keys(cache).length} cached total).`);
  if (lookedUp >= MAX_NEW_LOOKUPS_PER_RUN) {
    console.log(`Hit the per-run lookup cap (${MAX_NEW_LOOKUPS_PER_RUN}) -- some mods may still show their raw folder name. Run this again to pick up the rest.`);
  }
  console.log(`Merged ${results.length} raw entries down to ${merged.length} (same install bundled/named differently across the two folders).`);
  console.log(`Wrote ${merged.length} mods to ${OUTPUT_PATH}`);
}

// The same mod frequently shows up as two separate folders -- once in
// Vortex staging with full metadata (so it gets a real Nexus name/author),
// once in mod-extra-files with just a bare name Nexus lookup can't key
// off of at all. Rather than try to fuzzy-match names (fragile -- "Zenitex
// Combat Gloves" vs "Zenitex Combat Gloves - ArchiveXL (2.0)" isn't a
// fixed suffix to strip), this merges any group of entries that share the
// EXACT SAME set of commands -- since two genuinely different mods
// essentially never bundle byte-identical item ID lists, this is a safe
// signal even though it occasionally merges a repack/bundle mod in with
// the original it wraps. All non-primary names are kept as `aliases` so
// searching by either name still finds the entry, rather than silently
// discarding the information.
function mergeDuplicatesByCommandSet(entries) {
  const groups = new Map();

  for (const entry of entries) {
    const key = entry.commands.join('\n');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  }

  const merged = [];
  for (const group of groups.values()) {
    if (group.length === 1) {
      merged.push({ ...group[0], aliases: [] });
      continue;
    }

    // Prefer whichever entry actually got a real Nexus name/author over
    // one that fell back to a raw folder name.
    const primary = group.find((e) => e.author) || group[0];
    const aliasNames = [...new Set(group.map((e) => e.name).filter((n) => n !== primary.name))];
    const allSources = [...new Set(group.flatMap((e) => e.sources))];

    merged.push({
      ...primary,
      sources: allSources,
      aliases: aliasNames
    });
  }

  return merged;
}

main();
