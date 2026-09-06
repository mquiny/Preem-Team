---
title: Common Problems
description: Known issues and fixes for the Preem Team collection.
---

# COMMON PROBLEMS // KNOWN FAULT LOG

> `> CROSS-REFERENCING SYMPTOMS...`
> `> MATCHES FOUND: SEE BELOW`

Documented fixes for the issues reported most often. Use your browser's
search (`Ctrl+F` / `Cmd+F`) to jump to your symptom.

## Crashes

### Game crashes to desktop on launch

!!! failure "Symptom"
    The game shows the initial splash screen, then crashes to desktop
    before reaching the main menu.

**Likely causes:**

- Leftover mod files from a previous, non-collection install
- Outdated or mismatched core framework versions (CET / RED4ext)
- A corrupted download of the collection package

**Fix:**

1. Verify game files through your platform (Steam/GOG/Epic).
2. Fully uninstall all existing mods — don't just overwrite them.
3. Re-download the collection package fresh (a partial or corrupted
   download is a common culprit).
4. Reapply the collection following [Installation](../installation/index.md)
   from Step 3 onward.

- [ ] Vortex - Select collection
- [ ] Vortex - Install Collection
- [ ] Verify installation

---

### Crash when fast traveling or loading a save

!!! failure "Symptom"
    The game runs fine at first but crashes specifically when fast
    traveling or loading a saved game.

**Likely cause:** A conflict between two mods writing to the same game
resource, usually related to world streaming or NPC spawn tables.

**Fix:**

1. Open the CET console log immediately after the crash (on next launch,
   it will show the last session's log).
2. Look for `[error]` lines referencing a specific `.archive` or `.tweak`
   file.
3. Cross-reference that filename against the [Issue Viewer](issue_viewer.md)
   — this is one of the most commonly tracked issue types.
4. If unresolved, [file a new issue](index.md#still-stuck-file-an-issue)
   with the log attached.

---

## Mod loading issues

### Mod fails to load in CET

!!! failure "Symptom"
    ```text
    [error] Failed to load module: <modname>.lua
    ```
    appears in the CET console log.

**Likely cause:** Version mismatch between the mod and your installed CET
build, or a missing dependency the mod expects to already be loaded.

**Fix:**

1. Confirm your CET version matches the one specified for the current
   collection release in the [Changelog](../changelog/index.md).
2. Confirm the mod in question is still part of the current collection —
   it may have been replaced or removed in a recent update.
3. Reinstall just that mod's files, ensuring they land in the correct
   `bin/x64/plugins/cyber_engine_tweaks/mods/` subfolder.

---

### ArchiveXL / TweakXL conflicts

!!! failure "Symptom"
    Custom appearances, clothing, or item stats don't apply — items look
    or behave like vanilla despite the mod being installed.

**Likely cause:** Two mods editing the same `.tweak` or `.xl` resource,
with load order determining which one "wins."

**Fix:**

1. Check the collection's `load-order.txt` (included in the package) and
   confirm your manager or manual setup matches it exactly.
2. If using Vortex, let it auto-sort using the collection's rules rather
   than manually reordering plugins.
3. If the conflict persists, it's likely a genuine bug — check the
   [Issue Viewer](issue_viewer.md) or file a new report.

---

## Performance issues

### Severe stuttering with the visual bundle enabled

!!! failure "Symptom"
    Frame times spike heavily in dense areas (e.g. Kabuki, City Center)
    specifically after installing the visual/ReShade bundle.

**Likely cause:** ReShade preset running effects poorly suited to lower-end
GPUs, or shader cache not yet built.

**Fix:**

1. Let the game run in one dense area for a few minutes uninterrupted on
   first launch — this allows the shader cache to build; subsequent runs
   are smoother.
2. If stuttering persists, switch to the **"Lite"** variant of the
   collection mentioned in the [Changelog](../changelog/archive.md).
3. Selectively disable the heaviest ReShade effects (screen-space
   reflections, ray-traced-style filters) via the ReShade overlay
   (default hotkey: `Home`).

!!! note "This is a known trade-off"
    The full visual bundle is tuned for mid-to-high-end hardware. Staff are
    aware performance on older GPUs is a common ask — track progress on
    this via the [Issue Viewer](issue_viewer.md).

<div class="pt-flavor">
"Every bug has a root cause. Finding it is the job. Admitting it's your load order is the hard part." — Support team
</div>
