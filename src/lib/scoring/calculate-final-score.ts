import type { CompletedCategory } from "@/lib/game/types";

type CalculateFinalScoreInput = {
  completedCategories: readonly CompletedCategory[];
  totalCategories: number;
};

export function calculateFinalScore({
  completedCategories,
  totalCategories,
}: CalculateFinalScoreInput): number | null {
  if (completedCategories.length < totalCategories) {
    return null;
  }

  return completedCategories.reduce((total, item) => total + item.rating, 0);
}
