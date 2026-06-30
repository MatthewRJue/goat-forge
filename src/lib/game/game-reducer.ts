import { createStartedGameState } from "@/lib/game/game-state";
import type { RandomFn } from "@/lib/game/random";
import { createRoundSpin } from "@/lib/game/spin-round";
import type { EraOption, GameState, TeamOption } from "@/lib/game/types";

export type GameAction =
  | {
      type: "START_GAME";
    }
  | {
      type: "SPIN_ROUND";
      teams: readonly TeamOption[];
      eras: readonly EraOption[];
      random: RandomFn;
    };

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME":
      return createStartedGameState();
    case "SPIN_ROUND": {
      const result = createRoundSpin({
        teams: action.teams,
        eras: action.eras,
        random: action.random,
      });

      if (!result.ok) {
        return {
          ...state,
          originalTeam: null,
          originalEra: null,
          currentTeam: null,
          currentEra: null,
          status: "spinning",
          spinError: {
            message: result.message,
          },
        };
      }

      return {
        ...state,
        status: "selectingCategory",
        originalTeam: result.spin.originalTeam,
        originalEra: result.spin.originalEra,
        currentTeam: result.spin.currentTeam,
        currentEra: result.spin.currentEra,
        spinError: null,
      };
    }
    default:
      return state;
  }
}
