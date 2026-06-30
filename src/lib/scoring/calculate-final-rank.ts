import type { GameRank } from "@/lib/game/types";
import {
  MVP_FALLBACK_RANK,
  MVP_RANK_THRESHOLDS,
} from "@/lib/scoring/rank-thresholds";

export function calculateFinalRank(score: number): GameRank {
  return (
    MVP_RANK_THRESHOLDS.find((threshold) => score >= threshold.minimumScore)
      ?.rank ?? MVP_FALLBACK_RANK
  );
}
