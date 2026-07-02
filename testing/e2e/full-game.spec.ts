import { expect, test } from "@playwright/test";

const deterministicFiveRoundSequence = [
  0,
  0,
  0,
  0,
  0.2,
  0.2,
  0.2,
  0.2,
  0.4,
  0,
  0.4,
  0,
  0.6,
  0.4,
  0.6,
  0.4,
  0.8,
  0.6,
  0.8,
  0.6,
  0,
  0,
  0,
  0,
].join(",");

test("player can complete a five-round game without creating a sixth round", async ({
  page,
}) => {
  await page.addInitScript((sequence) => {
    window.localStorage.setItem("goat-builder-test-random-sequence", sequence);
  }, deterministicFiveRoundSequence);
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
    await expect(page.getByTestId("player-card").first()).toBeVisible();

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
    "gameComplete",
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
  await expect(page.getByTestId("player-card").first()).toBeVisible();

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
