import { expect, test, type Page } from "@playwright/test";

const deterministicFiveRoundSelections = [
  "LAL|2020s",
  "MIA|2020s",
  "LAL|2000s",
  "MIA|2000s",
  "LAL|2020s",
  "MIA|2020s",
  "LAL|2000s",
  "MIA|2000s",
  "LAL|2020s",
].join(";");
const deterministicRecoverySelections = [
  "LAL|2020s",
  "MIA|2020s",
  "LAL|2000s",
  "MIA|2000s",
].join(";");

async function installDeterministicGame(page: Page) {
  await page.evaluate((sequence) => {
    window.localStorage.setItem("goat-builder-test-random", "first");
    window.localStorage.setItem(
      "goat-builder-test-round-spin-selection-sequence",
      sequence,
    );
    window.localStorage.removeItem("goat-builder-test-random-sequence");
    window.localStorage.removeItem("goat-builder-test-round-spin-sequence");
    window.localStorage.setItem("goat-builder-test-spin-animation-ms", "20");
  }, deterministicFiveRoundSelections);
}

async function expectPlayablePlayerPool(page: Page) {
  const playerCard = page.getByTestId("player-card").first();

  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      await expect(playerCard).toBeVisible({ timeout: 2500 });
      return;
    } catch {
      if (await page.getByTestId("player-pool-empty").isVisible()) {
        await page.evaluate((sequence) => {
          window.localStorage.setItem(
            "goat-builder-test-round-spin-selection-sequence",
            sequence,
          );
          window.localStorage.removeItem("goat-builder-test-random-sequence");
          window.localStorage.removeItem("goat-builder-test-round-spin-sequence");
        }, deterministicRecoverySelections);
        await page.getByRole("button", { name: "Spin Again" }).click();
        await expect(page.getByTestId("spin-animation-state")).toHaveAttribute(
          "data-animation-state",
          "settled",
        );
      }
    }
  }

  await expect(playerCard).toBeVisible();
}

test("player can complete a five-round game without creating a sixth round", async ({
  page,
}) => {
  await page.goto("/");
  await installDeterministicGame(page);
  await page.goto("/game");

  const categories = [
    "Athleticism",
    "Shooting",
    "Finishing",
    "Playmaking",
    "Defense",
  ];

  for (const [index, category] of categories.entries()) {
    await expect(
      page.getByRole("heading", { name: `Round ${index + 1} of 5` }),
    ).toBeVisible();
    await expect(page.getByTestId("player-pool-panel")).toBeVisible();
    await expectPlayablePlayerPool(page);

    await page.getByTestId("player-card").first().click();

    await expect(page.getByTestId("player-card").first()).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.getByTestId("player-pool-panel")).toBeVisible();
    await expect(page.getByTestId("available-category")).toHaveCount(
      categories.length - index,
    );

    await page
      .getByLabel("Build progress")
      .getByRole("button", { name: new RegExp(category) })
      .click();

    if (index < categories.length - 1) {
      await expect(page.getByTestId("completed-category")).toHaveCount(index + 1);
    }
  }

  await expect(page.getByTestId("final-results-status")).toHaveText(
    "Build complete",
  );
  await expect(
    page.getByRole("heading", { name: "Final Results" }),
  ).toBeVisible();
  await expect(page.getByTestId("final-result-category")).toHaveCount(5);
  await expect(page.getByTestId("final-result-player")).toHaveCount(5);
  await expect(page.getByTestId("final-result-version")).toHaveCount(5);
  await expect(page.getByTestId("final-result-rating")).toHaveCount(5);

  for (const category of categories) {
    const resultCategory = page
      .getByTestId("final-result-category")
      .filter({ hasText: category });

    await expect(resultCategory).toHaveCount(1);
    await expect(resultCategory.getByTestId("final-result-player")).toHaveText(
      /\S+/,
    );
    await expect(resultCategory.getByTestId("final-result-version")).toHaveText(
      /\S+/,
    );
    await expect(resultCategory.getByTestId("final-result-rating")).toContainText(
      /Rating\s*\d+/,
    );
  }

  await expect(page.getByTestId("final-score")).toContainText(
    /Final Score\s*\d+/,
  );
  await expect(page.getByTestId("final-rank")).toContainText(
    /Final Rank\s*(GOAT|Hall of Fame|All-Time Great|All-Star|Starter|Role Player)/,
  );
  await expect(page.getByTestId("play-again-button")).toBeVisible();
  await expect(page.getByTestId("play-again-button")).toBeEnabled();

  await page.getByTestId("play-again-button").click();

  await expect(page.getByTestId("final-results-status")).toBeHidden();
  await expect(page.getByRole("heading", { name: "Round 1 of 5" })).toBeVisible();
  await expect(page.getByTestId("player-pool-panel")).toBeVisible();
  await expect(page.getByTestId("completed-category")).toHaveCount(0);
  await expect(page.getByTestId("locked-category")).toHaveCount(5);
  await expect(page.getByLabel("Build progress")).not.toContainText(
    "Final score",
  );
  await expect(page.getByLabel("Build progress")).not.toContainText(
    "Round history",
  );
  await expect(page.getByTestId("team-respin-button")).toBeEnabled();
  await expect(page.getByTestId("team-respin-button")).toContainText("Available");
  await expect(page.getByTestId("era-respin-button")).toBeEnabled();
  await expect(page.getByTestId("era-respin-button")).toContainText("Available");
  await expect(page.getByTestId("team-display")).not.toContainText("Spinning");
  await expect(page.getByTestId("era-display")).not.toContainText("Spinning");
  await expectPlayablePlayerPool(page);

  await page.getByTestId("player-card").first().click();

  await expect(page.getByTestId("player-card").first()).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByTestId("available-category")).toHaveCount(5);
  await page
    .getByLabel("Build progress")
    .getByRole("button", { name: /Athleticism/ })
    .click();
  await expect(page.getByTestId("completed-category")).toHaveCount(1);
});
