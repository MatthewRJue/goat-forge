# Story 003: Start Game Flow

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

* Story 001: Project Foundation
* Story 002: Seed MVP Game Data

## Goal

Let a player start a new MVP game and initialize clean client-side game state for a five-round playthrough.

## User Story

As a player, I want to press Start Game and begin round 1, so that I can immediately enter the GOAT Builder gameplay loop.

## Context

Relevant docs:

* agents/delivery/mvp.md
* agents/product/overview.md
* agents/product/game-state.md
* agents/product/game-rules.md
* agents/architecture/project-structure.md
* agents/architecture/testing/unit-test.md
* agents/architecture/testing/e2e-test.md

## Scope

* Review the relevant local Next.js docs before changing routes or client/server component boundaries.
* Define shared game types for status, categories, teams, eras, player options, completed categories, respins, round history, and ranks.
* Implement the initial game state from `agents/product/game-state.md`.
* Implement a reducer or equivalent action-based state module for starting a new game.
* Wire the home page Start Game control into a visible active-game surface.
* Initialize `currentRound` to 1, `totalRounds` to 5, all categories as available, and both respins as available.
* Keep state in React state for MVP.
* Reset any previous in-memory game data when a new game starts.

## Acceptance Criteria

* A player can start a game without logging in.
* Starting a game creates a clean five-round game state.
* Initial status moves from `idle` toward the first round flow.
* All five MVP categories are available at game start.
* `completedCategories`, `usedPlayerVersionIds`, and `roundHistory` start empty.
* Team and era respins start available.
* `finalScore` and `finalRank` start as null.
* Refreshing the browser resets the MVP game rather than attempting persistence.

## Implementation Notes

Use `useReducer` unless a different existing pattern is already established. Keep reducer logic in `src/lib/game` and keep route files thin.

This story can show a placeholder game surface after Start Game. Detailed spin, category, and player selection behavior belongs in later stories.

## Tests / Verification

* Run `npm run test:unit`.
* Add unit tests for initial state and start-game behavior.
* Run `npm run test:e2e` if the foundation includes a start-game smoke test.
* Manually verify Start Game transitions out of the idle home state.

## Out of Scope

* Team and era spin implementation.
* Category selection rules.
* Player pool display.
* Scoring, final rank, results screen, and play again.
