---
title: Changelog Archive
description: Historical changelog entries for the Preem Team collection.
---

# CHANGELOG ARCHIVE // COLD STORAGE

> `> ACCESSING ARCHIVED LOGS...`
> `> RETENTION POLICY: PERMANENT`

Older changelog entries live here once they've been superseded by a newer
release on the [main Changelog page](index.md). Entries are appended by the
Discord bot in reverse-chronological order (newest archived entry first)
whenever it pushes a new release to the live page.

!!! info "Archival process"
    When the bot posts a new entry to [Changelog](index.md), the previous
    "Latest Release" block is automatically appended to the top of this page
    using the same format as [`template.md`](template.md).

---

## v4.2.1

<span class="pt-chip pt-chip--fixed">Fixed</span>

`2024-11-18` · Posted by **Preem Team Bot**

### Fixed

- Fixed an issue where `ArchiveXL` failed to resolve custom clothing
  appearances after the `2.20` game patch.
- Fixed collection installer reporting a false-positive conflict warning for
  users on Vortex `1.10+`.

---

## v4.2.0

<span class="pt-chip pt-chip--added">Added</span>
<span class="pt-chip pt-chip--changed">Changed</span>

`2024-10-30` · Posted by **Preem Team Bot**

### Added

- Added `Legacy Weather Overhaul` to the visual bundle.
- Added an optional "Lite" variant of the collection for lower-end rigs,
  dropping heavier visual mods.

### Changed

- Updated all core frameworks (CET, RED4ext, ArchiveXL, TweakXL) for
  compatibility with game patch `2.20`.
- Migrated collection distribution from a manual `.zip` package to a Vortex
  Collection listing.

---

## v4.1.0

<span class="pt-chip pt-chip--added">Added</span>
<span class="pt-chip pt-chip--fixed">Fixed</span>
<span class="pt-chip pt-chip--removed">Removed</span>

`2024-09-12` · Posted by **Preem Team Bot**

### Added

- Added `Cyberware Rebalance Suite (Beta)` as an optional module.
- Added Traditional Chinese and Brazilian Portuguese translations for the
  UI bundle.

### Fixed

- Fixed a rare save-corruption issue tied to an outdated cyberware mod,
  now removed from the collection (see below).

### Removed

- Removed `QuickHack Overhaul (Legacy)` due to the save-corruption issue
  identified above. Replaced in a later release.

---

## v4.0.0

<span class="pt-chip pt-chip--added">Added</span>

`2024-07-01` · Posted by **Preem Team Bot**

### Added

- Initial public release of the Preem Team collection as a unified,
  version-tracked bundle rather than a loose set of community
  recommendations.
- Established core framework bundle: CET, RED4ext, ArchiveXL, TweakXL.
- Established documentation site structure (this site).

<div class="pt-flavor">
"Cold storage never forgets. Neither does the bot." — Archive maintainers
</div>
