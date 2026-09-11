# Preem Team Companion

A small [Cyber Engine Tweaks](https://github.com/maximegmd/CyberEngineTweaks)
(CET) overlay for the Preem Team collection. Press a hotkey in-game to pop
up a panel with a "preem.team" link, a changelog snapshot, and a known-issues
snapshot.

This is a **companion mod for your own collection** — not a gameplay mod —
so it's a good first CET project: no combat/quest systems to fight with,
just ImGui and a hotkey.

## Try it locally

1. Copy this folder into your game's CET mods directory, e.g.:
   `<Cyberpunk 2077>\bin\x64\plugins\cyber_engine_tweaks\mods\preem-team-companion\`
   (Don't do this inside a Vortex-managed mods folder — Vortex may clean up
   files it doesn't know about. Copy manually for testing, package for
   Nexus/Vortex separately once it's ready.)
2. Launch the game, open Settings → Input, and bind a key to
   **"Toggle Preem Team Companion window"**.
3. In-game, press that key. The panel should appear.

## Updating the snapshot

`init.lua`'s `SNAPSHOT` table is a static copy of changelog/known-issues
data, edited by hand before each release:

```lua
changelog = {
    { version = "CPE-14", date = "2026-08-01", summary = "Added X, fixed Y" },
},
knownIssues = {
    { title = "Some bug", url = "https://github.com/mquiny/Preem-Team/issues/1" },
},
```

Pull the real current values from
[`docs/changelog/index.md`](../../docs/changelog/index.md) and
[`docs/troubleshooting/issue_viewer.md`](../../docs/troubleshooting/issue_viewer.md)
before packaging a release.

## Roadmap ideas (not implemented yet)

- Have the bot that posts changelogs (`scripts/apply-changelog.js`) also
  emit a small `snapshot.json` this mod could ship alongside itself, so
  updating the mod is a data refresh instead of a Lua edit.
- Show which of the collection's mods are currently loaded, by checking
  which mod folders exist under `cyber_engine_tweaks/mods/`.
- A first-launch toast instead of requiring a keybind.

## Packaging for Nexus

Zip this folder as-is (keep the `preem-team-companion/` folder at the zip
root) so it installs straight into
`bin\x64\plugins\cyber_engine_tweaks\mods\`. Requires players to have CET
installed — call that out as a requirement on the Nexus page.
