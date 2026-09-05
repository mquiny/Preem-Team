---
title: Issue Viewer
description: Live view of open GitHub issues for the Preem Team collection.
---

# ISSUE VIEWER // LIVE NETWATCH FEED

> `> CONNECTING TO github.com/mquiny/Preem-Team...`
> `> STREAM STATUS: PENDING BOT INTEGRATION`

This page is reserved for an **automated feed of open GitHub Issues**, kept
in sync by the Preem Team bot. Once live, it will list currently open bugs
with status, labels, and a direct link to each issue — so you can check
whether your problem is already known before filing a duplicate.

!!! info "How this will work"
    The Preem Team bot will periodically pull open issues from the
    [GitHub repository](https://github.com/mquiny/Preem-Team/issues)
    via the GitHub REST API and inject them into this page as a generated
    table, replacing the placeholder block below. Each sync will update the
    **Last synced** timestamp at the top of the table.

<!-- BOT-INJECT:ISSUE-TABLE:START -->
<!--
  The Preem Team bot writes its generated issue table between these two
  markers. Do not manually edit content between BOT-INJECT:ISSUE-TABLE:START
  and BOT-INJECT:ISSUE-TABLE:END — it will be overwritten on the next sync.
-->

**Last synced:** `not yet connected`

| Status | Issue | Labels | Opened | Comments |
|---|---|---|---|---|
| <span class="pt-chip pt-chip--open">Open</span> | [Example: Stutter in City Center with visual bundle](https://github.com/mquiny/Preem-Team/issues) | `performance`, `visual-bundle` | `2025-01-02` | 4 |
| <span class="pt-chip pt-chip--open">Open</span> | [Example: ArchiveXL conflict with custom clothing mod](https://github.com/mquiny/Preem-Team/issues) | `bug`, `archivexl` | `2024-12-20` | 2 |
| <span class="pt-chip pt-chip--resolved">Resolved</span> | [Example: CET fails to open with non-US keyboard layouts](https://github.com/mquiny/Preem-Team/issues) | `bug`, `cet` | `2024-12-01` | 7 |

<!-- BOT-INJECT:ISSUE-TABLE:END -->

!!! note "This table is a placeholder"
    The rows above are illustrative examples only, showing the intended
    format (status chip, linked title, labels, open date, comment count).
    Once the bot integration ships, this table will reflect real, live data
    from the repository.

## Filtering (planned)

Once live-synced, this page is intended to support lightweight filtering by
label — for example, showing only `bug`, `performance`, or
`visual-bundle`-tagged issues — via a simple client-side script. This is
noted here as a planned enhancement, not yet implemented.

## Don't see your issue?

If a live search of this page (once synced) doesn't turn up your problem,
head back to [Troubleshooting](index.md#still-stuck-file-an-issue) to file
a new one.

<div class="pt-flavor">
"The netwatch never sleeps. Neither, apparently, does the bug tracker." — Issue triage team
</div>
