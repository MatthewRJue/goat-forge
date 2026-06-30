# Story 002: Seed MVP Game Data

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

* Story 001: Project Foundation

## Goal

Create representative MVP seed data and data-loading boundaries for teams, eras, player versions, and final playable attribute ratings.

## User Story

As a player, I want the game to offer real teams, eras, and player choices, so that the first playable loop feels like an actual NBA GOAT-building game.

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

* Define MVP seed records for `teams`, `eras`, `players`, `player_versions`, and `player_attributes`.
* Include enough teams and eras for spins to feel varied in a five-round game.
* Include enough player versions and attributes for common team-era combinations to return visible player pools.
* Store final MVP attribute ratings for athleticism, shooting, finishing, playmaking, and defense.
* Add local app seed modules in `src/data/seed` if Supabase wiring is not ready yet.
* Add or update `supabase/seed.sql` if the project is ready for database seeding.
* Add query-wrapper functions such as `getTeams()`, `getEras()`, and `getPlayerPool(teamId, eraId)`.
* Ensure UI and game logic consume data through wrappers, not direct seed imports.
* Add test-only fixtures under `testing/fixtures` where unit or E2E tests need predictable data.

## Acceptance Criteria

* Team, era, player, player version, and player attribute data matches the MVP schema.
* Every seeded player version has ratings for all five MVP categories.
* `getPlayerPool(teamId, eraId)` returns up to the top 20 eligible player versions for the selected team and era.
* App/runtime seed data does not live in `testing/fixtures`.
* Test-only fixtures do not rely on production Supabase data.
* The data boundary can later switch from local seed modules to Supabase queries without UI rewrites.

## Implementation Notes

For MVP, ratings may be manually seeded final values. The full percentile-based attribute-generation pipeline is not required before the game is playable.

Keep player versions distinct from base players. Different versions of the same player may be valid separate picks.

Supabase schema and seed wiring are deferred to Story 013 because the project does not yet have reproducible database setup. Until then, app runtime data is served from local seed modules through query wrappers.

## Tests / Verification

* Run `npm run test:unit`.
* Add unit tests for data transformation or query-wrapper behavior where useful.
* Manually verify at least one team-era pair returns a non-empty player pool.
* Manually verify empty player pools can be detected by later game stories.

## Out of Scope

* Exhaustive historical NBA data.
* Full automated attribute calculation from raw statistics.
* User-generated data.
* Authentication or protected database access.
