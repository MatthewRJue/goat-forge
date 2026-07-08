# Story 020: Spin and Respin Animation

## Status

IN_PROGRESS

Allowed statuses:

* NOT_STARTED - Work has not begun.
* IN_PROGRESS - Work is actively being implemented.
* BLOCKED - Work cannot continue until a blocker is resolved.
* PARTIALLY_COMPLETE - Some scope is complete, but remaining work is still required.
* COMPLETE - All acceptance criteria are met and verified.

## Story Dependencies

Stories that must be completed before this story can be worked or finished:

* Story 019: Player Search, Position Filter, and Attribute Sort

## Goal

Make spin and respin actions feel like polished game events while keeping the final game-state changes deterministic and testable.

## User Story

As a player, I want spins and respins to visibly generate and settle their results, so that each round feels more exciting than an instant text update.

## Context

Relevant docs:

* agents/delivery/phase-2.md
* agents/delivery/mvp.md
* agents/product/overview.md
* agents/product/game-rules.md
* agents/product/game-state.md
* agents/architecture/project-structure.md
* agents/architecture/testing/unit-test.md
* agents/architecture/testing/e2e-test.md
* node_modules/next/dist/docs/ for any Next.js route, layout, metadata, or client/server boundary changes

## Scope

* Add a spin animation before revealing the selected team and era.
* Add a team respin animation before revealing the updated team result.
* Add an era respin animation before revealing the updated era result.
* Make the animation clearly communicate that a result is being generated and then settled.
* Keep the final selected team and era easy to read after animation completes.
* Prevent duplicate clicks while an animation or state transition is in progress.
* Respect reduced-motion preferences.
* Keep final team and era selection deterministic for tests.
* Add stable test hooks or reduced animation duration in test mode so automated tests do not rely on fixed sleeps.

## Acceptance Criteria

* Clicking the initial spin button shows a visible in-progress state before the selected team and era are revealed.
* Clicking team respin shows a visible in-progress state before the updated team is revealed.
* Clicking era respin shows a visible in-progress state before the updated era is revealed.
* Final team and era values remain readable after each animation settles.
* Spin and respin buttons cannot be double-clicked into duplicate state transitions while an animation is active.
* Users with reduced-motion preferences receive a reduced or non-motion equivalent state change.
* Existing respin limits are still enforced.
* Existing player-first selection, build progress, filtering, and sorting behavior remain intact.
* E2E tests can verify the animated workflow without relying on exact animation sleeps.

## Implementation Notes

Keep animation components in `src/components/game` unless an obviously reusable primitive emerges. Avoid adding an animation library unless the implementation clearly needs one.

The reducer or game-state layer should remain responsible for final selected values and respin limits. Animation state should not make random selection harder to unit test.

Prefer deterministic test hooks, reduced animation duration in test mode, or state-based assertions over fixed waits.

Read the relevant local Next.js docs before changing layout, route, metadata, or client/server component boundaries.

## Tests / Verification

* Run `npm run lint`.
* Run `npm run test:unit`.
* Run `npm run test:e2e`.
* Unit-test any reducer or helper changes related to spin or respin state.
* E2E-test initial spin, team respin, era respin, duplicate-click prevention, and game continuation after animations settle.
* Verify reduced-motion behavior manually or through browser-emulated media preferences.
* Verify mobile layout still keeps animated spin and respin controls reachable.
* Run `git diff --check`.

## Out of Scope

* Physics-heavy wheels.
* Audio effects.
* New gameplay rules.
* Additional respins.
* Accounts, saved games, leaderboards, daily challenges, or social systems.
