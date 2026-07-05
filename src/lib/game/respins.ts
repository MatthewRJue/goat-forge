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
    (state.status !== "selectingPlayer" && state.status !== "selectingCategory") ||
    !state.respins.teamRespinAvailable ||
    !state.currentTeam ||
    !state.currentEra
  ) {
    return state;
  }

  const alternateTeams = teams.filter((team) => team.id !== state.currentTeam?.id);
  const selection = selectRandomItem(alternateTeams, random);

  if (!selection.ok) {
    return {
      ...state,
      spinError: {
        message:
          "No alternate teams are available. Add more team data before using a team respin.",
      },
    };
  }

  return {
    ...state,
    status: "selectingPlayer",
    currentTeam: selection.item,
    selectedPlayerVersion: null,
    selectedCategory: null,
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
    (state.status !== "selectingPlayer" && state.status !== "selectingCategory") ||
    !state.respins.eraRespinAvailable ||
    !state.currentTeam ||
    !state.currentEra
  ) {
    return state;
  }

  const alternateEras = eras.filter((era) => era.id !== state.currentEra?.id);
  const selection = selectRandomItem(alternateEras, random);

  if (!selection.ok) {
    return {
      ...state,
      spinError: {
        message:
          "No alternate eras are available. Add more era data before using an era respin.",
      },
    };
  }

  return {
    ...state,
    status: "selectingPlayer",
    currentEra: selection.item,
    selectedPlayerVersion: null,
    selectedCategory: null,
    respins: {
      ...state.respins,
      eraRespinAvailable: false,
      eraRespinUsedRound: state.currentRound,
    },
    spinError: null,
  };
}
