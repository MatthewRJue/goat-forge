# Story 013: Play Again Flow

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

* Story 012: Final Results Screen

## Goal

Let the player start a fresh game from the results screen without requiring a page refresh or account state.

## User Story

As a player, I want to play again after seeing my results, so that I can immediately try for a better GOAT build.

## Context

Relevant docs:

* agents/delivery/mvp.md
* agents/product/overview.md
* agents/product/game-rules.md
* agents/product/game-state.md
* agents/architecture/project-structure.md
* agents/architecture/testing/e2e-test.md

## Scope

* Wire the Play Again button to reset game state.
* Start a new game with clean categories, respins, player history, round history, score, and rank.
* Begin the new playthrough at round 1.
* Generate a fresh team and era for the first round of the new game.
* Ensure previous completed categories are not visible as active state in the new game.
* Keep the flow account-free and in-memory for MVP.
* Update E2E coverage so a completed game can start again.

## Acceptance Criteria

* Play Again is available from the final results screen.
* Clicking Play Again starts a new game without a browser refresh.
* New game state has round 1, five available categories, no completed categories, no used player versions, and both respins available.
* Previous final score and rank are cleared from active game state.
* The new first round displays a team and era.
* The player can continue selecting categories and players after playing again.

## Implementation Notes

This should reuse the same start-game/reset behavior from the reducer rather than creating a separate partial reset path.

If results are rendered on a dedicated route, ensure Play Again navigates back into the game in a way that preserves the clean reset behavior.

## Tests / Verification

* Run `npm run test:unit`.
* Run `npm run test:e2e`.
* Add unit coverage for resetting from a completed game.
* Add E2E coverage for completing a game, clicking Play Again, and seeing a clean round 1.
* Manually complete a game and verify replay works.

## Out of Scope

* Saving prior results.
* Comparing runs.
* Daily challenge reset behavior.
* User accounts or persistent sessions.
