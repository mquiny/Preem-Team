---
title: Issue Viewer
description: Live view of open GitHub issues for the Preem Team collection.
---

# ISSUE VIEWER // LIVE NETWATCH FEED

> `> CONNECTING TO github.com/mquiny/Preem-Team...`
> `> STREAM STATUS: LIVE`

An automated feed of **open** GitHub Issues for the Preem Team collection,
kept in sync automatically. Check the table below before filing a
duplicate — and if your problem isn't listed, use the button below to
report it.

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

    Only **open** issues live on this page — the moment one's closed on
    GitHub, the next sync drops it here and it shows up on the
    [**Issue Archive**](issue_archive.md) instead.

<div class="pt-issue-viewer" data-pt-issue-viewer markdown="1">

<div class="pt-issue-toolbar" data-pt-issue-toolbar>
<input type="search" class="pt-issue-search" data-pt-issue-search placeholder="Search issues…" aria-label="Search issues">
<div class="pt-issue-filters" data-pt-issue-filters hidden></div>
</div>

<!--
  scripts/sync-issues.js writes between the two markers below on every
  sync. Do not hand-edit content between BOT-INJECT:ISSUE-TABLE:START and
  BOT-INJECT:ISSUE-TABLE:END — it will be overwritten on the next sync.
-->

<!-- BOT-INJECT:ISSUE-TABLE:START -->

**Last synced:** `2026-09-06 20:40 UTC`

| Status | Issue | Labels | Opened | Comments |
|---|---|---|---|---|
| — | *No open issues right now — nice.* | — | — | — |

<!-- BOT-INJECT:ISSUE-TABLE:END -->

</div>

## Searching and filtering

Type in the search box above the table to match against an issue's title,
or use the label chips to show only issues tagged with one label at a time
— for example just `bug`, or just `performance`. Both can be combined, and
**All** clears the label filter. This runs entirely in your browser
([`javascripts/issue-viewer.js`](https://github.com/mquiny/Preem-Team/blob/main/docs/javascripts/issue-viewer.js))
against whatever's currently in the table, so it stays in sync with the
live issue list automatically — no separate configuration to maintain as
labels change.

## Don't see your issue?

If a search of this page doesn't turn up your problem, use the
**Create an Issue** button above to file a new one on GitHub — it'll show
up here automatically once it's synced.

<div class="pt-flavor">
"The netwatch never sleeps. Neither, apparently, does the bug tracker." — Issue triage team
</div>
