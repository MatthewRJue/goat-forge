import { createStartedGameState } from "@/lib/game/game-state";
import { applySelectedCategory, selectPlayer } from "@/lib/game/select-player";
import type { RandomFn } from "@/lib/game/random";
import { applyEraRespin, applyTeamRespin } from "@/lib/game/respins";
import { createRoundSpin } from "@/lib/game/spin-round";
import type {
  EraOption,
  GameState,
  PlayerOption,
  TeamOption,
} from "@/lib/game/types";

export type GameAction =
  | {
      type: "START_GAME";
    }
  | {
      type: "SPIN_ROUND";
      teams: readonly TeamOption[];
      eras: readonly EraOption[];
      random: RandomFn;
    }
  | {
      type: "USE_TEAM_RESPIN";
      teams: readonly TeamOption[];
      random: RandomFn;
    }
  | {
      type: "USE_ERA_RESPIN";
      eras: readonly EraOption[];
      random: RandomFn;
    }
  | {
      type: "SELECT_CATEGORY";
      category: AttributeCategory;
    }
  | {
      type: "SELECT_PLAYER";
      player: PlayerOption;
    }
  | {
      type: "SPIN_AGAIN_FOR_EMPTY_POOL";
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
        status: "selectingPlayer",
        originalTeam: result.spin.originalTeam,
        originalEra: result.spin.originalEra,
        currentTeam: result.spin.currentTeam,
        currentEra: result.spin.currentEra,
        selectedPlayerVersion: null,
        selectedCategory: null,
        spinError: null,
      };
    }
    case "USE_TEAM_RESPIN":
      return applyTeamRespin({
        state,
        teams: action.teams,
        random: action.random,
      });
    case "USE_ERA_RESPIN":
      return applyEraRespin({
        state,
        eras: action.eras,
        random: action.random,
      });
    case "SELECT_CATEGORY":
      return applySelectedCategory({ state, category: action.category });
    case "SELECT_PLAYER":
      return selectPlayer({ state, player: action.player });
    case "SPIN_AGAIN_FOR_EMPTY_POOL":
      return spinAgainForEmptyPool(state, action.teams, action.eras, action.random);
    default:
      return state;
  }
}

function spinAgainForEmptyPool(
  state: GameState,
  teams: readonly TeamOption[],
  eras: readonly EraOption[],
  random: RandomFn,
): GameState {
  if (state.status !== "selectingPlayer") {
    return state;
  }

  const result = createRoundSpin({
    teams,
    eras,
    random,
  });

  if (!result.ok) {
    return {
      ...state,
      spinError: {
        message: result.message,
      },
    };
  }

  return {
    ...state,
    status: "selectingPlayer",
    originalTeam: result.spin.originalTeam,
    originalEra: result.spin.originalEra,
    currentTeam: result.spin.currentTeam,
    currentEra: result.spin.currentEra,
    selectedPlayerVersion: null,
    spinError: null,
  };
}
