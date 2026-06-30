# Story 010: Player-First Attribute Selection Flow

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

* Story 009: Round Progression

## Goal

Update the gameplay flow so each round has the player choose an eligible player version first, then choose which remaining attribute category to apply from that player's ratings.

## User Story

As a player, I want to choose the player before choosing the attribute, so that I can react to the team-era pool and decide which skill from that player best fits my build.

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

* Change the round flow from category-first to player-first.
* After team and era are finalized, show the eligible player pool immediately.
* Let the user select one eligible player version from the current team-era pool.
* After player selection, show only remaining unfilled attribute categories for that player.
* Apply the selected player's rating for the chosen attribute category.
* Create the completed category, round history, and used-player records after the attribute is chosen.
* Prevent already completed categories from being selected.
* Prevent already used player versions from being selected.
* Keep completed build summaries and round progression working with the revised flow.
* Update UI labels and empty/loading states so they no longer imply the user chooses an attribute before a player.

## Acceptance Criteria

* A new round displays the player pool after team and era selection, before any attribute category choice.
* Player cards do not require a preselected category to be selectable.
* Selecting a player reveals the remaining attribute categories for that player.
* Selecting an attribute applies that selected player's rating for that selected category.
* Completed categories are removed from future attribute choices.
* The selected player version cannot be selected again later in the same game.
* Round history records the player and attribute chosen in the actual order they were chosen.
* Respins are available before player selection and unavailable after a player has been chosen for the round.
* The game remains playable through all five rounds and reaches game completion.
* Existing completed build and final-results data still contain category, player, team, era, and rating.

## Implementation Notes

This story intentionally supersedes the category-first interaction created by Stories 006 through 009. Keep the refactor focused on flow order; do not add new scoring, final-results, or persistence behavior here.

The selected player can be tracked separately from `selectedCategory` until the user chooses an attribute. Assignment should happen only after both a player version and an available category have been selected.

Player-pool filtering remains based on current team, current era, and unused `playerVersionId` values. Category availability remains based on unfilled MVP categories.

## Tests / Verification

* Run `npm run test:unit`.
* Run `npm run test:e2e`.
* Update unit tests for player selection, attribute assignment, used-player tracking, and category availability under the player-first flow.
* Update E2E coverage so a player is selected before an attribute category.
* Manually complete all five rounds in the browser using the player-first flow.

## Out of Scope

* Final score and rank calculation.
* Results screen layout.
* Undoing a selected player before choosing an attribute.
* Saving picks to a database.
