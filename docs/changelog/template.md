---
title: Bot Changelog Template
description: Markdown/HTML structure used to post new changelog entries as click-to-open cards.
---

# CHANGELOG TEMPLATE // BOT INTERFACE SPEC

> `> THIS PAGE IS NOT A CHANGELOG.`
> `> THIS PAGE IS THE STENCIL THE BOT USES TO MAKE ONE.`

This page defines the exact structure [`scripts/apply-changelog.js`](https://github.com/mquiny/Preem-Team/blob/main/scripts/apply-changelog.js)
builds whenever the Discord bot fires a changelog update. Each release is a
small clickable **card**; clicking it opens a **popup** (a native `<dialog>`)
with the full changes, instead of a long scrolling page. It's a reference
for whoever maintains the bot integration — not a page end users need to
read.

!!! note "How this actually works"
    The bot (`utils/siteChangelogDispatcher.js` in the ncrbot repo) fires a
    `repository_dispatch` event with a JSON payload. A GitHub Action
    (`.github/workflows/changelog-dispatch.yml`) runs `apply-changelog.js`,
    which:

    1. Pulls the current release's card+popup out of `changelog/index.md`.
    2. Re-IDs it and moves it into `changelog/archive.md`'s card grid.
    3. Builds a fresh card+popup from the payload and puts it in `index.md`.
    4. Updates the **Supported Game Version** block if it changed.

    Nothing on `index.md` or `archive.md` should be hand-edited except by
    that script.

---

## Payload fields

| Field | Type | Description |
|---|---|---|
| `collection_slug` | string | Nexus collection slug — used bot-side to gate which collections push to the site at all (`SITE_CHANGELOG_SLUGS`) |
| `version` | string | Collection version/revision tag, e.g. `CPE-14` |
| `game_version` | string | Cyberpunk 2077 version this release targets |
| `date` | string | ISO date, `YYYY-MM-DD` |
| `author` | string | Bot identity that posted it, e.g. `Preem Team Bot` |
| `source_channel` | string | Origin channel/group name, e.g. `#Sub2` |
| `added_items` | markdown list | Bullet list of new additions, or `""` if none |
| `updated_items` | markdown list | Bullet list of version bumps/changes, or `""` if none |
| `removed_items` | markdown list | Bullet list of removals, or `""` if none |

!!! note "No 'Fixed' category"
    There's no `fixed_items` field — the bot's diff data only knows
    Added/Updated/Removed (it's a straight revision-to-revision mod diff,
    not a curated changelog), so there's nothing to source a "Fixed"
    section from. A category with no data (`""`) is simply omitted — no
    empty chip, no empty heading.

## Card + popup markup

Each entry is a `<button>` (the card) immediately followed by its matching
`<dialog>` (the popup), sharing an id via `data-pt-changelog-open="…"` /
`id="…"`. Both need `markdown="1"` on themselves, not just the innermost
content div — `md_in_html` treats an entire subtree as opaque raw HTML the
moment it hits *any* ancestor without that attribute, however deep the real
markdown="1" div sits.

````markdown
<button type="button" class="pt-changelog-card" data-pt-changelog-open="{{ dialog_id }}">
<span class="pt-changelog-card-version">{{ version }}</span>
<span class="pt-changelog-card-date">{{ date }}</span>
<span class="pt-changelog-card-chips">{{ chips }}</span>
</button>

<dialog class="pt-changelog-modal" id="{{ dialog_id }}" markdown="1">
<div class="pt-changelog-modal-inner" markdown="1">

<button type="button" class="pt-changelog-modal-close" data-pt-changelog-close aria-label="Close changelog">×</button>

## {{ version }}

{{ chips }}

`{{ date }}` · Posted by **{{ author }}** · Synced from `{{ source_channel }}`

### Added {: .pt-changelog-h-added }

{{ added_items }}

### Updated

{{ updated_items }}

### Removed {: .pt-changelog-h-removed }

{{ removed_items }}

</div>
</dialog>
````

- `{{ dialog_id }}` — on `changelog/index.md` this is always the fixed id
  `changelog-current` (there's only ever one "current" release). On
  `changelog/archive.md`, where many entries coexist, it's
  `changelog-{{ slugified version }}` (e.g. `changelog-v4-3-0`).
- `{{ chips }}` — one `<span class="pt-chip pt-chip--{added|updated|removed}">…</span>`
  per non-empty category, nothing for empty ones.
- The `{: .pt-changelog-h-added }` / `{: .pt-changelog-h-removed }` bits are
  `attr_list` syntax — that's what lets [`stylesheets/changelog.css`](https://github.com/mquiny/Preem-Team/blob/main/docs/stylesheets/changelog.css)
  colour those two headings green/red. "Updated" needs no class — `<h3>`
  is already yellow site-wide.
- Omit a whole `### Heading {{ items }}` block entirely for any empty
  category — don't post an empty section or its chip.

## Where new entries go

**`changelog/index.md`** — the current entry sits between two comment
markers:

```html
<!-- CHANGELOG:CURRENT:START -->
<div class="pt-changelog-entry" markdown="1">
  ...card + dialog...
</div>
<!-- CHANGELOG:CURRENT:END -->
```

`apply-changelog.js` replaces everything between those two comments
wholesale — the markers themselves always stay.

**`changelog/archive.md`** — every past entry lives inside one shared grid,
and new entries are inserted right after a marker comment (which stays put
for next time):

```html
<div class="pt-changelog-cards" markdown="1">

<!-- CHANGELOG:PREPEND_HERE -->
  ...new entry gets inserted right here, pushing older ones down...
  ...card + dialog...
  ...card + dialog...

</div>
```

<div class="pt-flavor">
"A template is just a promise the future will look like the past, formatted correctly." — Bot integration notes
</div>
