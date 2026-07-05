# Story 017: Light Mode UI Pass

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

* Story 016: Theme Tokens and Light/Dark Mode

## Goal

Make light mode feel like the primary GOAT Builder presentation while preserving the current dark look through the dark theme tokens.

## User Story

As a player, I want the game to look clear and polished in light mode, so that the default experience feels intentional instead of like a dark-mode inversion.

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

* Review and adjust the home screen in light and dark mode.
* Review and adjust the game screen in light and dark mode.
* Review and adjust the player list, selected player state, and disabled player state.
* Review and adjust build progress, completed attributes, and available attribute actions.
* Review and adjust spin and respin controls.
* Review and adjust final results, final score, rank, and completed build display.
* Ensure text, buttons, cards, disabled states, selected states, and focus states are readable in both themes.
* Replace remaining visual choices that only work on a dark background with semantic theme-token usage.

## Acceptance Criteria

* Light mode is the default visual experience for users with a light or unavailable color-scheme preference.
* Dark mode still resembles the preserved MVP dark visual scheme.
* Home, game, player list, build progress, spin controls, respin controls, and final results are readable in both themes.
* Selected, disabled, completed, hover, and focus states are distinguishable in both themes.
* No core game surface depends on a color that only works in dark mode.
* The game remains playable from start through final results in both themes.
* No theme pass changes alter gameplay rules, score calculation, player eligibility, or respin limits.

## Implementation Notes

Build on the theme contract from Story 016. Keep this story focused on applying and refining tokens across visible UI, not inventing additional theme infrastructure.

Favor small, component-local visual adjustments that make existing gameplay clearer. Do not use this story to redesign the information architecture or add new gameplay controls.

Read the relevant local Next.js docs before changing layout, route, metadata, or client/server component boundaries.

## Tests / Verification

* Run `npm run lint`.
* Run `npm run test:unit` if shared visual helpers or state-display helpers change.
* Run `npm run test:e2e`.
* Manually verify the complete game path in light mode.
* Manually verify the complete game path in dark mode.
* Verify keyboard focus states are visible on primary controls in both themes.
* Run `git diff --check`.

## Out of Scope

* New gameplay mechanics.
* Manual theme toggle.
* Saved theme preference.
* Mobile-specific layout restructuring.
* Spin or respin animation.
