import { expect, test } from "@playwright/test";

test("home page opens the game route", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("goat-builder-test-random", "first");
  });
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "GOAT Builder" }),
  ).toBeVisible();

  await page.getByTestId("start-game-button").click();

  await expect(page).toHaveURL(/\/game$/);
  await expect(
    page.getByRole("heading", { name: "Round 1 of 5" }),
  ).toBeVisible();
  await expect(page.getByText("selectingPlayer")).toBeVisible();
  await expect(page.getByTestId("team-display")).toBeVisible();
  await expect(page.getByTestId("team-display")).not.toContainText("Spinning...");
  await expect(page.getByTestId("era-display")).toBeVisible();
  await expect(page.getByTestId("era-display")).not.toContainText("Spinning...");
  await expect(page.getByTestId("player-card").first()).toBeVisible();
  await expect(page.getByTestId("available-category")).toHaveCount(0);
});
