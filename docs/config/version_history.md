---
title: Config Version History
description: What changed between each PE Config Mod release.
---

# CONFIG // VERSION HISTORY

> `> DIFFING RELEASE ARCHIVES...`
> `> STATUS: TRACKING CHANGES BETWEEN VERSIONS`

While the [Config](index.md) page shows how the *current* revision
compares to a stock install, this page shows what changed **between
each PE Config Mod release** — so if a setting gets added, tuned again,
or reverted a few versions later, that history doesn't just disappear
into a single flattened "before/after."

!!! info "How this is built"
    Each release's actual settings files are diffed key-by-key against
    the previous release's (not a raw text comparison — several of
    these files reorder their own keys between exports, which makes a
    naive diff report false changes on values that never actually
    moved). Versions currently tracked: 1.0 through 1.6.

<div id="pt-config-history" data-src="../assets/version-history.json"></div>
