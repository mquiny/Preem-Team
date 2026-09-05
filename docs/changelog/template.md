---
title: Bot Changelog Template
description: Markdown/HTML structure used to post new changelog entries as click-to-open cards.
---

# CHANGELOG TEMPLATE // BOT INTERFACE SPEC

> `> THIS PAGE IS NOT A CHANGELOG.`
> `> THIS PAGE IS THE STENCIL THE BOT USES TO MAKE ONE.`

This page defines the exact structure [`scripts/apply-changelog.js`](https://github.com/mquiny/Preem-Team/blob/main/scripts/apply-changelog.js)
builds whenever the Discord bot fires a changelog update. Each collection's
release is a small clickable **card**; clicking it opens a **popup** (a
native `<dialog>`) with the full changes, instead of a long scrolling page.
It's a reference for whoever maintains the bot integration — not a page end
users need to read.

!!! note "How this actually works"
    The bot (`utils/siteChangelogDispatcher.js` in the ncrbot repo) fires a
    `repository_dispatch` event with a JSON payload. A GitHub Action
    (`.github/workflows/changelog-dispatch.yml`) runs `apply-changelog.js`,
    which:

    1. Looks for that payload's `collection_slug` among the cards already on
       `changelog/index.md`.
    2. If found: pulls that ONE collection's old card+popup out, re-IDs it,
       and moves it into `changelog/archive.md`'s card grid — every other
       collection's card is left completely untouched.
    3. If not found (first post ever for that collection): just adds a new
       card to `index.md` — nothing to archive yet.
    4. Builds the fresh card+popup from the payload and puts it in `index.md`.

    Nothing on `index.md` or `archive.md` should be hand-edited except by
    that script.

!!! note "Multiple collections, tracked independently"
    `index.md` can hold any number of "current" cards at once — one per
    collection currently being tracked (e.g. your CPE collection, Sub2, E33,
    ...). An update to one collection only ever touches *that* collection's
    card. There's no shared "Supported Game Version" summary any more (that
    only ever made sense for a single collection) — each card/popup shows
    its own game version instead.

---

## Payload fields

| Field | Type | Description |
|---|---|---|
| `collection_slug` | string | Nexus collection slug — used bot-side to gate which collections push to the site at all (`SITE_CHANGELOG_SLUGS`), and site-side as the key that identifies which card an update replaces |
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
<img class="pt-changelog-card-thumb" src="assets/{{ thumbnail_file }}" alt="">
<span class="pt-changelog-card-body">
<span class="pt-changelog-card-version">{{ version }}</span>
<span class="pt-changelog-card-date">{{ date }} · CP2077 {{ game_version }}</span>
<span class="pt-changelog-card-chips">{{ chips }}</span>
</span>
</button>

<dialog class="pt-changelog-modal" id="{{ dialog_id }}" markdown="1">
<div class="pt-changelog-modal-inner" markdown="1">

<button type="button" class="pt-changelog-modal-close" data-pt-changelog-close aria-label="Close changelog">×</button>

## {{ version }}

{{ chips }}

`{{ date }}` · Game Version `{{ game_version }}` · Posted by **{{ author }}** · Synced from `{{ source_channel }}`

### Added {: .pt-changelog-h-added }

{{ added_items }}

### Updated

{{ updated_items }}

### Removed {: .pt-changelog-h-removed }

{{ removed_items }}

</div>
</dialog>
````

- `{{ dialog_id }}` — on `changelog/index.md` this is
  `changelog-current-{{ collection_slug }}` (one fixed, unique id per
  tracked collection). On `changelog/archive.md`, where many old releases
  from every collection coexist, it's `changelog-{{ slugified version }}`
  instead (e.g. `changelog-v4-3-0`), with a `-2`, `-3`, ... suffix added if
  that id's already taken (a collection re-posting an identical version
  string, most likely while testing, would otherwise collide with an
  already-archived entry).
- `{{ thumbnail_file }}` — looked up from `collection_slug` via the
  `COLLECTION_IMAGES` map at the top of `apply-changelog.js`. A slug with
  no entry there just gets a card with no image — nothing breaks. To add
  a new collection's thumbnail: drop a `.webp` into
  `docs/changelog/assets/` and add one line to that map.
- `{{ chips }}` — one `<span class="pt-chip pt-chip--{added|updated|removed}">…</span>`
  per non-empty category, nothing for empty ones.
- The `{: .pt-changelog-h-added }` / `{: .pt-changelog-h-removed }` bits are
  `attr_list` syntax — that's what lets [`stylesheets/changelog.css`](https://github.com/mquiny/Preem-Team/blob/main/docs/stylesheets/changelog.css)
  colour those two headings green/red. "Updated" needs no class — `<h3>`
  is already yellow site-wide.
- Omit a whole `### Heading {{ items }}` block entirely for any empty
  category — don't post an empty section or its chip.

## Where new entries go

**`changelog/index.md`** — all current cards live inside one shared grid,
and each collection's card is individually wrapped in its own marker pair
keyed by slug:

```html
<!-- CHANGELOG:CURRENT:START -->
<div class="pt-changelog-cards" markdown="1">

<!-- CHANGELOG:CURRENT:ENTRY:{{ collection_slug }}:START -->
  ...card + dialog for this one collection...
<!-- CHANGELOG:CURRENT:ENTRY:{{ collection_slug }}:END -->

  ...one more per other tracked collection...

</div>
<!-- CHANGELOG:CURRENT:END -->
```

`apply-changelog.js` only ever replaces the one `ENTRY:{{ collection_slug }}`
block matching the incoming payload — every other collection's entry (and
its markers) is left byte-for-byte untouched. If no entry exists yet for
that slug, a new one is inserted at the top of the grid instead.

**`changelog/archive.md`** — every past entry from every collection lives
inside one shared grid (no per-collection separation needed here — it's
just history), and new entries are inserted right after a marker comment
(which stays put for next time):

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
