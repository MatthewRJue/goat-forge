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

const categories = [
  "Athleticism",
  "Shooting",
  "Finishing",
  "Playmaking",
  "Defense",
];

async function installDeterministicGame(page: import("@playwright/test").Page) {
  await page.addInitScript((sequence) => {
    window.localStorage.setItem("goat-builder-test-random-sequence", sequence);
  }, deterministicFiveRoundSequence);
}

async function forceTheme(
  page: import("@playwright/test").Page,
  theme: "light" | "dark",
) {
  await page.addInitScript((themeName) => {
    window.localStorage.setItem("goat-builder-theme", themeName);
  }, theme);
}

async function completeFullGame(page: import("@playwright/test").Page) {
  for (const category of categories) {
    await expect(page.getByTestId("player-card").first()).toBeVisible();
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
  await installDeterministicGame(page);
  await page.goto("/");

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
  await expect(page.getByTestId("player-card").first()).toBeVisible();
  await expect(page.getByTestId("locked-category")).toHaveCount(5);

  await completeFullGame(page);
});

test("dark mode keeps the preserved game surface readable", async ({ page }) => {
  await forceTheme(page, "dark");
  await installDeterministicGame(page);
  await page.goto("/game");

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
  await expect(
    page.getByRole("heading", { name: "Round 1 of 5" }),
  ).toBeVisible();
  await expect(page.getByTestId("player-card").first()).toBeVisible();
  await expect(page.getByTestId("team-respin-button")).toBeEnabled();
  await expect(page.getByTestId("era-respin-button")).toBeEnabled();

  await completeFullGame(page);
});
