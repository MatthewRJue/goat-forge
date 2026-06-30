# Story 011: Final Score And Rank

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

* Story 010: Player-First Attribute Selection Flow

## Goal

Calculate the final build score and MVP rank after all five categories have been completed.

## User Story

As a player, I want to receive a final score and rank, so that I know how strong my completed GOAT build is.

## Context

Relevant docs:

* agents/delivery/mvp.md
* agents/product/overview.md
* agents/product/game-rules.md
* agents/product/game-state.md
* agents/product/attribute-calculation.md
* agents/architecture/project-structure.md
* agents/architecture/testing/unit-test.md

## Scope

* Create scoring logic in `src/lib/scoring`.
* Calculate final score as the sum of all five completed category ratings.
* Calculate final rank using the MVP placeholder thresholds.
* Store `finalScore` and `finalRank` when the game becomes complete.
* Keep score null before all five categories are complete.
* Add boundary tests for all rank tiers.
* Keep thresholds centralized so playtesting can tune them later.

## Acceptance Criteria

* Final score equals athleticism plus shooting plus finishing plus playmaking plus defense.
* Score calculation works regardless of category completion order.
* Score is null before the game is complete.
* A score of 490 or above ranks as GOAT.
* Scores from 475 through 489 rank as Hall of Fame.
* Scores from 460 through 474 rank as All-Time Great.
* Scores from 440 through 459 rank as All-Star.
* Scores from 420 through 439 rank as Starter.
* Scores below 420 rank as Role Player.

## Implementation Notes

Use the placeholder MVP thresholds from the product docs. Do not tune rank values in this story unless the source docs are updated.

Scoring should be plain TypeScript and independently unit-testable without rendering React.

## Tests / Verification

* Run `npm run test:unit`.
* Add unit tests for score summing, null-before-complete behavior, and every rank boundary.
* Manually complete a game and verify state contains a final score and rank.

## Out of Scope

* Results screen layout.
* Share images or social sharing.
* Trusted server-side scoring.
* Leaderboards.
