import { expect, test, type Locator, type Page } from "@playwright/test";

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

const categories = [
  "Athleticism",
  "Shooting",
  "Finishing",
  "Playmaking",
  "Defense",
];

test.use({
  deviceScaleFactor: 3,
  hasTouch: true,
  isMobile: true,
  viewport: { width: 390, height: 844 },
});

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

async function expectNoHorizontalPageOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
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

async function expectTouchTarget(locator: Locator) {
  await expect(locator).toBeVisible();

  const box = await locator.boundingBox();

  expect(box).not.toBeNull();
  expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
}

test("mobile player can complete the core game path", async ({ page }) => {
  await page.goto("/");
  await installDeterministicGame(page);

  await expect(page.getByRole("heading", { name: "GOAT Builder" })).toBeVisible();
  await expectNoHorizontalPageOverflow(page);
  await expectTouchTarget(page.getByTestId("start-game-button"));

  await page.getByTestId("start-game-button").click();

  await expect(
    page.getByRole("heading", { name: "Round 1" }),
  ).toBeVisible();
  await expect(page.getByTestId("player-pool-panel")).toBeVisible();
  await expect(page.getByLabel("Build progress")).toBeVisible();
  await expectNoHorizontalPageOverflow(page);
  await expectTouchTarget(page.getByTestId("team-respin-button"));
  await expectTouchTarget(page.getByTestId("era-respin-button"));

  await page.getByTestId("team-respin-button").click();
  await expect(page.getByTestId("team-respin-button")).toBeDisabled();

  await page.getByTestId("era-respin-button").click();
  await expect(page.getByTestId("era-respin-button")).toBeDisabled();
  await expectPlayablePlayerPool(page);
  await expectNoHorizontalPageOverflow(page);

  for (const category of categories) {
    await expectPlayablePlayerPool(page);
    const playerCard = page.getByTestId("player-card").first();

    await expectTouchTarget(playerCard);
    await playerCard.click();

    const categoryButton = page
      .getByLabel("Build progress")
      .getByRole("button", { name: new RegExp(category) });

    await expectTouchTarget(categoryButton);
    await expectNoHorizontalPageOverflow(page);
    await categoryButton.click();
  }

  await expect(page.getByTestId("final-results-status")).toHaveText(
    "Build complete",
  );
  await expect(page.getByTestId("final-result-category")).toHaveCount(5);
  await expectNoHorizontalPageOverflow(page);
  await expectTouchTarget(page.getByTestId("play-again-button"));
});
