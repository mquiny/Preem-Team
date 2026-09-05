---
title: FAQ
description: Frequently asked questions about the Preem Team collection.
---

# FAQ // FREQUENTLY REQUESTED DATA

> `> QUERY DATABASE...`
> `> RETURNING TOP RESULTS...`

Answers to the questions the Discord gets asked most. Click a question to
expand it. If yours isn't here, ask in the support channel before opening a
[GitHub Issue](https://github.com/mquiny/Preem-Team/issues) —
someone's probably already answered it.

## General

??? question "What is Preem Team, exactly?"
    Preem Team is a curated, staff-tested Cyberpunk 2077 mod collection —
    a pre-built, version-pinned set of mods designed to work together
    without the usual load-order headaches. See the [Home page](../index.md)
    for the full philosophy behind it.

??? question "Is this an official CD Projekt Red project?"
    No. Preem Team is a fan-made, community-run collection. It is not
    affiliated with, endorsed by, or associated with CD Projekt Red in any
    way.

??? question "Which game version does the collection support?"
    Always check the **Supported Game Version** block at the top of the
    [Changelog](../changelog/index.md) — it's kept in sync with the current
    collection release.

??? question "Is Preem Team free?"
    Yes. The collection, the mods it bundles (from their original authors),
    and this documentation are all free to use.

## Installation & Setup

??? question "Do I need to know how to mod already?"
    No. [Installation](../installation/index.md) is written assuming zero
    prior modding experience. Follow it top to bottom and you'll be fine.

??? question "Can I add my own mods on top of the collection?"
    You can, but it's not officially supported — extra mods can conflict
    with the collection's load order or tested configuration. If you do,
    add them **after** confirming the base collection works, one at a time,
    so you can identify what broke if something does.

??? question "Vortex or manual install — which is better?"
    Vortex is recommended for most people; it manages load order and
    conflicts automatically. Manual install is available for people who
    prefer full control or don't want to run a mod manager. Both are
    covered in [Installation](../installation/index.md).

## Troubleshooting

??? question "The game crashes on launch after installing. What do I do?"
    Check [Common Problems](../troubleshooting/common_problems.md) first —
    most launch crashes are covered there. If yours isn't, follow the steps
    on the [Troubleshooting](../troubleshooting/index.md) page to file a
    proper bug report.

??? question "CET console won't open. Is something broken?"
    Usually not — it's most often a keybind conflict. See the
    [CET setup guide](../guides/cet_setup.md#opening-the-console) for
    the fix.

??? question "I updated the collection and now nothing works. Help?"
    Some releases include breaking changes that require a **full
    reapplication** of the collection rather than an in-place update. Check
    the relevant entry in the [Changelog](../changelog/index.md) for a
    "Breaking change" warning before assuming something's wrong on your end.

---

## For staff: adding a new FAQ entry

FAQ entries are collapsible `details` blocks powered by the
`pymdownx.details` extension (already enabled in `mkdocs.yml`).

1. Pick the correct section (`## General`, `## Installation & Setup`,
   `## Troubleshooting`) — or create a new `##` section if the question
   doesn't fit an existing category.
2. Add a new entry using this exact syntax:

    ```markdown
    ??? question "Your question, phrased the way a user would ask it?"
        Your answer, written in plain language. Link to other pages
        (guides, troubleshooting, changelog) instead of duplicating content
        that already lives there.
    ```

3. Keep answers short — a few sentences. If the answer needs more than a
   paragraph, it probably belongs in [Guides](../guides/index.md) or
   [Troubleshooting](../troubleshooting/index.md) instead, with the FAQ
   entry linking out to it.
4. Alphabetical order isn't required — group by relevance within a section
   instead.

!!! tip "Indentation matters"
    The answer body must be indented by exactly 4 spaces under the `???`
    line, or it won't render as part of the collapsible block.

<div class="pt-flavor">
"Ask a question in the Discord and you'll get five answers. Ask it here and you'll get one." — FAQ maintainers
</div>
