import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("goat-builder-test-random", "first");
  });
  await page.goto("/game");
});

test("player pool controls search, filter, sort, clear, and preserve playability", async ({
  page,
}) => {
  await expect(page.getByTestId("player-pool-panel")).toBeVisible();
  await expect(page.getByLabel("Build progress")).toBeVisible();

  await expect(page.getByTestId("player-card").first()).toContainText(
    "Kareem Abdul-Jabbar",
  );

  await page.getByTestId("player-sort-select").selectOption("shooting");

  await expect(page.getByTestId("player-card").first()).toContainText(
    "Magic Johnson",
  );

  await page.getByTestId("player-search-input").fill("Kareem");

  await expect(page.getByTestId("player-card")).toHaveCount(1);
  await expect(page.getByTestId("player-card").first()).toContainText(
    "Kareem Abdul-Jabbar",
  );
  await expect(page.getByLabel("Build progress")).toBeVisible();

  await page.getByRole("button", { name: "Clear" }).click();
  await page.getByTestId("player-position-filter").selectOption("PG");

  await expect(page.getByTestId("player-card")).toHaveCount(1);
  await expect(page.getByTestId("player-card").first()).toContainText(
    "Magic Johnson",
  );

  await page.getByTestId("player-search-input").fill("No Match");

  await expect(page.getByTestId("player-pool-filtered-empty")).toBeVisible();
  await expect(page.getByTestId("player-pool-filtered-empty")).toContainText(
    "No players match these filters.",
  );
  await expect(page.getByLabel("Build progress")).toBeVisible();

  await page.getByRole("button", { name: "Clear Filters" }).click();

  await expect(page.getByTestId("player-card")).toHaveCount(2);

  await page
    .getByTestId("player-card")
    .filter({ hasText: "Magic Johnson" })
    .click();
  await page
    .getByLabel("Build progress")
    .getByRole("button", { name: /Shooting/ })
    .click();

  await expect(
    page.getByRole("heading", { name: "Round 2 of 5" }),
  ).toBeVisible();
  await expect(page.getByTestId("completed-category")).toContainText(
    "Magic Johnson",
  );
});
