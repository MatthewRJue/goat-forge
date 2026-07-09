import { expect, test, type Page } from "@playwright/test";

async function installAnimatedDeterministicGame(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("goat-builder-test-random", "first");
    window.localStorage.setItem("goat-builder-test-spin-animation-ms", "900");
  });
}

test("start game shows a generating spin state before revealing team and era", async ({
  page,
}) => {
  await installAnimatedDeterministicGame(page);
  await page.goto("/");

  await page.getByTestId("start-game-button").click();

  const animationState = page.getByTestId("spin-animation-state");

  await expect(animationState).toHaveAttribute("data-animation-state", "round");
  await expect(page.getByRole("dialog", { name: "Spin result" })).toBeVisible();
  await expect(page.getByTestId("spin-animation-dialog")).toHaveAttribute(
    "data-animation-state",
    "round",
  );
  await expect(page.getByTestId("spin-animation-team-wheel")).toContainText(
    "LAL",
  );
  await expect(page.getByTestId("spin-animation-era-wheel")).toContainText(
    "1980s",
  );
  await expect(page.getByTestId("team-display")).toHaveAttribute(
    "data-animation-state",
    "generating",
  );
  await expect(page.getByTestId("era-display")).toHaveAttribute(
    "data-animation-state",
    "generating",
  );

  await expect(animationState).toHaveAttribute("data-animation-state", "settled");
  await expect(page.getByTestId("spin-animation-dialog")).toBeHidden();
  await expect(page.getByTestId("player-pool-panel")).toBeVisible();
  await expect(page.getByTestId("team-display")).not.toContainText("Generating");
  await expect(page.getByTestId("era-display")).not.toContainText("Generating");
});

test("team and era respins animate and block duplicate spin actions", async ({
  page,
}) => {
  await installAnimatedDeterministicGame(page);
  await page.goto("/game");

  const animationState = page.getByTestId("spin-animation-state");
  const teamRespinButton = page.getByTestId("team-respin-button");
  const eraRespinButton = page.getByTestId("era-respin-button");

  await expect(animationState).toHaveAttribute("data-animation-state", "settled");
  await expect(page.getByTestId("player-card").first()).toBeVisible();

  await teamRespinButton.click();

  await expect(animationState).toHaveAttribute("data-animation-state", "team");
  await expect(page.getByRole("dialog", { name: "Spin result" })).toBeVisible();
  await expect(page.getByTestId("spin-animation-dialog")).toHaveAttribute(
    "data-animation-state",
    "team",
  );
  await expect(page.getByTestId("spin-animation-team-wheel")).toContainText(
    "CHI",
  );
  await expect(page.getByTestId("spin-animation-era-wheel")).toContainText(
    "1980s",
  );
  await expect(page.getByTestId("team-display")).toHaveAttribute(
    "data-animation-state",
    "generating",
  );
  await expect(teamRespinButton).toBeDisabled();
  await expect(eraRespinButton).toBeDisabled();

  await expect(animationState).toHaveAttribute("data-animation-state", "settled");
  await expect(page.getByTestId("spin-animation-dialog")).toBeHidden();
  await expect(teamRespinButton).toBeDisabled();
  await expect(teamRespinButton).toContainText("Used R1");
  await expect(eraRespinButton).toBeEnabled();

  await eraRespinButton.click();

  await expect(animationState).toHaveAttribute("data-animation-state", "era");
  await expect(page.getByRole("dialog", { name: "Spin result" })).toBeVisible();
  await expect(page.getByTestId("spin-animation-dialog")).toHaveAttribute(
    "data-animation-state",
    "era",
  );
  await expect(page.getByTestId("spin-animation-team-wheel")).toContainText(
    "CHI",
  );
  await expect(page.getByTestId("spin-animation-era-wheel")).toContainText(
    "1990s",
  );
  await expect(page.getByTestId("era-display")).toHaveAttribute(
    "data-animation-state",
    "generating",
  );
  await expect(teamRespinButton).toBeDisabled();
  await expect(eraRespinButton).toBeDisabled();

  await expect(animationState).toHaveAttribute("data-animation-state", "settled");
  await expect(page.getByTestId("spin-animation-dialog")).toBeHidden();
  await expect(eraRespinButton).toContainText("Used R1");
  await expect(page.getByTestId("player-card").first()).toBeVisible();
});

test("reduced-motion users get a non-moving generating state", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await installAnimatedDeterministicGame(page);
  await page.goto("/game");

  const animationState = page.getByTestId("spin-animation-state");
  await expect(animationState).toHaveAttribute("data-motion-mode", "reduced");
  await expect(animationState).toHaveAttribute("data-animation-state", "round");
  await expect(page.getByTestId("spin-animation-dialog")).toHaveAttribute(
    "data-motion-mode",
    "reduced",
  );
  await expect(page.getByRole("dialog", { name: "Spin result" })).toBeVisible();
  await expect(page.getByTestId("spin-animation-team-wheel")).toContainText(
    "LAL",
  );
  await expect(page.getByTestId("spin-animation-era-wheel")).toContainText(
    "1980s",
  );
  await expect(page.getByTestId("team-display")).toHaveAttribute(
    "data-animation-state",
    "generating",
  );
  await expect
    .poll(async () =>
      page
        .getByTestId("spin-animation-team-wheel")
        .locator(".spin-wheel-value")
        .evaluate((element) => getComputedStyle(element).animationName),
    )
    .toBe("none");

  await expect(animationState).toHaveAttribute("data-animation-state", "settled");
  await expect(page.getByTestId("spin-animation-dialog")).toBeHidden();
  await expect(page.getByTestId("player-pool-panel")).toBeVisible();
});

test("empty-pool spin again shows the spin animation before replacing results", async ({
  page,
}) => {
  await installAnimatedDeterministicGame(page);
  await page.goto("/game");

  const animationState = page.getByTestId("spin-animation-state");

  await expect(animationState).toHaveAttribute("data-animation-state", "settled");
  await expect(page.getByTestId("player-card").first()).toBeVisible();

  await page.getByTestId("team-respin-button").click();
  await expect(animationState).toHaveAttribute("data-animation-state", "settled");
  await expect(page.getByTestId("player-pool-empty")).toBeVisible();

  await page.getByRole("button", { name: "Spin Again" }).click();

  await expect(animationState).toHaveAttribute("data-animation-state", "round");
  await expect(page.getByRole("dialog", { name: "Spin result" })).toBeVisible();
  await expect(page.getByTestId("spin-animation-dialog")).toHaveAttribute(
    "data-animation-state",
    "round",
  );
  await expect(page.getByTestId("spin-animation-team-wheel")).toContainText(
    "LAL",
  );
  await expect(page.getByTestId("spin-animation-era-wheel")).toContainText(
    "1980s",
  );
  await expect(page.getByTestId("team-display")).toHaveAttribute(
    "data-animation-state",
    "generating",
  );
  await expect(page.getByTestId("era-display")).toHaveAttribute(
    "data-animation-state",
    "generating",
  );
  await expect(page.getByTestId("player-pool-loading")).toBeVisible();

  await expect(animationState).toHaveAttribute("data-animation-state", "settled");
  await expect(page.getByTestId("spin-animation-dialog")).toBeHidden();
  await expect(page.getByTestId("player-card").first()).toBeVisible();
  await expect(page.getByTestId("player-pool-empty")).toBeHidden();
});
