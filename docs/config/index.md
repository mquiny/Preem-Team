---
title: Config
description: Documented config changes to mods in the Preem Team collection.
---

# CONFIG // TUNING THE RIG

> `> INITIATING SETUP SEQUENCE...`
> `> STATUS: TRACKING CHANGES`

This page documents config changes made to mods in the collection, so
everyone can see what's changed and why — rather than settings quietly
shifting between revisions with no record of it.

!!! info "What this page is"
    A running log of tuning changes made to the collection's mod configs.
    Not every change here may be live in the current revision yet — check
    the [Changelog](../changelog/index.md) for what's actually shipped.

    Every "Before" value here is taken from a genuinely untouched,
    default install — not reconstructed from memory — so this table can
    be trusted as an accurate diff, not just an approximation.

## Setting changes

??? note "FilterSaves"
    | Setting | Before | After |
    |---|---|---|
    | `rememberLifepath` | Off | On |

??? note "FlashbackFixer"
    Reduces flashback intensity to 70% (down from 100%) while playing
    another character, in a scripted vehicle, or as a vehicle passenger.

    | Setting | Before | After |
    |---|---|---|
    | `ReductionMultiplier_PlayingOtherCharacter` | `1` | `0.7` |
    | `ReductionMultiplier_ScriptedVehicle` | `1` | `0.7` |
    | `ReductionMultiplier_InVehicle` | `1` | `0.7` |

??? note "Minimap Widgets"
    | Setting | Before | After |
    |---|---|---|
    | `Circle` (minimap style) | On | Off |
    | `KILLS` (kill counter widget) | On | Off |

??? note "NovaOptics"
    | Setting | Before | After |
    |---|---|---|
    | `enable` (color grading) | Off | On |
    | `autoMode` | Off | On |

??? note "Shift"
    Driving camera/immersion mod. Several immersion features turned **on**,
    steering sensitivity halved, FOV raised, and the corner-lookahead
    angle brought in from a wide 80° to a tighter ~40°.

    | Setting | Before | After |
    |---|---|---|
    | `aggressiveRidingMode` | Off | On |
    | `cornerLookAheadMode` | Off | On |
    | `cornerLookAheadYaw` | `80°` | `~40°` (`0.698` rad) |
    | `dynamicSteeringSensitivityMode` | Off | On |
    | `firstEquipCameraEnabled` | Off | On |
    | `immersiveCameraEnabled` | Off | On |
    | `immersiveCameraFOVChange` | `0` | `10` |
    | `responsiveDrivingMode` | Off | On |
    | `speedAffectsCameraShake` | Off | On |
    | `speedAffectsFOV` | Off | On |
    | `steeringSensitivity` | `100` | `50` |
    | `cameraFOV` / `baseFOV` | `50.5°` | `67.7°` |

??? note "AutoDriveEnhanced"
    | Setting | Before | After |
    |---|---|---|
    | `drivingAI` | `Vanilla` | `ModdedNormal` |

??? note "DarkFuture"
    Need decay slowed down across the board, carry weight penalty halved,
    and fast travel disabled.

    | Setting | Before | After |
    |---|---|---|
    | `energyLossRatePct` | `100%` | `70%` |
    | `hydrationLossRatePct` | `100%` | `70%` |
    | `nutritionLossRatePct` | `100%` | `70%` |
    | `reducedCarryWeight` | `Full` | `Half` |
    | `basicNeedsAdvancedSettings` | Off | On |
    | `hideFastTravelMarkers` | On | Off |
    | `fastTravelSettingV2` | `Disabled` | `Enabled` |

??? note "EasierCounterAttackSettings"
    | Setting | Before | After |
    |---|---|---|
    | `easierCounterAttackTime` | `0.6s` | `0.4s` (tighter counter window) |

??? note "InformativeHealthbar"
    Turns **off** the extra HUD trackers for a cleaner display:

    - Armor, carry weight, lifepath, money, street cred
    - DarkFuture energy, hydration, nerve, and nutrition

    | Setting | Before | After |
    |---|---|---|
    | `debuffStyle` | `IconsOnly` | `FullColor` |

??? note "KdspDeepScanSettings"
    | Setting | Before | After |
    |---|---|---|
    | `enableDiverseRelationships` | Off | On |

??? note "NightCityTrafficOverhaul"
    Across-the-board traffic speed and acceleration buffs.

    | Vehicle class | Max speed (before → after) | Acceleration (before → after) |
    |---|---|---|
    | Normal vehicles | `31 → 70` | `1.0 → 1.25` |
    | SUVs | `31 → 70` | `1.0 → 1.25` |
    | Sport vehicles | `41 → 100` | `1.0 → 1.5` |
    | Sport bikes | `41 → 100` | `1.0 → 1.5` |
    | Mini vehicles | `26 → 50` | `1.0 → 1.05` |
    | Trucks | `28 → 60` | `1.0 → 1.1` |

    Also: `trafficHijackDifficulty` `VANILLA` → `MEDIUM`.

??? note "ResponsiveVModSettings"
    | Setting | Before | After |
    |---|---|---|
    | `vehHitReactionFrequency` | `Balanced` | `MostlyResigned` |

??? note "VendorPreview"
    | Setting | Before | After |
    |---|---|---|
    | `enableDangerZoneChecker` | Off | On |

??? note "ChallengingBreachMinigame"
    | Setting | Before | After |
    |---|---|---|
    | `startImmediately` | Off | On |

??? note "DamageScaling"
    NPC damage scaling preset switched from the mod's default to a
    balanced curve — damage taken from NPCs drops off at higher
    difficulty tiers instead of staying flat.

    | Setting | Before | After |
    |---|---|---|
    | `npcPreset` | `Default` | `RMK_Balanced` |
    | `npcDamageScaling` (per tier) | `1, 1, 1, 1, 1, 1, 1` | `1, 1, 0.85, 0.72, 0.6, 0.5, 0.4` |

??? note "SimpleXPMultiplier"
    XP gain reduced across the board to slow down leveling.

    | Setting | Before | After |
    |---|---|---|
    | `Level` | `1.0×` | `0.6×` |
    | `StreetCred` | `1.0×` | `0.3×` |
    | `CoolSkill` / `IntelligenceSkill` / `ReflexesSkill` / `StrengthSkill` / `TechnicalAbilitySkill` | `1.0×` | `0.6×` |

## New mods (no baseline to compare against)

These were added to the collection alongside the settings above — since
they weren't previously part of it, there's no "vanilla" state to diff
against, just the values they ship with:

- **FakeLightsNoMore** — dashboard ad lights disabled (`disableAdsLights: On`).
- **GeneralShadowsFixes** — player shadows disabled, shadow instance budget set to Medium.
- **PayToGo** — Night City Railroad fast-travel pricing tuned (district
  rate and inflation scaling both raised from their low placeholder
  values).
- **RTLightingFixes**, **MainMenuMusicConfig**, **ReImagined** — installed
  with their default settings; no tuning changes made yet.
