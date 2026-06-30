# Story 006: Category Selection

## Status

NOT_STARTED

Allowed statuses:

* NOT_STARTED - Work has not begun.
* IN_PROGRESS - Work is actively being implemented.
* BLOCKED - Work cannot continue until a blocker is resolved.
* PARTIALLY_COMPLETE - Some scope is complete, but remaining work is still required.
* COMPLETE - All acceptance criteria are met and verified.

## Story Dependencies

Stories that must be completed before this story can be worked or finished:

* Story 005: Team And Era Respins

## Goal

Let the player choose one remaining attribute category for the current round and lock completed categories out of future selection.

## User Story

As a player, I want to choose which skill category to fill each round, so that my choices matter and I can adapt to the team-era result.

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

* Display all five MVP categories: athleticism, shooting, finishing, playmaking, and defense.
* Indicate which categories are available and which are completed.
* Allow selection only from `availableCategories`.
* Set `selectedCategory` when a valid category is chosen.
* Move state from `selectingCategory` to `selectingPlayer`.
* Prevent completed or invalid categories from corrupting game state.
* Keep the UI usable after respins and before player selection.

## Acceptance Criteria

* All five categories are visible at the start of a game.
* A player can choose any remaining category during the current round.
* Selecting a category moves the game to player selection.
* Completed categories cannot be selected again.
* Invalid category choices are ignored or surfaced safely.
* Category selection does not auto-fill ratings.
* Category labels shown in UI are player-friendly while internal values remain stable.

## Implementation Notes

Use the canonical category ids from `agents/product/game-state.md` in game state. Display labels can be formatted separately.

If player pool loading is not complete yet, this story may transition into a placeholder player-selection panel. The real pool behavior is handled by the next story.

## Tests / Verification

* Run `npm run test:unit`.
* Add unit tests for category selection, unavailable categories, and invalid category input.
* Add E2E coverage that selecting a category reveals the player-selection state.
* Manually verify completed categories render as locked once later stories create completions.

## Out of Scope

* Player card display.
* Player selection and rating assignment.
* Automatic category recommendation.
* Future categories beyond the five MVP categories.
