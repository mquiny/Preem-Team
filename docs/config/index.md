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
    | `autoMode` | Off | On |

??? note "Shift"
    Driving camera/immersion mod. Several immersion features turned **on**,
    steering sensitivity halved, and FOV raised.

    | Setting | Before | After |
    |---|---|---|
    | `aggressiveRidingMode` | Off | On |
    | `cornerLookAheadMode` | Off | On |
    | `dynamicSteeringSensitivityMode` | Off | On |
    | `firstEquipCameraEnabled` | Off | On |
    | `immersiveCameraEnabled` | Off | On |
    | `responsiveDrivingMode` | Off | On |
    | `speedAffectsCameraShake` | Off | On |
    | `speedAffectsFOV` | Off | On |
    | `shakePreset` | `vibrations` | `realistic` |
    | `steeringSensitivity` | `100` | `50` |
    | `cameraFOV` / `baseFOV` | `50.5°` | `67.7°` |

??? note "AutoDriveEnhanced"
    | Setting | Before | After |
    |---|---|---|
    | `autoSpeedControlMaxSpeedRatio` | `0.5` | `0.7` |
    | `drivingAI` | `Vanilla` | `ModdedNormal` |

??? note "DarkFuture"
    Need decay slowed down across the board, HUD simplified and recolored.

    | Setting | Before | After |
    |---|---|---|
    | `energyLossRatePct` | `100%` | `70%` |
    | `hydrationLossRatePct` | `100%` | `70%` |
    | `nutritionLossRatePct` | `100%` | `70%` |
    | `reducedCarryWeight` | `Full` | `Half` |
    | `needHUDUIAlwaysOnThreshold` | `100` | `75` |
    | `energyHUDUIColorTheme` | `Yellow` | `PigeonPost` |
    | `hydrationHUDUIColorTheme` | `MainBlue` | `PigeonPost` |
    | `nutritionHUDUIColorTheme` | `StreetCredGreen` | `PigeonPost` |
    | `nerveHUDUIColorTheme` | `MainRed` | `Rose` |
    | `basicNeedsAdvancedSettings` | Off | On |
    | `interfaceAdvancedSettings` | On | Off |

??? note "EasierCounterAttackSettings"
    | Setting | Before | After |
    |---|---|---|
    | `easierCounterAttackTime` | `0.6s` | `0.4s` (tighter counter window) |

??? note "InformativeHealthbar"
    Turns **off** the extra HUD trackers for a cleaner display:

    - Armor, carry weight, lifepath, money, street cred
    - DarkFuture energy, hydration, nerve, and nutrition

??? note "KdspDeepScanSettings"
    | Setting | Before | After |
    |---|---|---|
    | `enableDiverseRelationships` | Off | On |

??? note "NightCityAllies"
    Brand-new section — not present in the current config at all.

    | Setting | Value |
    |---|---|
    | `allowPassengers` | `true` |
    | `debugMode` | `false` |
    | `interactionMenuRange` | `2.5` |

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

??? note "TF_Config"
    | Setting | Before | After |
    |---|---|---|
    | `modifierKey` | `Ctrl` | `None` |

??? note "VendorPreview"
    | Setting | Before | After |
    |---|---|---|
    | `enableDangerZoneChecker` | Off | On |
