# Story 004: Team And Era Spin

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

* Story 003: Start Game Flow

## Goal

Generate and display a random team and era for the active round using deterministic, testable game logic.

## User Story

As a player, I want each round to give me a random NBA team and era, so that every decision feels constrained and replayable.

## Context

Relevant docs:

* agents/delivery/mvp.md
* agents/product/game-rules.md
* agents/product/game-state.md
* agents/product/overview.md
* agents/architecture/project-structure.md
* agents/architecture/testing/unit-test.md
* agents/architecture/testing/e2e-test.md

## Scope

* Add random selection helpers that accept injectable randomness.
* Load available teams and eras through data/query wrappers.
* Implement the spin action for the active round.
* Store both original and current team and era values for the round.
* Display the current team and current era in the game UI.
* Move the game into `selectingCategory` after a successful spin.
* Support duplicate teams and duplicate eras across rounds.
* Add an error state for missing teams, missing eras, or no usable spin data.

## Acceptance Criteria

* Starting or entering a round produces one team and one era.
* The selected team and era are visible to the player.
* Game logic does not call `Math.random()` directly from core modules.
* Tests can force first-item and last-item selections with deterministic random functions.
* Teams may repeat across rounds.
* Eras may repeat across rounds.
* Route files do not contain random selection logic.

## Implementation Notes

The game can use a simple text or card display for the selected team and era. Detailed spin animation is optional for MVP and should not make tests flaky.

If no teams or eras are available, show an actionable error rather than corrupting game state.

## Tests / Verification

* Run `npm run test:unit`.
* Add unit tests for random item selection and spin-round state transitions.
* Add or update E2E coverage that Start Game displays team and era values.
* Manually verify multiple starts can show valid team and era combinations.

## Out of Scope

* Team respin and era respin behavior.
* Player pool filtering.
* Category selection.
* Production-quality spin wheel animation.
