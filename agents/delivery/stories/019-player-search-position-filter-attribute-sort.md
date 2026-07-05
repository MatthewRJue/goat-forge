# Story 019: Player Search, Position Filter, and Attribute Sort

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

* Story 018: Mobile Compatibility Baseline

## Goal

Help players find useful options in the active player pool with search, position filtering, and attribute-based sorting.

## User Story

As a player, I want to filter and sort the eligible player list, so that I can quickly compare the best candidates for the attribute I plan to fill.

## Context

Relevant docs:

* agents/delivery/phase-2.md
* agents/delivery/mvp.md
* agents/product/overview.md
* agents/product/game-rules.md
* agents/product/game-state.md
* agents/product/attribute-calculation.md
* agents/architecture/database-schema.md
* agents/architecture/project-structure.md
* agents/architecture/testing/unit-test.md
* agents/architecture/testing/e2e-test.md
* node_modules/next/dist/docs/ for any Next.js route, layout, metadata, or client/server boundary changes

## Scope

* Add a player-name search input for the active player pool.
* Filter players by visible player name.
* Add a position dropdown for the active player pool.
* Add player-position data to the data contract if the current model does not expose it.
* Add a sort dropdown for alphabetical and attribute-based sorting.
* Default sorting to alphabetical by player name.
* Support descending sort by Athleticism, Shooting, Finishing, Playmaking, and Defense.
* Apply filtering and sorting only after team, era, and previously selected player eligibility rules are enforced.
* Keep the build progress and attribute selection controls visible while filters are used.
* Add an empty filtered state that explains no players match and lets the player clear or adjust filters.

## Acceptance Criteria

* Searching by a visible player name filters the current eligible player pool.
* Selecting a position filters the current eligible player pool to that position.
* Alphabetical sorting by player name is the default display order.
* Attribute sorting orders eligible players by the selected attribute rating descending.
* Previously selected player versions remain excluded before search, filter, or sort rules are applied.
* Filters and sorting only affect the current team and era player pool.
* Build progress and available attribute actions remain visible while using player-list controls.
* Empty filtered results clearly tell the player no players match the current filters.
* Empty filtered results provide a clear way to clear or adjust filters.
* The full game remains playable after searching, filtering, sorting, selecting players, and applying attributes.

## Implementation Notes

Keep filtering and sorting rules in `src/lib/game` or a small helper that can be unit tested. React components should own control state and dispatch/render behavior, not the core filtering rules.

If player position is missing from the current data model, add it through the seed/Supabase data contract and wrapper types before wiring the dropdown. Do not query Supabase directly from React components.

Keep controls compact enough to preserve the mobile baseline from Story 018.

Read the relevant local Next.js docs before changing layout, route, metadata, or client/server component boundaries.

## Tests / Verification

* Unit-test player-name search matching.
* Unit-test position filtering.
* Unit-test default alphabetical sorting.
* Unit-test each playable attribute sort in descending order.
* Unit-test that already selected player versions are excluded before user-facing filtering and sorting.
* Run `npm run lint`.
* Run `npm run test:unit`.
* Run `npm run test:e2e`.
* E2E-test search, position filtering, attribute sorting, empty filtered state, and clearing or adjusting filters.
* Verify the filtering controls are usable on a mobile viewport.
* Run `git diff --check`.

## Out of Scope

* Global player search across all teams and eras.
* Advanced multi-select filters.
* Saved filter preferences.
* Server-side search endpoints unless the existing data layer requires them.
* Accounts, leaderboards, or saved games.
