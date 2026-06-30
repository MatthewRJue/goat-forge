import { expect, test } from "@playwright/test";

test("home page opens the game route", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "GOAT Builder" }),
  ).toBeVisible();

  await page.getByTestId("start-game-button").click();

  await expect(page).toHaveURL(/\/game$/);
  await expect(
    page.getByRole("heading", { name: "Round 1 of 5" }),
  ).toBeVisible();
  await expect(page.getByText("spinning")).toBeVisible();
  await expect(page.getByTestId("available-category")).toHaveCount(5);
});
