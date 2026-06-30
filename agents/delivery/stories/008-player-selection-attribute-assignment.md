# Story 008: Player Selection And Attribute Assignment

## Status

COMPLETE

Allowed statuses:

* NOT_STARTED - Work has not begun.
* IN_PROGRESS - Work is actively being implemented.
* BLOCKED - Work cannot continue until a blocker is resolved.
* PARTIALLY_COMPLETE - Some scope is complete, but remaining work is still required.
* COMPLETE - All acceptance criteria are met and verified.

## Story Dependencies

Stories that must be completed before this story can be worked or finished:

* Story 007: Player Pool Display

## Goal

Allow the player to choose one eligible player version and apply that player's selected-category rating to the custom GOAT build.

## User Story

As a player, I want selecting a player to fill the chosen category with that player's rating, so that my build grows through meaningful round decisions.

## Context

Relevant docs:

* agents/delivery/mvp.md
* agents/product/overview.md
* agents/product/game-rules.md
* agents/product/game-state.md
* agents/product/attribute-calculation.md
* agents/architecture/project-structure.md
* agents/architecture/testing/unit-test.md
* agents/architecture/testing/e2e-test.md

## Scope

* Allow selecting a player only while status is `selectingPlayer`.
* Require a non-null `selectedCategory`.
* Reject player versions already in `usedPlayerVersionIds`.
* Read the selected player's rating for the selected category.
* Create a `CompletedCategory` record with category, player version id, player name, version label, team name, era label, and rating.
* Add the selected player version id to `usedPlayerVersionIds`.
* Remove the category from `availableCategories`.
* Add a `RoundResult` entry with original and final team and era values plus respin flags.
* Show the completed category in the active build summary.

## Acceptance Criteria

* Selecting a player applies exactly the selected category's rating.
* The completed category displays the chosen player and rating.
* A completed category is removed from available categories.
* The selected player version cannot be selected again later in the game.
* Round history records selected category, player, rating, team, era, and respin usage.
* Invalid player selections do not corrupt state.

## Implementation Notes

Player reuse is based on `playerVersionId`, not base `playerId`. This means a different version of the same player can still be valid in a later round.

Keep assignment logic in `src/lib/game` and keep display formatting in components.

## Tests / Verification

* Run `npm run test:unit`.
* Add unit tests for player selection, attribute assignment, completed category creation, and used player tracking.
* Add E2E coverage that selecting a player shows the completed category.
* Manually verify the applied rating changes when choosing a different category for the same player option.

## Out of Scope

* Advancing through all five rounds.
* Final score and rank calculation.
* Undoing completed picks.
* Saving picks to a database.
