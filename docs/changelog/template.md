---
title: Bot Changelog Template
description: Markdown template used by the Discord bot to post new changelog entries.
---

# CHANGELOG TEMPLATE // BOT INTERFACE SPEC

> `> THIS PAGE IS NOT A CHANGELOG.`
> `> THIS PAGE IS THE STENCIL THE BOT USES TO MAKE ONE.`

This page defines the exact Markdown structure the **Preem Team Discord
bot** should POST into [`changelog/index.md`](index.md) whenever staff
publish a new collection release. It is a reference for whoever maintains
the bot integration — not a page end users need to read.

!!! note "For bot maintainers"
    The bot should:

    1. Take the current **"Latest Release"** block from `changelog/index.md`.
    2. Append it to the top of the entry list in `changelog/archive.md`.
    3. Replace the **"Latest Release"** block in `changelog/index.md` with a
       newly filled-in copy of the template below.
    4. Update the **Supported Game Version** block at the top of
       `changelog/index.md` if the game version changed.

---

## Raw template

Copy everything inside the fence below. Fields wrapped in `{{ }}` are
placeholders the bot fills in from its release form / command inputs.

````markdown
## Latest Release — {{ version }}

<span class="pt-chip pt-chip--added">Added</span>
<span class="pt-chip pt-chip--changed">Changed</span>
<span class="pt-chip pt-chip--fixed">Fixed</span>
<span class="pt-chip pt-chip--removed">Removed</span>

`{{ date }}` · Posted by **{{ author }}** · Synced from `{{ source_channel }}`

### Added

{{ added_items }}

### Changed

{{ changed_items }}

### Fixed

{{ fixed_items }}

### Removed

{{ removed_items }}
````

## Field reference

| Field | Type | Description |
|---|---|---|
| `{{ version }}` | string | Collection version tag, e.g. `v4.4.0` |
| `{{ date }}` | string | ISO date, `YYYY-MM-DD` |
| `{{ author }}` | string | Discord display name or bot identity that triggered the post |
| `{{ source_channel }}` | string | Origin channel, e.g. `#changelog-feed` |
| `{{ added_items }}` | markdown list | Bullet list of new additions; omit the whole `### Added` block if empty |
| `{{ changed_items }}` | markdown list | Bullet list of changes; omit the block if empty |
| `{{ fixed_items }}` | markdown list | Bullet list of fixes; omit the block if empty |
| `{{ removed_items }}` | markdown list | Bullet list of removals; omit the block if empty |

!!! tip "Omit empty sections"
    If a release has no removals, the bot should drop the entire
    `### Removed` heading and chip for that entry rather than posting an
    empty section. Same applies to Added / Changed / Fixed.

!!! warning "Chip markup must stay inline HTML"
    The `<span class="pt-chip ...">` elements rely on `attr_list` /
    `md_in_html` support already enabled in `mkdocs.yml`. Don't let the bot
    escape or strip these tags when posting — only show the chips relevant
    to the sections actually present in that release.

## Example filled-in entry

````markdown
## Latest Release — v4.4.0

<span class="pt-chip pt-chip--added">Added</span>
<span class="pt-chip pt-chip--fixed">Fixed</span>

`2025-02-14` · Posted by **Preem Team Bot** · Synced from `#changelog-feed`

### Added

- Added `Braindance Enhancer` to the immersion bundle.

### Fixed

- Fixed a texture flicker on chrome-heavy cyberware under the new ReShade preset.
````

## Optional: breaking-change notice

If a release requires a full reinstall rather than an in-place update, the
bot should append this admonition immediately after the chip/metadata line:

````markdown
!!! warning "Breaking change"
    If you're updating from `{{ previous_version }}`, you must fully re-apply
    the collection rather than patching in place.
````

<div class="pt-flavor">
"A template is just a promise the future will look like the past, formatted correctly." — Bot integration notes
</div>
