# Story 015: Inline Build Progress Attribute Selection

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

* Story 010: Player-First Attribute Selection Flow

## Goal

Move attribute selection into the build progress section so the player pool remains visible while the user chooses which attribute to fill.

## User Story

As a player, I want to choose an attribute from the build progress section after selecting a player, so that I can see the full build shape and make the pick in context.

## Context

Relevant docs:

* agents/delivery/mvp.md
* agents/product/overview.md
* agents/product/game-rules.md
* agents/product/game-state.md
* agents/architecture/project-structure.md
* agents/architecture/testing/e2e-test.md
* agents/architecture/testing/unit-test.md

## Scope

* Always show all five MVP attributes in the build progress section.
* Keep the player pool visible after a player is selected.
* Visually highlight the currently selected player card.
* Allow selecting another player card before choosing an attribute.
* Keep unused respins available after selecting a player until an attribute is applied.
* Let the user click an unfilled build progress attribute to apply the selected player's rating.
* Prevent already filled attributes from being selected again.
* Remove the separate attribute selection page/panel from the main game area.
* Update E2E coverage for the inline build progress attribute selection flow.

## Acceptance Criteria

* Build progress displays Athleticism, Shooting, Finishing, Playmaking, and Defense throughout the active game.
* Before a player is selected, unfilled build progress attributes are visible but cannot be applied.
* Selecting a player keeps the player list visible and highlights the selected player card.
* Selecting a different player updates the highlighted card before an attribute is applied.
* Using a respin after selecting a player clears the highlighted player and returns the round to player selection.
* Clicking an unfilled build progress attribute after selecting a player applies that selected player's rating.
* Filled attributes display their selected player, team, era, and rating.
* Filled attributes are disabled and cannot be selected again.
* The separate attribute selection panel is no longer shown.
* The game remains playable through all five rounds and reaches final results.

## Implementation Notes

Keep the change focused on the UI flow. The existing reducer actions may remain in place as long as they continue to enforce player-first selection, category availability, player reuse, and game completion rules.

## Tests / Verification

* Run `npm run test:unit`.
* Run `npm run test:e2e`.
* Run `npm run lint`.
* Run `git diff --check`.

## Out of Scope

* Undoing a completed attribute.
* Changing score or rank logic.
* Saving game progress.
* Adding animations beyond simple selected/locked visual states.
