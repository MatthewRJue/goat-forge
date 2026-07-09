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

const categories = [
  "Athleticism",
  "Shooting",
  "Finishing",
  "Playmaking",
  "Defense",
];

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

async function forceTheme(
  page: Page,
  theme: "light" | "dark",
) {
  await page.addInitScript((themeName) => {
    window.localStorage.setItem("goat-builder-theme", themeName);
  }, theme);
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

async function completeFullGame(page: Page) {
  for (const category of categories) {
    await expectPlayablePlayerPool(page);
    await page.getByTestId("player-card").first().click();
    await expect(page.getByTestId("player-card").first()).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.getByTestId("available-category")).toHaveCount(
      categories.length - categories.indexOf(category),
    );

    await page
      .getByLabel("Build progress")
      .getByRole("button", { name: new RegExp(category) })
      .click();
  }

  await expect(page.getByTestId("final-results-status")).toHaveText(
    "Build complete",
  );
  await expect(page.getByTestId("final-result-category")).toHaveCount(5);
}

test("light mode is the primary default presentation", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await installDeterministicGame(page);

  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("html")).toHaveCSS("color-scheme", "light");
  await expect(
    page.getByRole("heading", { name: "GOAT Builder" }),
  ).toBeVisible();
  await expect(page.getByTestId("start-game-button")).toBeVisible();

  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: /Switch to dark mode/ })).toBeFocused();
  await expect(page.getByRole("button", { name: /Switch to dark mode/ })).toHaveCSS(
    "outline-style",
    "solid",
  );

  await page.getByTestId("start-game-button").click();
  await expectPlayablePlayerPool(page);
  await expect(page.getByTestId("locked-category")).toHaveCount(5);

  await completeFullGame(page);
});

test("dark mode keeps the preserved game surface readable", async ({ page }) => {
  await forceTheme(page, "dark");
  await page.goto("/");
  await installDeterministicGame(page);
  await page.goto("/game");

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
  await expect(
    page.getByRole("heading", { name: "Round 1" }),
  ).toBeVisible();
  await expectPlayablePlayerPool(page);
  await expect(page.getByTestId("team-respin-button")).toBeEnabled();
  await expect(page.getByTestId("era-respin-button")).toBeEnabled();

  await completeFullGame(page);
});
