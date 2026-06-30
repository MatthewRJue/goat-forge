import { expect, test } from "@playwright/test";

test("selecting a category reveals the player-selection state", async ({ page }) => {
  await page.goto("/game");

  await expect(page.getByText("selectingCategory")).toBeVisible();
  await expect(page.getByTestId("category-card")).toHaveCount(5);
  await expect(page.getByTestId("available-category")).toHaveCount(5);

  await page.getByRole("button", { name: /Shooting/ }).click();

  await expect(page.getByText("selectingPlayer")).toBeVisible();
  await expect(page.getByTestId("player-selection-placeholder")).toBeVisible();
  await expect(page.getByTestId("player-selection-placeholder")).toContainText(
    "Shooting",
  );
  await expect(page.getByTestId("available-category")).toHaveCount(0);
  await expect(page.getByTestId("locked-category")).toHaveCount(5);
});

test("category selection still works after respins", async ({ page }) => {
  await page.goto("/game");

  await expect(page.getByText("selectingCategory")).toBeVisible();

  await page.getByTestId("team-respin-button").click();
  await page.getByTestId("era-respin-button").click();

  await expect(page.getByTestId("available-category")).toHaveCount(5);

  await page.getByRole("button", { name: /Defense/ }).click();

  await expect(page.getByText("selectingPlayer")).toBeVisible();
  await expect(page.getByTestId("player-selection-placeholder")).toContainText(
    "Defense",
  );
  await expect(page.getByTestId("team-respin-button")).toBeDisabled();
  await expect(page.getByTestId("era-respin-button")).toBeDisabled();
});
