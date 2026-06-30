# Story 014: Supabase Schema and Seed Wiring

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

* Story 002: Seed MVP Game Data
* Story 004: Team and Era Spin
* Story 007: Player Pool Display
* Story 010: Player-First Attribute Selection Flow

## Goal

Set up Supabase correctly for the MVP data model and switch the existing game-data wrappers from local seed modules to Supabase-backed queries without requiring UI or game-logic rewrites.

## User Story

As an implementation agent, I want Supabase schema, seed data, and query wiring to match the proven MVP data contract, so that GOAT Builder can move from local bootstrap data toward deployable database-backed gameplay.

## Context

Relevant docs:

* agents/delivery/mvp.md
* agents/product/overview.md
* agents/product/game-rules.md
* agents/product/attribute-calculation.md
* agents/architecture/database-schema.md
* agents/architecture/project-structure.md
* agents/architecture/tech-stack.md
* agents/architecture/testing/unit-test.md
* agents/architecture/testing/e2e-test.md

## Scope

* Confirm the final MVP data access contract created by Story 002 and exercised by player-pool and player-first attribute-selection stories.
* Add Supabase migration or schema setup for `teams`, `eras`, `players`, `player_versions`, and `player_attributes`.
* Add or update `supabase/seed.sql` with MVP seed records that match the schema and local seed dataset.
* Ensure local Supabase setup instructions and environment-variable requirements are clear enough for a new developer or agent to run.
* Update data/query wrappers such as `getTeams()`, `getEras()`, and `getPlayerPool(teamId, eraId)` to read from Supabase.
* Preserve the wrapper API so UI components, game reducers, and gameplay modules do not need to know whether data comes from local seeds or Supabase.
* Keep tests independent from production Supabase data.
* Decide whether temporary local seed modules should remain as fallback/dev bootstrap data or be removed after Supabase wiring is verified.

## Acceptance Criteria

* Supabase has a reproducible schema setup for all MVP game-data tables.
* `supabase/seed.sql` can populate representative MVP teams, eras, players, player versions, and five-category attribute ratings.
* Every seeded player version has exactly one attribute record with athleticism, shooting, finishing, playmaking, and defense ratings.
* `getTeams()`, `getEras()`, and `getPlayerPool(teamId, eraId)` can read from Supabase without changing callers.
* `getPlayerPool(teamId, eraId)` still returns up to the top 20 eligible player versions for the selected team and era.
* Empty player pools are still detectable by app code.
* Unit tests do not require a production Supabase project.
* Documentation or setup notes identify the required Supabase environment variables and local setup steps.

## Implementation Notes

Do this after the local seed-data contract has been used by the spin, player-pool display, and player-first attribute-selection stories. That timing keeps the database schema aligned with proven gameplay needs instead of guessing too early.

Game logic and React components should continue to consume data through query wrappers. Do not introduce direct Supabase calls into components, reducers, or gameplay rule modules.

Prefer deterministic test fixtures, local Supabase test data, or mocked query clients for automated tests. Production Supabase data should not be required for unit or E2E verification.

## Tests / Verification

* Run `npm run lint`.
* Run `npm run test:unit`.
* Run `npm run test:e2e` if database-backed flows are reachable in E2E.
* Verify local Supabase setup can apply schema and seed data from a clean database.
* Manually verify at least one populated team-era pair returns a non-empty player pool.
* Manually verify at least one valid team-era pair with no seeded players returns an empty pool.

## Out of Scope

* Authentication, accounts, or protected database access.
* Saved games or build history.
* Leaderboards.
* Exhaustive historical NBA data.
* Full automated attribute calculation from raw statistics.
