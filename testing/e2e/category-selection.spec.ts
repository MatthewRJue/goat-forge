import { expect, test } from "@playwright/test";

test("selecting a player reveals available attribute categories", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("goat-builder-test-random", "first");
  });
  await page.goto("/game");

  await expect(page.getByTestId("player-pool-panel")).toBeVisible();
  await expect(page.getByTestId("player-card").first()).toBeVisible();
  await expect(page.getByTestId("player-card").first()).toContainText(
    "Magic Johnson",
  );
  await expect(page.getByTestId("player-card").first()).toContainText(
    "Shooting",
  );
  await expect(page.getByTestId("player-card").first()).toContainText("86");
  await expect(
    page.getByRole("heading", { name: "Attribute Choice" }),
  ).toBeHidden();
  await expect(page.getByTestId("category-card")).toHaveCount(0);
  await expect(page.getByTestId("available-category")).toHaveCount(0);

  await page.getByTestId("player-card").first().click();

  await expect(
    page.getByRole("heading", { name: "Attribute Choice" }),
  ).toBeVisible();
  await expect(page.getByTestId("selected-player-summary")).toContainText(
    "Magic Johnson",
  );
  await expect(page.getByTestId("player-pool-panel")).toBeHidden();
  await expect(page.getByTestId("available-category")).toHaveCount(5);

  await page.getByTestId("back-to-player-list-button").click();

  await expect(page.getByTestId("selected-player-summary")).toBeHidden();
  await expect(
    page.getByRole("heading", { name: "Attribute Choice" }),
  ).toBeHidden();
  await expect(page.getByTestId("category-card")).toHaveCount(0);
  await expect(page.getByTestId("player-pool-panel")).toBeVisible();
  await expect(page.getByTestId("player-card").first()).toContainText(
    "Magic Johnson",
  );
  await expect(page.getByTestId("team-respin-button")).toBeEnabled();
  await expect(page.getByTestId("era-respin-button")).toBeEnabled();
});

test("selecting an attribute completes the selected player category", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("goat-builder-test-random", "first");
  });
  await page.goto("/game");

  await expect(page.getByTestId("player-pool-panel")).toBeVisible();

  await page.getByTestId("player-card").first().click();
  await page.getByRole("button", { name: /Shooting/ }).click();

  await expect(
    page.getByRole("heading", { name: "Round 2 of 5" }),
  ).toBeVisible();
  await expect(page.getByTestId("player-pool-panel")).toBeVisible();
  await expect(page.getByTestId("completed-category")).toHaveCount(1);
  await expect(page.getByTestId("completed-category")).toContainText("Shooting");
  await expect(page.getByTestId("completed-category")).toContainText(
    "Magic Johnson",
  );
  await expect(page.getByTestId("completed-category")).toContainText("86");
  await expect(page.getByTestId("category-card")).toHaveCount(0);
  await expect(page.getByTestId("available-category")).toHaveCount(0);
  await expect(page.getByTestId("locked-category")).toHaveCount(0);
});

test("player-first selection still works after respins", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("goat-builder-test-random", "first");
  });
  await page.goto("/game");

  await expect(page.getByTestId("player-pool-panel")).toBeVisible();

  await page.getByTestId("team-respin-button").click();
  await page.getByTestId("era-respin-button").click();

  await expect(page.getByTestId("player-card")).toHaveCount(2);
  await expect(page.getByTestId("category-card")).toHaveCount(0);
  await expect(page.getByTestId("available-category")).toHaveCount(0);

  await page.getByTestId("player-card").first().click();

  await expect(page.getByTestId("selected-player-summary")).toBeVisible();
  await expect(page.getByTestId("available-category")).toHaveCount(5);
  await expect(page.getByTestId("team-respin-button")).toBeDisabled();
  await expect(page.getByTestId("era-respin-button")).toBeDisabled();
});
