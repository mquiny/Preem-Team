#!/usr/bin/env python3
"""
diff_config_versions.py

Compares consecutive PE Config Mod versions (extracted zips under
docs/config/assets/history/vX.Y/) and writes a structured changelog to
docs/config/assets/version-history.json.

Deliberately does NOT do a raw text diff on any file -- several of these
JSON files have unstable key ordering between exports (confirmed while
building the original vanilla-baseline Config page rewrite: identical
values reported as changes purely because of reordering), and the INI
file's sections can shift position between versions too. Every
comparison here is structure-aware: JSON files are parsed and diffed
key-by-key (recursively, for nested objects like Shift's), and the INI
file is parsed into {section: {key: value}} and diffed the same way.

Usage (from repo root):
    python scripts/diff_config_versions.py
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).parent.parent
HISTORY_DIR = ROOT / "docs" / "config" / "assets" / "history"
OUTPUT_PATH = ROOT / "docs" / "config" / "assets" / "version-history.json"

# Relative path -> a human label for the mod it belongs to. The INI file
# is handled separately (one label per [Section], not per file).
JSON_FILE_LABELS = {
    "bin/x64/plugins/cyber_engine_tweaks/mods/FilterSaves/settings.json": "FilterSaves",
    "bin/x64/plugins/cyber_engine_tweaks/mods/FlashbackFixer/config.json": "FlashbackFixer",
    "bin/x64/plugins/cyber_engine_tweaks/mods/Minimap Widgets/minimapwidgetsconfig.json": "Minimap Widgets",
    "bin/x64/plugins/cyber_engine_tweaks/mods/NovaOptics/settings.json": "NovaOptics",
    "bin/x64/plugins/cyber_engine_tweaks/mods/Shift/userConfig.json": "Shift",
    "bin/x64/plugins/cyber_engine_tweaks/mods/ChallengingBreachMinigame/settings.json": "ChallengingBreachMinigame",
    "bin/x64/plugins/cyber_engine_tweaks/mods/DamageScaling/settings.json": "DamageScaling",
    "bin/x64/plugins/cyber_engine_tweaks/mods/EnhancedVehicleCollisionFX/config.json": "EnhancedVehicleCollisionFX",
    "bin/x64/plugins/cyber_engine_tweaks/mods/ImmersiveVDialogueExpanded/settings.json": "ImmersiveVDialogueExpanded",
    "bin/x64/plugins/cyber_engine_tweaks/mods/SimpleXPMultiplier/settings.json": "SimpleXPMultiplier",
}
INI_RELATIVE_PATH = "red4ext/plugins/mod_settings/user.ini"
YAML_FILE_LABELS = {
    "r6/tweaks/SeijaxCyberware/Megingjord.yaml": "SeijaxCyberware (Megingjord)",
}

# Known noise: fields that change on their own between exports without
# being a real tuning change (UI state, random seeds), same exclusions
# already applied by hand to the Config page itself for the Shift mod.
NOISE_KEYS = {"settingsPanelOpen", "shakeSeedX", "shakeSeedY", "shakeSeedZ",
              "shakeSeedRX", "shakeSeedRY", "shakeSeedRZ",
              "developerWindowOpen", "presetManagerOpen", "cameraDataWindowOpen",
              "vehicleDataWindowOpen"}


def version_sort_key(folder_name):
    # "v1.0" -> (1, 0), "v1.10" -> (1, 10) -- numeric, not lexicographic,
    # so v1.10 (if it ever exists) doesn't sort before v1.2.
    parts = folder_name.lstrip("v").split(".")
    return tuple(int(p) for p in parts)


def load_json_safe(path):
    if not path.exists():
        return None
    try:
        with open(path, encoding="utf-8-sig") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return None


def diff_dict(old, new, prefix=""):
    """Returns a list of {path, before, after} for every leaf value that
    differs, recursing into nested dicts. Treats a key present in only
    one side as before/after "(not set)"."""
    changes = []
    if not isinstance(old, dict) or not isinstance(new, dict):
        if old != new:
            changes.append({"path": prefix, "before": old, "after": new})
        return changes

    for key in sorted(set(old.keys()) | set(new.keys())):
        if key in NOISE_KEYS:
            continue
        path = f"{prefix}.{key}" if prefix else key
        ov, nv = old.get(key, "(not set)"), new.get(key, "(not set)")
        if isinstance(ov, dict) or isinstance(nv, dict):
            changes.extend(diff_dict(ov if isinstance(ov, dict) else {}, nv if isinstance(nv, dict) else {}, path))
            continue
        if ov != nv:
            try:
                if abs(float(ov) - float(nv)) < 1e-6:
                    continue
            except (TypeError, ValueError):
                pass
            changes.append({"path": path, "before": ov, "after": nv})
    return changes


SECTION_RE = re.compile(r"^\[(.+)\]\s*$")
KV_RE = re.compile(r"^([^=]+?)\s*=\s*(.*)$")


def parse_ini(path):
    """Returns {section_name: {key: value}}. Minimal parser matching
    this specific mod_settings/user.ini format -- not a general INI
    parser (no comments, no multi-line values in this file)."""
    if not path.exists():
        return {}
    sections = {}
    current = None
    with open(path, encoding="utf-8-sig") as f:
        for line in f:
            line = line.rstrip("\n")
            m = SECTION_RE.match(line)
            if m:
                current = m.group(1)
                sections[current] = {}
                continue
            m = KV_RE.match(line)
            if m and current is not None:
                sections[current][m.group(1).strip()] = m.group(2).strip()
    return sections


def diff_ini(old_sections, new_sections):
    """Returns (changes, sections_added, sections_removed)."""
    changes = []
    all_sections = set(old_sections.keys()) | set(new_sections.keys())
    sections_added = sorted(s for s in all_sections if s not in old_sections and s in new_sections)
    sections_removed = sorted(s for s in all_sections if s in old_sections and s not in new_sections)

    for section in sorted(all_sections):
        if section in sections_added or section in sections_removed:
            continue
        old_kv, new_kv = old_sections[section], new_sections[section]
        for key in sorted(set(old_kv.keys()) | set(new_kv.keys())):
            if key in NOISE_KEYS:
                continue
            ov, nv = old_kv.get(key, "(not set)"), new_kv.get(key, "(not set)")
            if ov != nv:
                try:
                    if abs(float(ov) - float(nv)) < 1e-6:
                        continue
                except (TypeError, ValueError):
                    pass
                changes.append({"section": section, "path": key, "before": ov, "after": nv})

    return changes, sections_added, sections_removed


def diff_versions(old_dir, new_dir):
    mod_changes = {}  # mod label -> list of {path, before, after}
    mods_added, mods_removed = [], []

    for rel_path, label in JSON_FILE_LABELS.items():
        old_path, new_path = old_dir / rel_path, new_dir / rel_path
        old_exists, new_exists = old_path.exists(), new_path.exists()

        if old_exists and not new_exists:
            mods_removed.append(label)
            continue
        if new_exists and not old_exists:
            mods_added.append(label)
            continue
        if not old_exists and not new_exists:
            continue

        old_data, new_data = load_json_safe(old_path) or {}, load_json_safe(new_path) or {}
        changes = diff_dict(old_data, new_data)
        if changes:
            mod_changes.setdefault(label, []).extend(changes)

    for rel_path, label in YAML_FILE_LABELS.items():
        old_path, new_path = old_dir / rel_path, new_dir / rel_path
        old_text = old_path.read_text(encoding="utf-8") if old_path.exists() else None
        new_text = new_path.read_text(encoding="utf-8") if new_path.exists() else None
        if old_text is None and new_text is not None:
            mods_added.append(label)
        elif old_text is not None and new_text is None:
            mods_removed.append(label)
        elif old_text != new_text:
            mod_changes.setdefault(label, []).append(
                {"path": "(file content)", "before": "changed", "after": "changed"}
            )

    old_ini = parse_ini(old_dir / INI_RELATIVE_PATH)
    new_ini = parse_ini(new_dir / INI_RELATIVE_PATH)
    ini_changes, sections_added, sections_removed = diff_ini(old_ini, new_ini)

    mods_added.extend(sections_added)
    mods_removed.extend(sections_removed)
    for change in ini_changes:
        mod_changes.setdefault(change["section"], []).append(
            {"path": change["path"], "before": change["before"], "after": change["after"]}
        )

    return mods_added, mods_removed, mod_changes


def main():
    version_dirs = sorted(
        [d for d in HISTORY_DIR.iterdir() if d.is_dir() and d.name.startswith("v")],
        key=lambda d: version_sort_key(d.name),
    )
    if len(version_dirs) < 2:
        print(f"Need at least 2 version folders under {HISTORY_DIR}, found {len(version_dirs)}.")
        return

    print(f"Found {len(version_dirs)} versions: {', '.join(d.name for d in version_dirs)}")

    history = []
    for i in range(1, len(version_dirs)):
        old_dir, new_dir = version_dirs[i - 1], version_dirs[i]
        mods_added, mods_removed, mod_changes = diff_versions(old_dir, new_dir)

        settings_changed = [
            {"mod": mod, "setting": c["path"], "before": c["before"], "after": c["after"]}
            for mod, changes in sorted(mod_changes.items())
            for c in changes
        ]

        entry = {
            "version": new_dir.name.lstrip("v"),
            "previousVersion": old_dir.name.lstrip("v"),
            "modsAdded": sorted(mods_added),
            "modsRemoved": sorted(mods_removed),
            "settingsChanged": settings_changed,
        }
        history.append(entry)

        print(
            f"  {old_dir.name} -> {new_dir.name}: "
            f"{len(mods_added)} mod(s) added, {len(mods_removed)} removed, "
            f"{len(settings_changed)} setting(s) changed"
        )

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)

    print(f"\nWrote {len(history)} version transition(s) to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
