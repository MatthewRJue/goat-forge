# Project Structure

## Purpose

This document defines the recommended folder structure for GOAT Builder.

The structure should keep the MVP easy to build while leaving clear places for future game logic, Supabase access, tests, and UI components.

---

# Guiding Principles

## Keep Routes Thin

Next.js route files should compose screens and route-level data.

Avoid putting game rules, scoring, random selection, or Supabase query details directly in route files.

## Keep Game Logic Framework-Light

Core game logic should live in plain TypeScript modules.

Logic should be easy to unit test without rendering React, starting Next.js, or connecting to Supabase.

## Separate Product Logic From Data Access

Game rules should not call Supabase directly.

Database access should be wrapped in small query modules. During MVP development, those modules may read seeded database records or temporary local seed data, but UI and game logic should not depend on hardcoded sample arrays.

## Prefer Feature-Oriented UI

Game UI components should live near other game UI components.

Shared generic components should only be created after reuse is real.

## Use One Testing Root

All project tests should live under a top-level `testing/` folder.

Use separate child folders for unit tests, E2E tests, fixtures, and test utilities.

---

# Recommended Structure

```text
.
+-- agents
|   +-- architecture
|   +-- delivery
|   +-- product
+-- public
+-- supabase
|   +-- seed.sql
+-- src
|   +-- app
|   |   +-- api
|   |   +-- game
|   |   |   +-- page.tsx
|   |   +-- results
|   |   |   +-- page.tsx
|   |   +-- globals.css
|   |   +-- layout.tsx
|   |   +-- page.tsx
|   +-- components
|   |   +-- game
|   |   +-- results
|   |   +-- ui
|   +-- data
|   |   +-- seed
|   +-- lib
|   |   +-- attributes
|   |   +-- game
|   |   +-- scoring
|   |   +-- supabase
|   |   +-- utils
|   +-- types
+-- testing
    +-- e2e
    +-- fixtures
    +-- unit
    +-- utils
```

---

# Source Folders

## src/app

Contains Next.js routes, layouts, route handlers, and route-specific loading or error UI.

Recommended MVP routes:

```text
src/app/page.tsx
src/app/game/page.tsx
src/app/results/page.tsx
src/app/api
```

Route responsibilities:

* Compose page-level UI.
* Connect route-level data where needed.
* Pass data and handlers into components.
* Keep business logic in `src/lib`.

The MVP may also keep the whole game in `src/app/page.tsx` at first if that makes the first playable slice simpler. Once the gameplay surface grows, split game and results into dedicated routes.

## src/app/api

Contains Next.js API route handlers.

Use API routes for logic that should not be controlled directly by the browser, such as future build validation, spin generation, leaderboard updates, or anti-cheat behavior.

For MVP, prefer client-side state and local logic unless a story explicitly needs an API route.

## src/components/game

Contains game-specific UI components.

Examples:

```text
start-game-button.tsx
round-indicator.tsx
spin-panel.tsx
respin-controls.tsx
category-card.tsx
player-card.tsx
completed-build.tsx
```

Components in this folder may know about GOAT Builder concepts such as rounds, teams, eras, categories, player versions, and ratings.

## src/components/results

Contains result-screen UI.

Examples:

```text
final-score.tsx
final-rank.tsx
final-build-card.tsx
play-again-button.tsx
```

## src/components/ui

Contains reusable presentational components that are not specific to basketball or the game.

Examples:

```text
button.tsx
card.tsx
badge.tsx
dialog.tsx
```

Do not add components here just because they might be reused later. Start in the feature folder and promote only after reuse is clear.

## src/lib/game

Contains core game state and gameplay rules.

Examples:

```text
game-reducer.ts
game-actions.ts
game-state.ts
select-player.ts
spin-round.ts
respins.ts
player-pool.ts
```

This is the primary home for:

* Starting a game
* Spinning teams and eras
* Applying respins
* Selecting categories
* Selecting players
* Advancing rounds
* Enforcing player reuse rules

Game logic should use injectable randomness so tests can be deterministic.

## src/lib/scoring

Contains score and rank logic.

Examples:

```text
calculate-final-score.ts
calculate-final-rank.ts
rank-thresholds.ts
```

## src/lib/attributes

Contains attribute calculation logic.

Examples:

```text
calculate-attribute-rating.ts
percentiles.ts
manual-adjustments.ts
rating-scale.ts
```

For MVP, this folder may be light if seed data already includes final ratings. Keep the folder available for the full attribute generation system.

## src/lib/supabase

Contains Supabase client setup and database query wrappers.

Examples:

```text
client.ts
queries
  teams.ts
  eras.ts
  player-versions.ts
```

Do not query Supabase directly from React components or game reducers.

Use wrapper functions such as:

```text
getTeams()
getEras()
getPlayerPool(teamId, eraId)
```

## src/lib/utils

Contains small shared utilities.

Examples:

```text
random.ts
format-rating.ts
assert-never.ts
```

Avoid turning this into a catch-all for domain logic. If a utility knows about game rules, put it in `src/lib/game`.

## src/data/seed

Contains local MVP seed data used by the app during early development before Supabase is wired into the same workflow.

Examples:

```text
teams.ts
eras.ts
players.ts
player-versions.ts
player-attributes.ts
```

Local seed data should mirror the database tables and be easy to migrate into `supabase/seed.sql` or replace with Supabase queries later.

Do not let UI components import these files directly. Route-level data loaders or query wrappers should hide whether data is coming from local seed files or Supabase.

## Seed And Fixture Vocabulary

Use these terms consistently:

* `supabase/seed.sql` - MVP app seed data for real database tables.
* `src/data/seed` - temporary app bootstrap seed modules before Supabase is wired into the same workflow.
* `testing/fixtures` - test-only data used by unit or E2E tests.

Do not put app/runtime seed data in `testing/fixtures`.

## src/types

Contains shared TypeScript types that are used across multiple app areas.

Examples:

```text
game.ts
database.ts
player.ts
```

Prefer colocating narrow types with their module until they need to be shared.

---

# Testing Structure

Use a single top-level `testing/` folder.

```text
testing
+-- e2e
|   +-- full-game.spec.ts
|   +-- respins.spec.ts
|   +-- results.spec.ts
+-- fixtures
|   +-- teams.fixture.ts
|   +-- eras.fixture.ts
|   +-- player-options.fixture.ts
|   +-- game-state.fixture.ts
+-- unit
|   +-- attributes
|   +-- game
|   +-- scoring
+-- utils
```

## testing/unit

Contains Vitest tests for isolated logic.

Recommended examples:

```text
testing/unit/game/game-reducer.test.ts
testing/unit/game/respins.test.ts
testing/unit/scoring/calculate-final-score.test.ts
testing/unit/scoring/calculate-final-rank.test.ts
testing/unit/attributes/calculate-attribute-rating.test.ts
```

Use this folder for game rules, reducers, scoring, ranking, attribute calculation, randomness helpers, and data transformation helpers.

Small colocated tests are acceptable when they make a module easier to maintain, but `testing/unit` is the default project standard.

## testing/e2e

Contains Playwright tests for browser workflows.

Recommended examples:

```text
testing/e2e/full-game.spec.ts
testing/e2e/respins.spec.ts
testing/e2e/results.spec.ts
```

E2E tests should use accessible selectors when possible and `data-testid` for repeated game-specific elements.

## testing/fixtures

Contains test-only fixture data.

Do not use production Supabase data in tests.

App development seed data may live in `src/data/seed`; test-only fixtures should live in `testing/fixtures`.

## testing/utils

Contains test helpers.

Examples:

```text
render-with-providers.tsx
deterministic-random.ts
build-game-state.ts
```

---

# Naming Conventions

Use lowercase kebab-case for files:

```text
category-card.tsx
calculate-final-score.ts
player-options.fixture.ts
full-game.spec.ts
```

Use PascalCase for React component names inside files:

```ts
export function CategoryCard() {}
```

Use descriptive test names that describe behavior.

---

# MVP Placement Guide

Use this guide when creating the first stories.

## Project Foundation

```text
src/app
src/components/ui
src/lib/utils
testing
```

## Seed Data

```text
supabase/seed.sql
src/data/seed
testing/fixtures
```

## Game State And Rules

```text
src/lib/game
testing/unit/game
```

## Score And Rank

```text
src/lib/scoring
testing/unit/scoring
```

## Attribute Calculation

```text
src/lib/attributes
testing/unit/attributes
```

## Game UI

```text
src/app/page.tsx
src/app/game/page.tsx
src/components/game
```

## Results UI

```text
src/app/results/page.tsx
src/components/results
```

## E2E Coverage

```text
testing/e2e
```

---

# Import Direction

Prefer this dependency direction:

```text
src/app
  imports src/components and src/lib

src/components
  imports src/lib, src/types, and other components

src/lib
  imports src/types and other lib modules

src/types
  imports nothing app-specific
```

Avoid importing from `src/app` into `src/components`, `src/lib`, or tests.

Avoid circular dependencies between game logic, data access, and UI.

---

# Documentation Rules

When adding or changing project structure, update this file.

When adding a story that creates new folders, reference this file in the story context.

When a structure decision conflicts with another architecture doc, prefer this file for file placement and update the older doc to match.
