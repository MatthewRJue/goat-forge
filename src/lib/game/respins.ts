import { selectRandomItem, type RandomFn } from "@/lib/game/random";
import type { EraOption, GameState, TeamOption } from "@/lib/game/types";

type UseTeamRespinInput = {
  state: GameState;
  teams: readonly TeamOption[];
  random: RandomFn;
};

type UseEraRespinInput = {
  state: GameState;
  eras: readonly EraOption[];
  random: RandomFn;
};

export function applyTeamRespin({
  state,
  teams,
  random,
}: UseTeamRespinInput): GameState {
  if (
    state.status !== "selectingCategory" ||
    !state.respins.teamRespinAvailable ||
    !state.currentTeam ||
    !state.currentEra
  ) {
    return state;
  }

  const selection = selectRandomItem(teams, random);

  if (!selection.ok) {
    return {
      ...state,
      spinError: {
        message: "No teams are available. Add team data before using a team respin.",
      },
    };
  }

  return {
    ...state,
    currentTeam: selection.item,
    respins: {
      ...state.respins,
      teamRespinAvailable: false,
      teamRespinUsedRound: state.currentRound,
    },
    spinError: null,
  };
}

export function applyEraRespin({
  state,
  eras,
  random,
}: UseEraRespinInput): GameState {
  if (
    state.status !== "selectingCategory" ||
    !state.respins.eraRespinAvailable ||
    !state.currentTeam ||
    !state.currentEra
  ) {
    return state;
  }

  const selection = selectRandomItem(eras, random);

  if (!selection.ok) {
    return {
      ...state,
      spinError: {
        message: "No eras are available. Add era data before using an era respin.",
      },
    };
  }

  return {
    ...state,
    currentEra: selection.item,
    respins: {
      ...state.respins,
      eraRespinAvailable: false,
      eraRespinUsedRound: state.currentRound,
    },
    spinError: null,
  };
}
