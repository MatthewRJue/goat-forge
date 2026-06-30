import { expect, test } from "@playwright/test";

test("home page opens the game route", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "GOAT Builder" }),
  ).toBeVisible();

  await page.getByTestId("start-game-button").click();

  await expect(page).toHaveURL(/\/game$/);
  await expect(page.getByRole("heading", { name: "Game Table" })).toBeVisible();
});
