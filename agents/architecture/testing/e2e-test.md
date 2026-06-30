# End-to-End Testing Specification

## Purpose

This document defines how end-to-end tests should be written for GOAT Builder.

E2E tests should verify that the application works from a real user's perspective.

These tests should cover complete user flows across the browser UI.

---

# Testing Tool

Use:

```text
Playwright
```

E2E tests should run against the application through the browser.

---

# E2E Testing Philosophy

E2E tests should answer:

```text
Can a user successfully complete the important flows?
```

E2E tests should focus on:

* Starting a game
* Playing through five rounds
* Using respins
* Selecting categories
* Selecting players
* Viewing the final result
* Starting another game

E2E tests should not focus on:

* Exact animation timing
* Pixel-perfect styling
* Internal implementation details
* Database implementation details
* Third-party internals

---

# File Location

Place E2E tests under the shared project testing folder:

```text
testing/e2e/
```

Recommended files:

```text
testing/e2e/full-game.spec.ts
testing/e2e/respins.spec.ts
testing/e2e/results.spec.ts
```

---

# Required Package Scripts

The project should include:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed"
  }
}
```

These scripts may be added by the project foundation story. If they are not present yet, add them before relying on E2E verification.

---

# Required Playwright Config

The Playwright config should start the Next.js app before tests.

Recommended behavior:

```text
run dev server before tests
reuse existing server locally when possible
test against localhost
```

Example intent:

```ts
webServer: {
  command: "npm run dev",
  url: "http://localhost:3000",
  reuseExistingServer: true
}
```

---

# Stable Selectors

Use accessible queries when possible.

Preferred:

```text
getByRole
getByLabel
getByText
```

Use `data-testid` for game-specific cards or repeated elements.

Recommended test IDs:

```text
start-game-button
team-display
era-display
team-respin-button
era-respin-button
category-card
player-card
round-indicator
completed-category
final-score
final-rank
play-again-button
```

Do not rely on CSS classes for E2E selectors.

---

# Required E2E Flows

## Full Game Flow

Test that a user can complete a full five-round game.

Required assertions:

```text
home page loads
Start Game button is visible
clicking Start Game begins round 1
team is displayed
era is displayed
categories are displayed
user can select a category
player pool is displayed
user can select a player
round advances after selection
after five rounds, results screen is shown
final score is visible
final rank is visible
Play Again button is visible
```

---

## Respin Flow

Test that respins work correctly.

Required assertions:

```text
team respin button is visible at game start
era respin button is visible at game start
team respin can be used once
era respin can be used once
team respin button is disabled after use
era respin button is disabled after use
both respins may be used during the same round
using both respins does not block category selection
```

---

## Category Selection Flow

Test that categories can only be used once.

Required assertions:

```text
all five categories are available at the start
selected category becomes completed after player selection
completed category cannot be selected again
remaining categories stay selectable
game ends after all five categories are completed
```

---

## Player Selection Flow

Test that users can choose players from the current pool.

Required assertions:

```text
player cards appear after selecting a category
clicking a player applies the selected category rating
selected player version is shown in completed build
previously selected player version cannot be selected again
```

If duplicate prevention is difficult to observe in UI during MVP, cover it with unit tests and keep the E2E assertion simple.

---

## Results Flow

Test that the final results screen displays the completed build.

Required assertions:

```text
all five completed categories are visible
each category has a player
each category has a rating
final score is visible
final rank is visible
Play Again button starts a new game
```

---

# Test Data Strategy

E2E tests should use predictable data.

Acceptable MVP approaches:

```text
use test-only fixtures from testing/fixtures
use deterministic app seed data through test mode
use a seeded test Supabase project
mock API responses
```

Do not run E2E tests against production data.

For early MVP development, test-only fixtures, deterministic app seed data, or mocked API responses are preferred.

Do not put app/runtime seed data in `testing/fixtures`. App seed data belongs in `supabase/seed.sql` or temporary `src/data/seed` modules.

---

# Randomness Rule

E2E tests must be deterministic.

Options:

```text
provide a test mode seed
mock the random selection API
use test-only fixtures or deterministic app seed data with predictable random output
```

Recommended approach:

```text
Add a test mode that uses deterministic team and era selection when NODE_ENV is test.
```

Avoid flaky tests caused by random spins.

---

# Animation Rule

Animations should not make tests flaky.

If needed:

```text
disable or shorten animations during tests
wait for UI state changes instead of fixed timeouts
```

Good:

```text
wait for player cards to be visible
```

Bad:

```text
wait 3000 milliseconds
```

---

# Example Test Outline

```ts
import { expect, test } from "@playwright/test";

test("user can complete a full five-round game", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("start-game-button").click();

  for (let round = 1; round <= 5; round++) {
    await expect(page.getByTestId("round-indicator")).toContainText(`${round}`);

    await page.getByTestId("category-card").first().click();
    await page.getByTestId("player-card").first().click();
  }

  await expect(page.getByTestId("final-score")).toBeVisible();
  await expect(page.getByTestId("final-rank")).toBeVisible();
  await expect(page.getByTestId("play-again-button")).toBeVisible();
});
```

---

# Failure Debugging

Playwright should keep useful debugging artifacts on failure.

Recommended config:

```text
trace on retry
screenshot only on failure
video retain on failure
```

---

# CI Expectations

For MVP, E2E tests should run manually or before deploy.

Later, they can run in CI.

Recommended command:

```text
npm run test:e2e
```

Before merging major gameplay changes, run:

```text
npm run test:unit
npm run test:e2e
```

---

# Definition of Done

An E2E-tested feature is complete when:

```text
the main user flow works in the browser
tests use stable selectors
tests do not depend on random outcomes
tests do not depend on production data
tests pass with npm run test:e2e
```

E2E tests should remain small and focused.

Do not create excessive E2E tests for every edge case.

Use unit tests for detailed game-rule coverage.
