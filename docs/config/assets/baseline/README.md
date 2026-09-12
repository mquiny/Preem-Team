# Config baseline

The actual source-of-truth data behind [`docs/config/index.md`](../index.md)
— not just the rendered table, so future comparisons are reproducible
instead of relying on memory (which is exactly what went wrong before
this baseline was captured on 2026-09-12).

- **`vanilla/`** — the relevant mod settings files copied directly from a
  genuinely default install (no config mod active, no manual tweaks in
  any mod's settings menu). Mirrors the same relative paths as the game
  install itself (`bin/x64/plugins/cyber_engine_tweaks/mods/...`,
  `red4ext/plugins/mod_settings/user.ini`, etc.).
- **`pe-config-mod/`** — the actual downloaded PE Config Mod package
  (from Nexus) whose files get applied over the vanilla defaults above.
  This is the "After" side of the diff.

To refresh the Config page after a new PE Config Mod release: get a new
untouched vanilla snapshot the same way (fresh install or full settings
reset, no manual changes), diff each file's *parsed* values against the
matching file in the new PE Config Mod release (not a raw text diff --
several of these JSON files have unstable key ordering between exports,
which makes line-based diffs report false changes on identical values),
and update both this folder and `docs/config/index.md` together.

Note: a handful of CET mods (FilterSaves, NovaOptics, and others) don't
write their own `settings.json` until their in-game settings panel is
opened at least once -- a plain game launch isn't enough to generate
their defaults file.
