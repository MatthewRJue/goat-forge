# Unit Testing Specification

## Purpose

This document defines how unit tests should be written for GOAT Builder.

Unit tests should verify the correctness of isolated business logic, utility functions, reducers, scoring logic, and attribute calculation.

Unit tests should be fast, deterministic, and independent of external services.

---

# Testing Tool

Use:

```text
Vitest
```

Unit tests should not require a running browser, database, or deployed application.

---

# Unit Testing Philosophy

Unit tests should answer:

```text
Does this function or reducer behave correctly for known inputs?
```

Unit tests should focus on:

* Game state transitions
* Game rules
* Scoring
* Ranking
* Respins
* Attribute calculation
* Random helpers
* Data transformation helpers

Unit tests should not focus on:

* Visual styling
* Animation timing
* Exact layout
* Third-party library internals
* Supabase network behavior

---

# File Location

Place unit tests under the shared project testing folder.

Preferred structure:

```text
src/lib/game/game-reducer.ts
testing/unit/game/game-reducer.test.ts

src/lib/scoring/calculate-final-score.ts
testing/unit/scoring/calculate-final-score.test.ts

src/lib/attributes/calculate-attribute-rating.ts
testing/unit/attributes/calculate-attribute-rating.test.ts
```

Component unit tests may be placed next to components:

```text
src/components/game/category-card.tsx
src/components/game/category-card.test.tsx
```

Small colocated tests are acceptable when they make a module easier to maintain, but `testing/unit` is the default project standard.

---

# Required Package Scripts

The project should include:

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run",
    "test:unit:watch": "vitest"
  }
}
```

These scripts may be added by the project foundation story. If they are not present yet, add them before relying on unit-test verification.

---

# Required Test Areas

## Game Reducer

The game reducer is the most important unit testing target.

Test the following behaviors:

```text
start game initializes a clean game
currentRound starts at 1
totalRounds is 5
all categories are initially available
completedCategories starts empty
usedPlayerVersionIds starts empty
team respin starts available
era respin starts available
finalScore starts null
finalRank starts null
```

---

## Round Flow

Test:

```text
spinning creates a current team and current era
selecting a category moves status to selectingPlayer
selecting a player completes the category
completed category is removed from available categories
selected player version is added to usedPlayerVersionIds
round history is updated
currentRound increments after a completed round
game ends after five completed categories
```

---

## Category Rules

Test:

```text
a category can only be selected if it is available
a completed category cannot be selected again
selecting an invalid category does not corrupt state
all five MVP categories are supported
```

MVP categories:

```text
athleticism
shooting
finishing
playmaking
defense
```

---

## Player Reuse Rules

Test:

```text
a player version can only be selected once per game
a used player version cannot be selected again
usedPlayerVersionIds updates after player selection
```

The restriction applies to `playerVersionId`, not the base `playerId`.

This means different versions of the same player are allowed.

Example:

```text
2010s Heat LeBron can be selected once.
2020s Lakers LeBron is a different player version and may also be selected.
```

---

## Respin Rules

Test:

```text
team respin is available at the start of a game
era respin is available at the start of a game
team respin can only be used once
era respin can only be used once
team respin changes only the team
era respin changes only the era
both respins can be used during the same round
using both respins exhausts both resources
used respin round numbers are recorded
respins cannot be used after they are exhausted
```

---

## Duplicate Team And Era Rules

Test:

```text
teams may repeat across rounds
eras may repeat across rounds
the game does not reject duplicate teams
the game does not reject duplicate eras
```

---

## Score Calculation

Test:

```text
final score is the sum of all five completed category ratings
score calculation works regardless of category order
score is null before the game is complete
score is calculated after the fifth completed category
```

Example:

```text
Athleticism = 99
Shooting = 95
Finishing = 98
Playmaking = 94
Defense = 90

Final Score = 476
```

---

## Rank Calculation

Test initial MVP thresholds:

```text
490+     GOAT
475-489  Hall of Fame
460-474  All-Time Great
440-459  All-Star
420-439  Starter
Below    Role Player
```

Boundary cases are required.

Examples:

```text
489 = Hall of Fame
490 = GOAT

474 = All-Time Great
475 = Hall of Fame

459 = All-Star
460 = All-Time Great

419 = Role Player
420 = Starter
```

---

## Attribute Calculator

Test:

```text
percentile conversion creates expected rating values
weighted formulas produce expected calculated ratings
manual adjustments are applied correctly
final ratings cannot exceed 99
final ratings cannot go below 0
missing optional stats are handled safely
all MVP attributes can be calculated
```

MVP attributes:

```text
athleticism
shooting
finishing
playmaking
defense
```

---

## Randomness

Game logic must not call `Math.random()` directly.

Use an injectable random function.

Example:

```ts
function getRandomItem<T>(items: T[], random = Math.random): T {
  const index = Math.floor(random() * items.length);
  return items[index];
}
```

Tests should pass deterministic random functions.

Example:

```ts
const alwaysFirst = () => 0;
const almostLast = () => 0.999;
```

Required tests:

```text
getRandomItem returns the first item when random returns 0
getRandomItem returns the last item when random returns close to 1
getRandomItem handles empty arrays according to the chosen app behavior
```

---

# Mock Data

Unit tests should use local fixtures.

Recommended folder:

```text
testing/fixtures/
```

Example files:

```text
teams.fixture.ts
eras.fixture.ts
player-options.fixture.ts
game-state.fixture.ts
```

Fixtures should be small and readable.

Do not use production Supabase data in unit tests.

---

# Supabase Rule

Unit tests should not call Supabase directly.

Database access should be wrapped in functions that can be mocked.

Example:

```text
Good:
getPlayerPool(teamId, eraId)

Bad:
supabase.from("player_versions") directly inside component logic
```

---

# Component Unit Tests

Component unit tests are optional for MVP but useful for important interactive components.

Good component test candidates:

```text
StartGameButton
CategoryCard
PlayerCard
RespinControls
ScoreSummary
FinalResultCard
```

Test behavior, not styling.

Examples:

```text
button calls handler when clicked
disabled button cannot be clicked
selected category displays as locked
respin button is disabled after use
```

---

# Test Naming

Use behavior-focused test names.

Good:

```text
it disables team respin after it is used
```

Bad:

```text
it works
```

---

# Definition of Done

A unit-tested feature is complete when:

```text
all relevant game rules are tested
important edge cases are tested
tests are deterministic
tests do not require external services
tests pass with npm run test:unit
```

For any change to game logic, add or update unit tests in the same implementation task.
