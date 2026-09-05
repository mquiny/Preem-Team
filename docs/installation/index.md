---
title: Installation
description: Step-by-step installation guide for the Preem Team collection.
---

# INSTALLATION // JACKING IN

> `> INITIATING SETUP SEQUENCE...`
> `> ESTIMATED TIME: 5–10 MINUTES NEXUS PREMIUM`
> `> ESTIMATED TIME: 30-60 MINUTES NEXUS FREE USER`
> `> RISK LEVEL: LOW, IF YOU FOLLOW THE STEPS`

This page walks you through installing the full Preem Team collection, start
to finish. Follow it top to bottom — don't skip steps, don't improvise, and
you'll have a stable, modded Night City by the end of it.

!!! danger "Read this before you touch anything"
    Modding Cyberpunk 2077 touches your game files directly. If you skip the
    backup step and something goes wrong, you may need to fully reinstall the
    game. **Back up first. Always.**

!!! example "Installing a specific mod collection?"
    This page covers general setup. If you're installing the **CPE**
    collections specifically, see
    [Installing the CPE Collections](cpe_collection.md) for the exact
    Vortex configuration and collection choices.

## Overview checklist

Use this as your master checklist. Each item is explained in detail below.

- [ ] Back up my save files and game folder
- [ ] Verify my game version matches the collection's supported version
- [ ] Download the Preem Team collection package
- [ ] Install the required mod manager and tools
- [ ] Prepare the game (verify files, disable auto-updates)
- [ ] Apply the collection
- [ ] Verify the installation
- [ ] Launch and confirm mods are active

---

## Step 1: Download the collection

1. Join the **Preem Team Discord** (link in the site header) if you haven't already — announcements about new collection versions go out there first.
2. Head to the **#downloads** channel or the collection's hosting page (Nexus Mods / Vortex collection link, depending on current distribution method).
3. Download the collection package that matches your game version.

!!! note "Which version do I need?"
    The collection is built against a specific Cyberpunk 2077 patch version.
    Check the [Changelog](../changelog/index.md) for the "Supported Game
    Version" note at the top of the latest entry before downloading.

- [ ] I downloaded the correct collection package for my game version

!!! tip
    If you're not sure which version you're on, launch Cyberpunk 2077, go to
    the main menu, and check the version number in the bottom-right corner.

---

## Step 2: Prepare the game

1. **Back up your save files.**
      - Windows default path: `Documents\Saved Games\CD Projekt Red\Cyberpunk 2077`
      - Copy this entire folder somewhere safe (external drive, cloud storage, etc).
2. **Back up your game install folder** (optional but strongly recommended for first-time modders).
      - Copy your full `Cyberpunk 2077` install directory, or at minimum the `archive`, `r6`, and `red4ext` folders if they exist.
3. **Disable auto-updates** on your game platform (Steam, GOG, Epic) so the game doesn't patch itself mid-install and break mod compatibility.
4. **Verify game file integrity** through your platform to ensure you're starting from a clean, unmodified base.

- [ ] I backed up my save files
- [ ] I backed up (or am comfortable reinstalling) my game folder
- [ ] I disabled auto-updates for Cyberpunk 2077
- [ ] I verified game files are clean/unmodified

!!! warning "Already have mods installed?"
    If you're modding an existing install, uninstall your current mods first
    or start from a fresh verified install. Mixing an old manual mod setup
    with the Preem Team collection is the #1 cause of crashes reported in
    [Troubleshooting](../troubleshooting/index.md).

---

## Step 3: Install required tools

The collection depends on a small set of foundational tools. Install these
**before** applying the collection itself.

=== "Vortex (recommended)"

    1. Download and install [Vortex Mod Manager](https://www.nexusmods.com/about/vortex/).
    2. Open Vortex and let it detect your Cyberpunk 2077 install, or point it manually to your install folder.
    3. Let Vortex install its Cyberpunk 2077 extension if prompted.

=== "Manual install"

    1. Download **RED4ext** and extract it into your game's root folder.
    2. Download **Cyber Engine Tweaks (CET)** and extract it into your game's root folder.
    3. Download **ArchiveXL** and **TweakXL** and place them in `red4ext/plugins/`.

- [ ] I installed a mod manager (or set up manual tooling)
- [ ] I installed RED4ext
- [ ] I installed Cyber Engine Tweaks (CET)
- [ ] I installed ArchiveXL and TweakXL

!!! info "Why do I need these?"
    These four tools are the frameworks that almost every other mod in the
    collection is built on. Nothing else in the collection will work without
    them.

---

## Step 4: Apply the collection

=== "Vortex"

    1. In Vortex, go to the **Collections** tab.
    2. Search for or import the **Preem Team** collection using the link or code shared in Discord.
    3. Click **Install Collection** and let Vortex download and deploy every mod in the correct order.
    4. Resolve any conflict prompts using the recommended (bolded) option — the collection is pre-configured with the correct load order.

=== "Manual install"

    1. Extract each mod archive from the collection package into your game's root folder, preserving folder structure.
    2. Follow the load order listed in the collection's `load-order.txt` file included in the package.
    3. Double-check that no mod's files were overwritten by a later mod unless the load order explicitly says to.

- [ ] I applied the full collection (via Vortex or manually)
- [ ] I resolved all conflict prompts using recommended options
- [ ] I did not skip any mods marked "required" in the collection

!!! tip
    Grab a coffee (or a synth-brew, if you're feeling thematic). A full
    collection deploy can take several minutes depending on your drive speed.

---

## Step 5: Verify installation

1. Launch Cyberpunk 2077 through your platform as normal (Steam/GOG/Epic) — **not** through Vortex's launch button unless instructed otherwise.
2. Watch the initial loading screen — you should see the **Cyber Engine Tweaks** console flash briefly, confirming CET loaded.
3. Once in the main menu, press the CET hotkey (default: `` ` `` or `~`) to open the console overlay and confirm the mod list is populated.
4. Start a new game or load a save and confirm visual/gameplay changes from the collection are present.

- [ ] Game launches without crashing to desktop
- [ ] CET overlay opens and shows loaded mods
- [ ] In-game changes from the collection are visibly present
- [ ] No red error text appears in the CET console on load

!!! success "You're in"
    If every box above is checked, congratulations, choom — you're running
    the full Preem Team collection. Welcome to a better Night City.

!!! failure "Something's wrong?"
    Don't panic. Head straight to [Troubleshooting](../troubleshooting/index.md)
    — most first-install issues are covered in
    [Common Problems](../troubleshooting/common_problems.md).

<div class="pt-flavor">
"First rule of netrunning: always know your exit. Second rule: always back up your save." — Preem Team install notes
</div>
