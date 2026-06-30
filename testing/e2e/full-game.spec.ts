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
].join(",");

test("player can complete a five-round game without creating a sixth round", async ({
  page,
}) => {
  await page.addInitScript((sequence) => {
    window.localStorage.setItem("goat-builder-test-random-sequence", sequence);
  }, deterministicFiveRoundSequence);
  await page.goto("/game");

  const categories = [
    "Athleticism",
    "Shooting",
    "Finishing",
    "Playmaking",
    "Defense",
  ];

  for (const [index, category] of categories.entries()) {
    await expect(
      page.getByRole("heading", { name: `Round ${index + 1} of 5` }),
    ).toBeVisible();
    await expect(page.getByText("selectingPlayer")).toBeVisible();
    await expect(page.getByTestId("player-card").first()).toBeVisible();

    await page.getByTestId("player-card").first().click();

    await expect(page.getByText("selectingCategory")).toBeVisible();
    await expect(page.getByTestId("available-category")).toHaveCount(
      categories.length - index,
    );

    await page.getByRole("button", { name: new RegExp(category) }).click();

    await expect(page.getByTestId("completed-category")).toHaveCount(index + 1);
  }

  await expect(page.getByText("gameComplete")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Round 5 of 5" })).toBeVisible();
  await expect(page.getByTestId("completed-category")).toHaveCount(5);
  await expect(page.getByTestId("available-category")).toHaveCount(0);
  await expect(page.getByTestId("locked-category")).toHaveCount(5);
  await expect(page.getByText("Round history")).toBeVisible();
});
