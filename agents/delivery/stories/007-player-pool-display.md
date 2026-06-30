# Story 007: Player Pool Display

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

* Story 006: Category Selection

## Goal

Display the eligible top player versions for the selected team, era, and category while excluding player versions already used in the current game.

## User Story

As a player, I want to see the available players for my team and era, so that I can decide whose rating to apply to my selected category.

## Context

Relevant docs:

* agents/delivery/mvp.md
* agents/product/overview.md
* agents/product/game-rules.md
* agents/product/game-state.md
* agents/architecture/database-schema.md
* agents/architecture/project-structure.md
* agents/architecture/testing/unit-test.md
* agents/architecture/testing/e2e-test.md

## Scope

* Load player options after a category is selected.
* Filter by current team id and current era id.
* Return up to the top 20 player versions for that team-era pair.
* Exclude any `playerVersionId` already in `usedPlayerVersionIds`.
* Display player name, version label, and the rating for the selected category.
* Display enough context to make the team-era pool understandable.
* Show an error state if no eligible players are found.
* Allow the user to spin again without consuming a respin when an empty pool is treated as a data issue.

## Acceptance Criteria

* Player cards appear after a valid category is selected.
* Player pool queries use the selected team and selected era.
* Previously selected player versions are not shown as selectable.
* Different versions of the same base player may appear if they have different `playerVersionId` values and match the pool.
* Empty pool handling does not consume a team or era respin.
* UI components do not import app seed data directly.

## Implementation Notes

Keep player-pool filtering in `src/lib/game` or a data query wrapper rather than in React component rendering. The selected-category rating should be derived from the player option attributes.

The exact top-20 ranking methodology can be simple for MVP if seed data is already curated.

## Tests / Verification

* Run `npm run test:unit`.
* Add unit tests for player-pool filtering, used-player exclusion, and empty-pool behavior.
* Add E2E coverage that player cards appear after category selection.
* Manually verify displayed ratings match the selected category.

## Out of Scope

* Applying selected-player ratings to the build.
* Round advancement after player selection.
* Full player ranking methodology.
* Production data completeness.
