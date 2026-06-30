import { expect, test } from "@playwright/test";

test("selecting a category reveals the player-selection state", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("goat-builder-test-random", "first");
  });
  await page.goto("/game");

  await expect(page.getByText("selectingCategory")).toBeVisible();
  await expect(page.getByTestId("category-card")).toHaveCount(5);
  await expect(page.getByTestId("available-category")).toHaveCount(5);

  await page.getByRole("button", { name: /Shooting/ }).click();

  await expect(page.getByText("selectingPlayer")).toBeVisible();
  await expect(page.getByTestId("player-pool-panel")).toBeVisible();
  await expect(page.getByTestId("player-pool-panel")).toContainText("Shooting");
  await expect(page.getByTestId("player-card")).toHaveCount(2);
  await expect(page.getByTestId("player-card").first()).toContainText(
    "Magic Johnson",
  );
  await expect(page.getByTestId("player-card").first()).toContainText("86");
  await expect(page.getByTestId("available-category")).toHaveCount(0);
  await expect(page.getByTestId("locked-category")).toHaveCount(5);
});

test("selecting a player completes the selected category", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("goat-builder-test-random", "first");
  });
  await page.goto("/game");

  await expect(page.getByText("selectingCategory")).toBeVisible();

  await page.getByRole("button", { name: /Shooting/ }).click();
  await page.getByTestId("player-card").first().click();

  await expect(
    page.getByRole("heading", { name: "Round 2 of 5" }),
  ).toBeVisible();
  await expect(page.getByText("selectingCategory")).toBeVisible();
  await expect(page.getByTestId("player-pool-panel")).toBeHidden();
  await expect(page.getByTestId("completed-category")).toHaveCount(1);
  await expect(page.getByTestId("completed-category")).toContainText("Shooting");
  await expect(page.getByTestId("completed-category")).toContainText(
    "Magic Johnson",
  );
  await expect(page.getByTestId("completed-category")).toContainText("86");
  await expect(page.getByTestId("available-category")).toHaveCount(4);
  await expect(page.getByTestId("locked-category")).toHaveCount(1);
});

test("category selection still works after respins", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("goat-builder-test-random", "first");
  });
  await page.goto("/game");

  await expect(page.getByText("selectingCategory")).toBeVisible();

  await page.getByTestId("team-respin-button").click();
  await page.getByTestId("era-respin-button").click();

  await expect(page.getByTestId("available-category")).toHaveCount(5);

  await page.getByRole("button", { name: /Defense/ }).click();

  await expect(page.getByText("selectingPlayer")).toBeVisible();
  await expect(page.getByTestId("player-pool-panel")).toContainText("Defense");
  await expect(page.getByTestId("player-card")).toHaveCount(2);
  await expect(page.getByTestId("team-respin-button")).toBeDisabled();
  await expect(page.getByTestId("era-respin-button")).toBeDisabled();
});
