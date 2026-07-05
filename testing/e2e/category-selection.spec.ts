import { expect, test } from "@playwright/test";

test("selecting a player reveals available attribute categories", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("goat-builder-test-random", "first");
  });
  await page.goto("/game");

  await expect(page.getByTestId("player-pool-panel")).toBeVisible();
  const magicCard = page
    .getByTestId("player-card")
    .filter({ hasText: "Magic Johnson" });
  await expect(magicCard).toBeVisible();
  await expect(magicCard).toContainText("Shooting");
  await expect(magicCard).toContainText("86");
  await expect(
    page.getByRole("heading", { name: "Attribute Choice" }),
  ).toBeHidden();
  await expect(page.getByTestId("available-category")).toHaveCount(0);
  await expect(page.getByTestId("locked-category")).toHaveCount(5);

  const firstPlayerCard = magicCard;
  const secondPlayerCard = page
    .getByTestId("player-card")
    .filter({ hasText: "Kareem Abdul-Jabbar" });

  await firstPlayerCard.click();

  await expect(firstPlayerCard).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("heading", { name: "Attribute Choice" }),
  ).toBeHidden();
  await expect(page.getByTestId("player-pool-panel")).toBeVisible();
  await expect(page.getByTestId("available-category")).toHaveCount(5);

  await secondPlayerCard.click();

  await expect(firstPlayerCard).toHaveAttribute("aria-pressed", "false");
  await expect(secondPlayerCard).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("player-pool-panel")).toBeVisible();
  await expect(page.getByTestId("available-category")).toHaveCount(5);
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
  await expect(page.getByTestId("player-pool-panel")).toBeVisible();
  await expect(page.getByTestId("completed-category")).toHaveCount(1);
  await expect(page.getByTestId("completed-category")).toContainText("Shooting");
  await expect(page.getByTestId("completed-category")).toContainText(
    "Magic Johnson",
  );
  await expect(page.getByTestId("completed-category")).toContainText("86");
  await expect(page.getByTestId("available-category")).toHaveCount(0);
  await expect(page.getByTestId("locked-category")).toHaveCount(4);
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
  await expect(page.getByTestId("available-category")).toHaveCount(0);
  await expect(page.getByTestId("locked-category")).toHaveCount(5);

  await page.getByTestId("player-card").first().click();

  await expect(page.getByTestId("player-card").first()).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByTestId("player-pool-panel")).toBeVisible();
  await expect(page.getByTestId("available-category")).toHaveCount(5);
  await expect(page.getByTestId("team-respin-button")).toBeDisabled();
  await expect(page.getByTestId("era-respin-button")).toBeDisabled();
});

test("respins remain available after player selection until an attribute is applied", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("goat-builder-test-random", "first");
  });
  await page.goto("/game");

  const firstPlayerCard = page.getByTestId("player-card").first();

  await expect(firstPlayerCard).toBeVisible();
  await firstPlayerCard.click();

  await expect(firstPlayerCard).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("available-category")).toHaveCount(5);

  await page.getByTestId("team-respin-button").click();

  await expect(page.getByTestId("team-respin-button")).toBeDisabled();
  await expect(page.getByTestId("era-respin-button")).toBeEnabled();
  await expect(page.getByTestId("player-pool-panel")).toBeVisible();
  await expect(page.getByTestId("available-category")).toHaveCount(0);
  await expect(page.getByTestId("locked-category")).toHaveCount(5);

  await page.getByTestId("era-respin-button").click();

  await expect(page.getByTestId("era-respin-button")).toBeDisabled();
  await expect(page.getByTestId("player-pool-panel")).toBeVisible();
  await expect(page.getByTestId("player-card").first()).toHaveAttribute(
    "aria-pressed",
    "false",
  );

  await page.getByTestId("player-card").first().click();

  await expect(page.getByTestId("player-card").first()).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByTestId("available-category")).toHaveCount(5);
});
