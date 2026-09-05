---
title: Guides
description: Deep-dive guides for the Preem Team collection.
---

# GUIDES // DATASHARD ARCHIVE

> `> ACCESSING DATASHARD LIBRARY...`
> `> INDEXING KNOWLEDGE FRAGMENTS...`

This section holds deep-dive guides written by the Preem Team crew — setup
walkthroughs, configuration deep-dives, and mechanic explainers that go
beyond the basic [Installation](../installation/index.md) steps.

## Available guides

<div class="grid cards" markdown>

-   :material-tools:{ .lg .middle } **[Example Guide — CET Setup](example_guide.md)**

    ---

    A full example guide showing the expected structure, tone, and formatting
    for anything added to this section.

</div>

!!! note "More guides coming"
    This library grows as staff publish new datashards. Check back after
    collection updates — new guides are usually announced alongside
    [Changelog](../changelog/index.md) entries.

---

## For staff: adding a new guide

Guides live in `docs/guides/` as individual Markdown files. Follow this
structure so the library stays consistent and easy to navigate.

### 1. Create the file

Add a new Markdown file directly inside `docs/guides/`, using a short,
lowercase, underscore-separated filename that describes the topic:

```text
docs/guides/reshade_presets.md
docs/guides/cyberware_balance_overhaul.md
```

### 2. Use the standard front matter and header block

Start every guide with front matter and a netrunner-style header, matching
[the example guide](example_guide.md):

```markdown
---
title: Your Guide Title
description: One sentence summary of what this guide covers.
---

# YOUR GUIDE TITLE // SHORT TAGLINE

> `> flavor line one`
> `> flavor line two`

Intro paragraph explaining what the guide covers and who it's for.
```

### 3. Structure the body

- Use `##` for major sections, `###` for sub-steps.
- Use numbered lists for sequential steps, task lists (`- [ ]`) for checklists.
- Use admonitions (`!!! note`, `!!! warning`, `!!! tip`) to call out anything
  important — don't bury critical info in plain paragraphs.
- Use tabbed blocks (`=== "Option A"`) when a step differs between tools
  (e.g. Vortex vs. manual install).
- Keep code/config snippets in fenced code blocks with a language hint.

### 4. Register the guide in navigation

Add the new file to the `nav` section of `mkdocs.yml` under **Guides**:

```yaml
nav:
  - Guides:
      - guides/index.md
      - Example Guide — CET Setup: guides/example_guide.md
      - Your New Guide: guides/your_new_guide.md
```

### 5. Link it from this index

Add a new card to the **Available guides** grid above so it's discoverable
without needing the nav sidebar.

!!! tip "Style guide, in short"
    - Keep the cyberpunk flavor text light — a line or two per page, not every paragraph.
    - Prioritize clarity over cleverness. A guide that isn't followable isn't preem, it's just decoration.
    - Screenshots and diagrams are welcome — drop image files in `docs/guides/assets/` and reference them with standard Markdown image syntax.

<div class="pt-flavor">
"Every choom who ever survived Night City did it by reading the manual first." — Guides team
</div>
