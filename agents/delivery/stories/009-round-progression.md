# Story 009: Round Progression

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

* Story 008: Player Selection And Attribute Assignment

## Goal

Advance the player through exactly five rounds, preserving completed choices and preparing each next round cleanly.

## User Story

As a player, I want the game to move to the next round after each pick, so that I can complete all five categories in one smooth playthrough.

## Context

Relevant docs:

* agents/delivery/mvp.md
* agents/product/overview.md
* agents/product/game-rules.md
* agents/product/game-state.md
* agents/architecture/project-structure.md
* agents/architecture/testing/unit-test.md
* agents/architecture/testing/e2e-test.md

## Scope

* Increment `currentRound` after a completed player selection when categories remain.
* Clear `selectedCategory`, `currentTeam`, and `currentEra` between rounds.
* Trigger the next team and era spin for the new round.
* Preserve completed categories, used player version ids, respin availability, and round history.
* Stop advancing after all five categories are filled.
* Move to `gameComplete` when the fifth category is filled.
* Display a round indicator.
* Keep the game playable from round 1 through round 5.

## Acceptance Criteria

* The game starts at round 1.
* The game advances by one round after each completed category until round 5 is complete.
* Round state resets enough for the next category and player choice.
* Completed build data remains visible or accessible across rounds.
* Respin availability is preserved across rounds after use or non-use.
* The game does not create a sixth round.
* After five completed categories, all MVP categories are filled.

## Implementation Notes

The `roundComplete` status may be brief or omitted from visible UI if the reducer still models transitions clearly. Avoid animation timing that E2E tests must wait on with fixed sleeps.

Use deterministic test data so E2E can complete a full game without relying on random outcomes.

Flow update: Story 010 revises the ongoing MVP flow so round progression advances between player-first rounds: team and era, player selection, then attribute selection.

## Tests / Verification

* Run `npm run test:unit`.
* Add unit tests for round advancement, state cleanup, preserved history, and game completion after five categories.
* Add E2E coverage for completing a five-round game path.
* Manually complete all five rounds in the browser.

## Out of Scope

* Final score display.
* Final rank thresholds.
* Results screen design.
* Undo or backtracking.
