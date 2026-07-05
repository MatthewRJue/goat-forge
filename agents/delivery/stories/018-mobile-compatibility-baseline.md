# Story 018: Mobile Compatibility Baseline

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

* Story 017: Light Mode UI Pass

## Goal

Establish a responsive web baseline so the completed MVP game is comfortable to play on common mobile viewport sizes.

## User Story

As a mobile player, I want the full game to fit my screen with reachable controls, so that I can complete a GOAT Builder run without awkward scrolling, overlap, or hidden actions.

## Context

Relevant docs:

* agents/delivery/phase-2.md
* agents/delivery/mvp.md
* agents/product/overview.md
* agents/product/game-rules.md
* agents/product/game-state.md
* agents/architecture/project-structure.md
* agents/architecture/testing/e2e-test.md
* agents/architecture/testing/unit-test.md
* node_modules/next/dist/docs/ for any Next.js route, layout, metadata, or client/server boundary changes

## Scope

* Review the home screen on common mobile viewport sizes.
* Review the active game surface on common mobile viewport sizes.
* Keep the player list and build progress accessible without awkward horizontal scrolling.
* Ensure spin and respin controls remain easy to reach and do not overlap other UI.
* Ensure touch targets are large enough for primary controls.
* Ensure text does not overflow buttons, cards, filters, progress items, or controls.
* Add or update Playwright mobile viewport coverage for the core game path.
* Add responsive regression checks where practical for hidden actions, overlapping controls, and unusable primary UI.

## Acceptance Criteria

* A player can start a game, spin team and era, select players, apply attributes, use available respins, and reach final results on a mobile viewport.
* Home, game, player list, build progress, and final results remain usable on at least one common mobile viewport.
* Primary controls have touch-friendly hit targets.
* The player list and build progress do not require horizontal page scrolling to use.
* Text does not visibly overflow or collide with adjacent UI on core screens.
* Spin and respin controls remain visible and reachable when available.
* Mobile changes do not break desktop layout or the current player-first flow.

## Implementation Notes

Use responsive web implementation with Tailwind and CSS layout primitives already present in the project. Prefer stable layout constraints such as grid tracks, flex wrapping, min/max widths, and fixed control dimensions where they prevent layout shift.

Keep this story focused on layout and responsive safeguards. Filtering controls are introduced later in Story 019, so reserve only enough space or layout flexibility to support them without building those controls now.

Read the relevant local Next.js docs before changing layout, route, metadata, or client/server component boundaries.

## Tests / Verification

* Run `npm run lint`.
* Run `npm run test:unit` if layout-support helpers change.
* Run `npm run test:e2e`.
* Add or update E2E coverage for at least one mobile viewport completing the core game path.
* Manually verify the home, game, and results screens on a mobile viewport.
* Manually verify desktop layout still works after responsive changes.
* Run `git diff --check`.

## Out of Scope

* Native mobile app work.
* Separate mobile-only routes.
* Player search, position filtering, or attribute sorting.
* Spin and respin animation.
* Accounts, saved games, leaderboards, or social systems.
