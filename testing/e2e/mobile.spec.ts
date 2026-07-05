import { expect, test, type Locator, type Page } from "@playwright/test";

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
  await page.addInitScript((sequence) => {
    window.localStorage.setItem("goat-builder-test-random-sequence", sequence);
  }, deterministicFiveRoundSequence);
}

async function expectNoHorizontalPageOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

async function expectTouchTarget(locator: Locator) {
  await expect(locator).toBeVisible();

  const box = await locator.boundingBox();

  expect(box).not.toBeNull();
  expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
}

test("mobile player can complete the core game path", async ({ page }) => {
  await installDeterministicGame(page);
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "GOAT Builder" })).toBeVisible();
  await expectNoHorizontalPageOverflow(page);
  await expectTouchTarget(page.getByTestId("start-game-button"));

  await page.getByTestId("start-game-button").click();

  await expect(
    page.getByRole("heading", { name: "Round 1 of 5" }),
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
  await expect(page.getByTestId("player-card").first()).toBeVisible();
  await expectNoHorizontalPageOverflow(page);

  for (const category of categories) {
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
