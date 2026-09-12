# Config version history

Extracted settings files for every tracked PE Config Mod release, used
by [`scripts/diff_config_versions.py`](../../../../scripts/diff_config_versions.py)
to build [`version-history.json`](../version-history.json) — the data
behind the [Version History](../../version_history.md) page.

## Adding a new version (e.g. 1.7 ships)

1. Download the new version's zip from Nexus.
2. Extract it into a new `vX.Y/` folder here, matching the same
   relative structure the others already use (`bin/...`, `red4ext/...`,
   `r6/...` sitting directly under `vX.Y/`, not nested inside another
   folder — v1.0's zip shipped with an extra wrapping `PE Config Mod/`
   folder that had to be flattened by hand; check for that before
   running the diff).
3. Run from the repo root:
   ```
   python scripts/diff_config_versions.py
   ```
   This rewrites `version-history.json` from scratch across every
   tracked version pair, so it's safe to re-run any time.
4. Commit both the new `vX.Y/` folder and the regenerated
   `version-history.json`.

Versions currently tracked: 1.0 through 1.6.
