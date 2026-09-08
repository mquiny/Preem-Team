---
title: Commands
description: Searchable directory of console spawn commands for mods in the Preem Team collection.
---

# SPAWN COMMANDS // ITEM DATABASE

> `> QUERYING LOCAL INVENTORY DATABASE...`
> `> INDEXING KNOWN ITEM CODES...`

A searchable directory of `Game.AddToInventory(...)` console commands
bundled with mods in the collection — paste one into the
[Cyber Engine Tweaks](../guides/cet_setup.md) console to spawn that item
directly, instead of hunting for it in-game. Search by mod name, author,
or even a specific command.

!!! warning "Requires CET"
    These commands only work through the Cyber Engine Tweaks console. See
    the [CET Setup](../guides/cet_setup.md) guide if you haven't got it
    running yet.

!!! info "Not every mod is listed here"
    This directory only covers mods whose files actually contain a
    ready-made spawn command, plenty of mods in the collection don't
    need or provide one, so their absence here doesn't mean anything's
    missing from your install.
	
!!! info "Mod missing any commands?"
    If you do spot a mod that has spawn commands that hasn't been added, please ping a Dev in our [Discord](https://discord.gg/QvYzYZFmnE)	

<div class="pt-spawn-search-bar">
  <input type="search" id="pt-spawn-search" placeholder="Search by mod, author, or command…" autocomplete="off">
  <span id="pt-spawn-count" class="pt-spawn-count"></span>
</div>

<div id="pt-spawn-results" data-src="assets/spawn_commands.json"></div>
