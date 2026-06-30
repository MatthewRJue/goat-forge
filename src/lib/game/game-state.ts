import type { AttributeCategory, GameState, RespinState } from "@/lib/game/types";

export const MVP_TOTAL_ROUNDS = 5;

export const MVP_CATEGORIES = [
  "athleticism",
  "shooting",
  "finishing",
  "playmaking",
  "defense",
] as const satisfies readonly AttributeCategory[];

const initialRespins = (): RespinState => ({
  teamRespinAvailable: true,
  eraRespinAvailable: true,
  teamRespinUsedRound: null,
  eraRespinUsedRound: null,
});

const baseGameState = (): Omit<GameState, "status" | "currentRound"> => ({
  totalRounds: MVP_TOTAL_ROUNDS,
  originalTeam: null,
  originalEra: null,
  currentTeam: null,
  currentEra: null,
  selectedCategory: null,
  availableCategories: [...MVP_CATEGORIES],
  completedCategories: [],
  usedPlayerVersionIds: [],
  respins: initialRespins(),
  roundHistory: [],
  spinError: null,
  finalScore: null,
  finalRank: null,
});

export function createInitialGameState(): GameState {
  return {
    status: "idle",
    currentRound: 0,
    ...baseGameState(),
  };
}

export function createStartedGameState(): GameState {
  return {
    status: "spinning",
    currentRound: 1,
    ...baseGameState(),
  };
}
