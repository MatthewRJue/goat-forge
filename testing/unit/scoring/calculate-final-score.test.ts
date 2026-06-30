import { describe, expect, it } from "vitest";

import { calculateFinalScore } from "@/lib/scoring/calculate-final-score";
import type { AttributeCategory, CompletedCategory } from "@/lib/game/types";

describe("calculate final score", () => {
  it("returns null before all categories are complete", () => {
    const score = calculateFinalScore({
      completedCategories: [
        createCompletedCategory("athleticism", 99),
        createCompletedCategory("shooting", 95),
        createCompletedCategory("finishing", 98),
        createCompletedCategory("playmaking", 94),
      ],
      totalCategories: 5,
    });

    expect(score).toBeNull();
  });

  it("sums all five completed category ratings", () => {
    const score = calculateFinalScore({
      completedCategories: [
        createCompletedCategory("athleticism", 99),
        createCompletedCategory("shooting", 95),
        createCompletedCategory("finishing", 98),
        createCompletedCategory("playmaking", 94),
        createCompletedCategory("defense", 90),
      ],
      totalCategories: 5,
    });

    expect(score).toBe(476);
  });

  it("sums completed category ratings regardless of completion order", () => {
    const score = calculateFinalScore({
      completedCategories: [
        createCompletedCategory("defense", 90),
        createCompletedCategory("playmaking", 94),
        createCompletedCategory("athleticism", 99),
        createCompletedCategory("finishing", 98),
        createCompletedCategory("shooting", 95),
      ],
      totalCategories: 5,
    });

    expect(score).toBe(476);
  });
});

function createCompletedCategory(
  category: AttributeCategory,
  rating: number,
): CompletedCategory {
  return {
    category,
    playerVersionId: `${category}-version`,
    playerName: "Example Player",
    playerVersionLabel: "Example Version",
    teamName: "Example Team",
    eraLabel: "Example Era",
    rating,
  };
}
