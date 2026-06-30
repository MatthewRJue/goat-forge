import type { GameRank } from "@/lib/game/types";

export type RankThreshold = {
  minimumScore: number;
  rank: GameRank;
};

export const MVP_RANK_THRESHOLDS = [
  {
    minimumScore: 490,
    rank: "GOAT",
  },
  {
    minimumScore: 475,
    rank: "Hall of Fame",
  },
  {
    minimumScore: 460,
    rank: "All-Time Great",
  },
  {
    minimumScore: 440,
    rank: "All-Star",
  },
  {
    minimumScore: 420,
    rank: "Starter",
  },
] as const satisfies readonly RankThreshold[];

export const MVP_FALLBACK_RANK: GameRank = "Role Player";
