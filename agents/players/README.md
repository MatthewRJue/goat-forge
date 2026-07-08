# Player Data Research

This folder is the planning home for expanding GOAT Builder from a small sample dataset into a full player-version database.

The current recommendation is:

1. Seed players with a reproducible stats pipeline, not hand-entered ratings.
2. Use formula-generated ratings as the default source of truth.
3. Add AI/human review only as a controlled adjustment layer with written reasons.
4. Keep mode eligibility separate from base player ratings so one player version can appear in several game modes without duplicated data.
5. Roll out coverage in phases: core franchises and stars first, then full team-era pools, then role-player modes, then novelty/challenge modes.

## Research Files

* [Full game player seeding research](./full-game-player-seeding-research.md)
* [Attribute rating research](./attribute-rating-research.md)
* [Game modes research](./game-modes-research.md)
* [Initial seed roadmap](./initial-seed-roadmap.md)

## Existing Project Context

Read these first when turning this research into implementation stories:

* [Product overview](../product/overview.md)
* [Game rules](../product/game-rules.md)
* [Game state](../product/game-state.md)
* [Attribute calculation](../product/attribute-calculation.md)
* [Database schema](../architecture/database-schema.md)
* [Project structure](../architecture/project-structure.md)

## Highest-Confidence Direction

The best full-game seed strategy is a hybrid:

* Build a stats-based generator for every player version.
* Normalize against the player's actual season environment.
* Curate eligible player pools with objective thresholds.
* Review only the top outliers and mode-defining edge cases.

This gives the game a defensible basketball backbone while still leaving room for "does this feel right?" tuning.

