---
title: Issue Viewer
description: Live view of open GitHub issues for the Preem Team collection.
---

# ISSUE VIEWER // LIVE NETWATCH FEED

> `> CONNECTING TO github.com/mquiny/Preem-Team...`
> `> STREAM STATUS: LIVE`

An automated feed of GitHub Issues for the Preem Team collection, kept in
sync automatically. Check the table below before filing a duplicate — and
if your problem isn't listed, use the button below to report it.

<a href="https://github.com/mquiny/Preem-Team/issues/new/choose" class="md-button md-button--primary" target="_blank" rel="noopener">
:material-github: Create an Issue
</a>

!!! info "How this works"
    Reports are filed directly on [GitHub](https://github.com/mquiny/Preem-Team/issues)
    — there's no Discord channel for this, so if someone in Discord has a
    bug to report, point them here. A GitHub Action in this repo
    ([`scripts/sync-issues.js`](https://github.com/mquiny/Preem-Team/blob/main/scripts/sync-issues.js))
    re-fetches the issue list and rewrites the table below every time an
    issue is opened, closed, reopened, edited, or commented on — plus every
    30 minutes as a fallback. The **Last synced** timestamp confirms when
    that last happened.

<!--
  scripts/sync-issues.js writes between the two markers below on every
  sync. Do not hand-edit content between BOT-INJECT:ISSUE-TABLE:START and
  BOT-INJECT:ISSUE-TABLE:END — it will be overwritten on the next sync.
-->

<!-- BOT-INJECT:ISSUE-TABLE:START -->

**Last synced:** `not yet connected`

| Status | Issue | Labels | Opened | Comments |
|---|---|---|---|---|
| <span class="pt-chip pt-chip--open">Open</span> | [Example: Stutter in City Center with visual bundle](https://github.com/mquiny/Preem-Team/issues) | `performance`, `visual-bundle` | `2025-01-02` | 4 |
| <span class="pt-chip pt-chip--open">Open</span> | [Example: ArchiveXL conflict with custom clothing mod](https://github.com/mquiny/Preem-Team/issues) | `bug`, `archivexl` | `2024-12-20` | 2 |
| <span class="pt-chip pt-chip--resolved">Resolved</span> | [Example: CET fails to open with non-US keyboard layouts](https://github.com/mquiny/Preem-Team/issues) | `bug`, `cet` | `2024-12-01` | 7 |

<!-- BOT-INJECT:ISSUE-TABLE:END -->

!!! note "This table is still showing placeholder rows"
    The rows above are illustrative examples — they'll be replaced with
    real, live issues the moment the [`sync-issues.yml`](https://github.com/mquiny/Preem-Team/blob/main/.github/workflows/sync-issues.yml)
    workflow first runs.

## Filtering (planned)

Once live-synced, this page is intended to support lightweight filtering by
label — for example, showing only `bug`, `performance`, or
`visual-bundle`-tagged issues — via a simple client-side script. This is
noted here as a planned enhancement, not yet implemented.

## Don't see your issue?

If a search of this page doesn't turn up your problem, use the
**Create an Issue** button above to file a new one on GitHub — it'll show
up here automatically once it's synced.

<div class="pt-flavor">
"The netwatch never sleeps. Neither, apparently, does the bug tracker." — Issue triage team
</div>
