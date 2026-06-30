import { expect, test } from "@playwright/test";

test("respins are visible and can each be used once", async ({ page }) => {
  await page.goto("/game");

  await expect(page.getByText("selectingCategory")).toBeVisible();

  const teamRespinButton = page.getByTestId("team-respin-button");
  const eraRespinButton = page.getByTestId("era-respin-button");

  await expect(teamRespinButton).toBeVisible();
  await expect(teamRespinButton).toBeEnabled();
  await expect(teamRespinButton).toContainText("Available");

  await expect(eraRespinButton).toBeVisible();
  await expect(eraRespinButton).toBeEnabled();
  await expect(eraRespinButton).toContainText("Available");

  await teamRespinButton.click();

  await expect(teamRespinButton).toBeDisabled();
  await expect(teamRespinButton).toContainText("Used R1");
  await expect(eraRespinButton).toBeEnabled();

  await eraRespinButton.click();

  await expect(eraRespinButton).toBeDisabled();
  await expect(eraRespinButton).toContainText("Used R1");
  await expect(page.getByText("selectingCategory")).toBeVisible();
  await expect(page.getByTestId("available-category")).toHaveCount(5);
});

test("both respins can be used during the same round", async ({ page }) => {
  await page.goto("/game");

  await expect(page.getByText("selectingCategory")).toBeVisible();

  await page.getByTestId("team-respin-button").click();
  await page.getByTestId("era-respin-button").click();

  await expect(page.getByTestId("team-respin-button")).toBeDisabled();
  await expect(page.getByTestId("era-respin-button")).toBeDisabled();
  await expect(page.getByText("selectingCategory")).toBeVisible();
  await expect(page.getByTestId("available-category")).toHaveCount(5);
});
