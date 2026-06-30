# Story 005: Team And Era Respins

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

* Story 004: Team And Era Spin

## Goal

Allow one team respin and one era respin per game, with clear UI state and durable in-game consumption rules.

## User Story

As a player, I want one chance to reroll my team and one chance to reroll my era, so that I can make strategic tradeoffs during a game.

## Context

Relevant docs:

* agents/delivery/mvp.md
* agents/product/game-rules.md
* agents/product/game-state.md
* agents/architecture/project-structure.md
* agents/architecture/testing/unit-test.md
* agents/architecture/testing/e2e-test.md

## Scope

* Add UI controls for team respin and era respin.
* Allow team respin only while `teamRespinAvailable` is true and the game is selecting a category.
* Allow era respin only while `eraRespinAvailable` is true and the game is selecting a category.
* Team respin changes only the current team.
* Era respin changes only the current era.
* Record the round where each respin was used.
* Disable or otherwise make consumed respins unavailable for the rest of the game.
* Allow both respins to be used during the same round.
* Handle a respin returning the same team or era as valid MVP behavior.

## Acceptance Criteria

* Team respin is available at game start.
* Era respin is available at game start.
* Team respin can be used once per game.
* Era respin can be used once per game.
* Consumed respin controls cannot be used again.
* Team respin leaves the current era unchanged.
* Era respin leaves the current team unchanged.
* Using both respins in one round does not block category selection.
* Respin usage records include the current round number.

## Implementation Notes

Keep respin logic in `src/lib/game`, not inside button handlers. Buttons should dispatch game actions and render disabled states based on reducer state.

The MVP does not need to prevent a respin from producing the same value.

## Tests / Verification

* Run `npm run test:unit`.
* Add unit tests for all respin rules and exhausted-respin behavior.
* Add E2E coverage for visible respin buttons, one-time use, disabled states, and using both respins in one round.
* Manually verify category selection still works after respins.

## Out of Scope

* Extra respin rewards.
* Preventing repeated respin results.
* Paid respins or account-tied respins.
* Animation polish beyond basic usable feedback.
