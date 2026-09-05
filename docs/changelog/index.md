---
title: Changelog
description: Latest changes to the Preem Team collection.
---

# CHANGELOG // LIVE FEED

> `> SUBSCRIBING TO #changelog-feed...`
> `> AUTO-SYNC: ENABLED`
> `> SOURCE: DISCORD BOT`

This page tracks the current state of the Preem Team collection. Entries
below are posted automatically by the Preem Team Discord bot whenever staff
push a new revision — this page always reflects the **latest** entry. Older
entries roll off into the [Archive](archive.md).

!!! info "How this page updates"
    Entries are generated from [`template.md`](template.md), which the bot
    fills in and posts here whenever a new collection version ships. Nothing
    on this page should be hand-edited except by the bot or a staff member
    performing a manual sync.

---

## Supported Game Version

**Cyberpunk 2077:** `2.21`
**Collection Build:** `v4.3.0`
**Last Updated:** `2025-01-01`

!!! tip "Always check this first"
    Before downloading the collection in [Installation](../installation/index.md),
    confirm your game version matches the one listed above.

---

## Latest Release — v4.3.0

<span class="pt-chip pt-chip--added">Added</span>
<span class="pt-chip pt-chip--changed">Changed</span>
<span class="pt-chip pt-chip--fixed">Fixed</span>
<span class="pt-chip pt-chip--removed">Removed</span>

`2025-01-01` · Posted by **Preem Team Bot** · Synced from `#changelog-feed`

### Added

- Added `Cyberware Rebalance Suite` to the core gameplay bundle.
- Added a new ReShade preset: `Night City — Chrome Noir`.
- Added support for the `2.21` game patch across all bundled frameworks.

### Changed

- Updated `RED4ext` to the latest compatible build.
- Adjusted default HUD scale in the UI bundle for 21:9 ultrawide displays.
- Reordered load order for `TweakXL`-dependent gameplay mods to resolve
  minor stat conflicts.

### Fixed

- Fixed a crash on boot when running the collection alongside certain
  outdated ReShade installs.
- Fixed missing textures on select cyberware models introduced in a prior
  patch.
- Fixed CET console failing to open for users with non-default keyboard
  layouts.

### Removed

- Removed `Legacy Weather Overhaul` — superseded by the bundled weather
  system in `2.21`.

!!! warning "Breaking change"
    If you're updating from `v4.2.x`, you must fully re-apply the collection
    rather than patching in place — the load order changes in this release
    are not backward compatible with the previous mod set.

---

Looking for a specific past release? Head to the [Archive](archive.md).

<div class="pt-flavor">
"Every patch note is a promise. Some of them are even kept." — Preem Team release notes
</div>
