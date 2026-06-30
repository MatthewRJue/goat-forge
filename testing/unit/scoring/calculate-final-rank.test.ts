import { describe, expect, it } from "vitest";

import { calculateFinalRank } from "@/lib/scoring/calculate-final-rank";

describe("calculate final rank", () => {
  it.each([
    [490, "GOAT"],
    [500, "GOAT"],
    [489, "Hall of Fame"],
    [475, "Hall of Fame"],
    [474, "All-Time Great"],
    [460, "All-Time Great"],
    [459, "All-Star"],
    [440, "All-Star"],
    [439, "Starter"],
    [420, "Starter"],
    [419, "Role Player"],
    [0, "Role Player"],
  ] as const)("ranks a score of %s as %s", (score, expectedRank) => {
    expect(calculateFinalRank(score)).toBe(expectedRank);
  });
});
