import { createStartedGameState } from "@/lib/game/game-state";
import type { GameState } from "@/lib/game/types";

export type GameAction = {
  type: "START_GAME";
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME":
      return createStartedGameState();
    default:
      return state;
  }
}
