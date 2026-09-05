---
title: Changelog Archive
description: Historical changelog entries for the Preem Team collection.
---

# CHANGELOG ARCHIVE // COLD STORAGE

> `> ACCESSING ARCHIVED LOGS...`
> `> RETENTION POLICY: PERMANENT`

Older changelog entries live here once they've been superseded by a newer
release on the [main Changelog page](index.md). Click a release below to
see its full changes — entries are added by the Discord bot in
reverse-chronological order (newest archived entry first) whenever it
pushes a new release to the live page.

!!! info "Archival process"
    When the bot posts a new entry to [Changelog](index.md), the previous
    "Latest Release" card is automatically moved to the top of this page
    using the same format as [`template.md`](template.md).

---

<!-- CHANGELOG:ENTRIES:START -->
<div class="pt-changelog-cards" markdown="1">

<!-- CHANGELOG:PREPEND_HERE -->

<button type="button" class="pt-changelog-card" data-pt-changelog-open="changelog-subnautica-2-reborn-8">
<span class="pt-changelog-card-version">Subnautica 2 Reborn-8</span>
<span class="pt-changelog-card-date">2026-09-05</span>
<span class="pt-changelog-card-chips"><span class="pt-chip pt-chip--updated">Updated</span></span>
</button>

<dialog class="pt-changelog-modal" id="changelog-subnautica-2-reborn-8" markdown="1">
<div class="pt-changelog-modal-inner" markdown="1">

<button type="button" class="pt-changelog-modal-close" data-pt-changelog-close aria-label="Close changelog">×</button>

## Subnautica 2 Reborn-8

<span class="pt-chip pt-chip--updated">Updated</span>

`2026-09-05` · Posted by **Preem Team Bot** · Synced from `#Sub2`

### Updated

- [Capacity and QuickBar Tweaks](https://www.nexusmods.com/subnautica2/mods/252) (v1.4.0 → v1.4.3)
- [Limitless Building](https://www.nexusmods.com/subnautica2/mods/331) (v1 → v2)
- [Mod Settings for Subnautica 2 - DELETED](https://www.nexusmods.com/subnautica2/mods/20) (v1.1.2 → v1.3.1)
- [Processor Rush PAK And UE4SS Version](https://www.nexusmods.com/subnautica2/mods/101) (v1.0.1 → v1.0.2)
- [Quick Stack to Nearby Containers](https://www.nexusmods.com/subnautica2/mods/128) (v3.3.3 → v5.0.0)
- [Resource Multiplier](https://www.nexusmods.com/subnautica2/mods/132) (v1.0.3 → v1.0.4)
- [Sleep Through the Night](https://www.nexusmods.com/subnautica2/mods/207) (v1.0.2 → v1.0.3)
- [SNwaypoint](https://www.nexusmods.com/subnautica2/mods/294) (v0.4-beta → v0.5-beta)
- [UE4SS - Subnautica 2](https://www.nexusmods.com/subnautica2/mods/36) (v3.0.1 → vd7e7826d)

</div>
</dialog>

<button type="button" class="pt-changelog-card" data-pt-changelog-open="changelog-v4-3-0">
<span class="pt-changelog-card-version">v4.3.0</span>
<span class="pt-changelog-card-date">2025-01-01</span>
<span class="pt-changelog-card-chips">
<span class="pt-chip pt-chip--added">Added</span>
<span class="pt-chip pt-chip--updated">Updated</span>
<span class="pt-chip pt-chip--removed">Removed</span>
</span>
</button>

<dialog class="pt-changelog-modal" id="changelog-v4-3-0" markdown="1">
<div class="pt-changelog-modal-inner" markdown="1">

<button type="button" class="pt-changelog-modal-close" data-pt-changelog-close aria-label="Close changelog">×</button>

## v4.3.0

<span class="pt-chip pt-chip--added">Added</span>
<span class="pt-chip pt-chip--updated">Updated</span>
<span class="pt-chip pt-chip--removed">Removed</span>

`2025-01-01` · Posted by **Preem Team Bot** · Synced from `#changelog-feed`

### Added {: .pt-changelog-h-added }

- Added `Cyberware Rebalance Suite` to the core gameplay bundle.
- Added a new ReShade preset: `Night City — Chrome Noir`.
- Added support for the `2.21` game patch across all bundled frameworks.

### Updated

- Updated `RED4ext` to the latest compatible build.
- Adjusted default HUD scale in the UI bundle for 21:9 ultrawide displays.
- Reordered load order for `TweakXL`-dependent gameplay mods to resolve
  minor stat conflicts.
- Fixed a crash on boot when running the collection alongside certain
  outdated ReShade installs.
- Fixed missing textures on select cyberware models introduced in a prior
  patch.
- Fixed CET console failing to open for users with non-default keyboard
  layouts.

### Removed {: .pt-changelog-h-removed }

- Removed `Legacy Weather Overhaul` — superseded by the bundled weather
  system in `2.21`.

!!! warning "Breaking change"
    If you're updating from `v4.2.x`, you must fully re-apply the collection
    rather than patching in place — the load order changes in this release
    are not backward compatible with the previous mod set.

</div>
</dialog>

<button type="button" class="pt-changelog-card" data-pt-changelog-open="changelog-v4-2-1">
<span class="pt-changelog-card-version">v4.2.1</span>
<span class="pt-changelog-card-date">2024-11-18</span>
<span class="pt-changelog-card-chips">
<span class="pt-chip pt-chip--updated">Updated</span>
</span>
</button>

<dialog class="pt-changelog-modal" id="changelog-v4-2-1" markdown="1">
<div class="pt-changelog-modal-inner" markdown="1">

<button type="button" class="pt-changelog-modal-close" data-pt-changelog-close aria-label="Close changelog">×</button>

## v4.2.1

<span class="pt-chip pt-chip--updated">Updated</span>

`2024-11-18` · Posted by **Preem Team Bot**

### Updated

- Fixed an issue where `ArchiveXL` failed to resolve custom clothing
  appearances after the `2.20` game patch.
- Fixed collection installer reporting a false-positive conflict warning for
  users on Vortex `1.10+`.

</div>
</dialog>

<button type="button" class="pt-changelog-card" data-pt-changelog-open="changelog-v4-2-0">
<span class="pt-changelog-card-version">v4.2.0</span>
<span class="pt-changelog-card-date">2024-10-30</span>
<span class="pt-changelog-card-chips">
<span class="pt-chip pt-chip--added">Added</span>
<span class="pt-chip pt-chip--updated">Updated</span>
</span>
</button>

<dialog class="pt-changelog-modal" id="changelog-v4-2-0" markdown="1">
<div class="pt-changelog-modal-inner" markdown="1">

<button type="button" class="pt-changelog-modal-close" data-pt-changelog-close aria-label="Close changelog">×</button>

## v4.2.0

<span class="pt-chip pt-chip--added">Added</span>
<span class="pt-chip pt-chip--updated">Updated</span>

`2024-10-30` · Posted by **Preem Team Bot**

### Added {: .pt-changelog-h-added }

- Added `Legacy Weather Overhaul` to the visual bundle.
- Added an optional "Lite" variant of the collection for lower-end rigs,
  dropping heavier visual mods.

### Updated

- Updated all core frameworks (CET, RED4ext, ArchiveXL, TweakXL) for
  compatibility with game patch `2.20`.
- Migrated collection distribution from a manual `.zip` package to a Vortex
  Collection listing.

</div>
</dialog>

<button type="button" class="pt-changelog-card" data-pt-changelog-open="changelog-v4-1-0">
<span class="pt-changelog-card-version">v4.1.0</span>
<span class="pt-changelog-card-date">2024-09-12</span>
<span class="pt-changelog-card-chips">
<span class="pt-chip pt-chip--added">Added</span>
<span class="pt-chip pt-chip--updated">Updated</span>
<span class="pt-chip pt-chip--removed">Removed</span>
</span>
</button>

<dialog class="pt-changelog-modal" id="changelog-v4-1-0" markdown="1">
<div class="pt-changelog-modal-inner" markdown="1">

<button type="button" class="pt-changelog-modal-close" data-pt-changelog-close aria-label="Close changelog">×</button>

## v4.1.0

<span class="pt-chip pt-chip--added">Added</span>
<span class="pt-chip pt-chip--updated">Updated</span>
<span class="pt-chip pt-chip--removed">Removed</span>

`2024-09-12` · Posted by **Preem Team Bot**

### Added {: .pt-changelog-h-added }

- Added `Cyberware Rebalance Suite (Beta)` as an optional module.
- Added Traditional Chinese and Brazilian Portuguese translations for the
  UI bundle.

### Updated

- Fixed a rare save-corruption issue tied to an outdated cyberware mod,
  now removed from the collection (see below).

### Removed {: .pt-changelog-h-removed }

- Removed `QuickHack Overhaul (Legacy)` due to the save-corruption issue
  identified above. Replaced in a later release.

</div>
</dialog>

<button type="button" class="pt-changelog-card" data-pt-changelog-open="changelog-v4-0-0">
<span class="pt-changelog-card-version">v4.0.0</span>
<span class="pt-changelog-card-date">2024-07-01</span>
<span class="pt-changelog-card-chips">
<span class="pt-chip pt-chip--added">Added</span>
</span>
</button>

<dialog class="pt-changelog-modal" id="changelog-v4-0-0" markdown="1">
<div class="pt-changelog-modal-inner" markdown="1">

<button type="button" class="pt-changelog-modal-close" data-pt-changelog-close aria-label="Close changelog">×</button>

## v4.0.0

<span class="pt-chip pt-chip--added">Added</span>

`2024-07-01` · Posted by **Preem Team Bot**

### Added {: .pt-changelog-h-added }

- Initial public release of the Preem Team collection as a unified,
  version-tracked bundle rather than a loose set of community
  recommendations.
- Established core framework bundle: CET, RED4ext, ArchiveXL, TweakXL.
- Established documentation site structure (this site).

</div>
</dialog>

</div>
<!-- CHANGELOG:ENTRIES:END -->

<div class="pt-flavor">
"Cold storage never forgets. Neither does the bot." — Archive maintainers
</div>
