---
title: Example Guide — CET Setup
description: A worked example guide covering Cyber Engine Tweaks configuration.
---

# CYBER ENGINE TWEAKS // CONFIGURATION DEEP-DIVE

> `> LOADING MODULE: cyber_engine_tweaks.dll`
> `> STATUS: NOMINAL`

This is an **example guide** demonstrating the structure and tone expected
for anything added to the [Guides](index.md) section. It covers configuring
**Cyber Engine Tweaks (CET)**, one of the core frameworks bundled in the
Preem Team collection.

!!! info "Who this is for"
    Anyone running the Preem Team collection who wants to understand what
    CET does and how to tweak its settings safely.

## What is CET?

Cyber Engine Tweaks is a scripting framework that lets mods hook into the
game engine at runtime. It also ships with an in-game console overlay used
for debugging, running commands, and managing loaded mods.

Most of the collection's gameplay and UI mods depend on CET being installed
and configured correctly — if CET misbehaves, expect knock-on issues across
the rest of the collection.

## Opening the console

1. Launch the game with the collection installed.
2. From the main menu or in-game, press the default bind: `` ` `` (backtick) or `~`.
3. The CET overlay should appear over the game, dimming the background.

- [ ] Console opens with the default hotkey
- [ ] Mod list tab shows all installed CET-dependent mods
- [ ] No errors appear in red text in the console log

!!! tip "Changing the hotkey"
    If `` ` `` conflicts with your keyboard layout, edit
    `bin/x64/plugins/cyber_engine_tweaks/config.json` and change the `bind`
    field under `"console_key"`.

## Key configuration options

CET's behavior is controlled through `config.json` in its plugin folder.
The most commonly adjusted options:

```json
{
  "console_key": "grave",
  "enable_debug": false,
  "font_size": 16,
  "remove_binding_limit": true
}
```

=== "Recommended (collection default)"

    ```json
    {
      "enable_debug": false,
      "remove_binding_limit": true
    }
    ```

    Keeps overhead low and avoids flooding the log with debug noise — the
    configuration the Preem Team collection ships with by default.

=== "Debugging a mod issue"

    ```json
    {
      "enable_debug": true,
      "remove_binding_limit": true
    }
    ```

    Turns on verbose logging. Useful when following steps from
    [Troubleshooting](../troubleshooting/index.md), but noisy for normal play —
    turn it back off afterward.

!!! warning "Don't hand-edit while the game is running"
    Changes to `config.json` are only read on launch. Editing it mid-session
    won't do anything until you restart the game, and in rare cases can
    cause CET to fail to save its own state on exit.

## Reading the console log

If something's crashing, the CET log is usually the first place to look.

1. Open the CET overlay (`` ` ``).
2. Navigate to the **Log** tab.
3. Scroll to the bottom — the most recent entries are what you want.
4. Look for lines in red or containing `[error]` / `[fatal]`.

!!! danger "Common fatal error"
    ```text
    [error] Failed to load module: <modname>.lua
    ```
    This almost always means a mod version mismatch. Check
    [Common Problems](../troubleshooting/common_problems.md#mod-fails-to-load-in-cet)
    for the fix.

## Wrapping up

That's the full shape of a Preem Team guide: a clear intro, numbered or
checklisted steps, tabbed alternatives where relevant, and admonitions
calling out anything risky. Use this file as your template for new guides.

<div class="pt-flavor">
"The console doesn't lie. It just doesn't always tell you the whole truth either." — CET maintainers
</div>
