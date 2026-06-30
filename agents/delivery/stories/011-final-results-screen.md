# Story 011: Final Results Screen

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

* Story 010: Final Score And Rank

## Goal

Show the completed GOAT build, each category rating, the total score, and the final rank after a full game.

## User Story

As a player, I want to see my finished build clearly, so that I can evaluate the choices I made and feel the payoff of completing the game.

## Context

Relevant docs:

* agents/delivery/mvp.md
* agents/product/overview.md
* agents/product/game-rules.md
* agents/product/game-state.md
* agents/architecture/project-structure.md
* agents/architecture/testing/e2e-test.md

## Scope

* Build results UI in `src/components/results` and route/page composition in `src/app` as appropriate.
* Display all five completed categories.
* For each category, show the selected player, player version label, and applied rating.
* Display final score.
* Display final rank.
* Include a Play Again control for the next story to wire fully.
* Use stable selectors for E2E where repeated result elements need them.
* Keep results readable on mobile and desktop.

## Acceptance Criteria

* Results are shown after five completed categories.
* All five MVP categories are visible on the results screen.
* Each category includes a player and rating.
* Final score is visible.
* Final rank is visible.
* A Play Again button is visible.
* The results screen does not require authentication or saved game history.

## Implementation Notes

The MVP may render results on the same page as the game or in a dedicated `src/app/results/page.tsx` route if state handoff is handled cleanly. Prefer the simplest implementation that keeps the full game playable without persistence.

Use `src/components/results` for result-specific components once the UI grows beyond route composition.

## Tests / Verification

* Run `npm run test:unit`.
* Run `npm run test:e2e`.
* Add E2E assertions for completed categories, final score, final rank, and Play Again visibility.
* Manually complete a full game and inspect the final results.

## Out of Scope

* Play Again reset behavior beyond rendering the control.
* Share cards or downloadable images.
* Leaderboards.
* Saved result history.
