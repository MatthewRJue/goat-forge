import { getPlayerOptionRating } from "@/lib/game/player-pool";
import type { GameState, PlayerOption } from "@/lib/game/types";

type SelectPlayerInput = {
  state: GameState;
  player: PlayerOption;
};

export function selectPlayer({ state, player }: SelectPlayerInput): GameState {
  if (
    state.status !== "selectingPlayer" ||
    !state.selectedCategory ||
    !state.originalTeam ||
    !state.originalEra ||
    !state.currentTeam ||
    !state.currentEra ||
    player.teamId !== state.currentTeam.id ||
    player.eraId !== state.currentEra.id ||
    state.usedPlayerVersionIds.includes(player.playerVersionId)
  ) {
    return state;
  }

  const rating = getPlayerOptionRating(player, state.selectedCategory);
  const teamRespinUsed =
    state.respins.teamRespinUsedRound === state.currentRound;
  const eraRespinUsed = state.respins.eraRespinUsedRound === state.currentRound;
  const completedCategories = [
    ...state.completedCategories,
    {
      category: state.selectedCategory,
      playerVersionId: player.playerVersionId,
      playerName: player.name,
      playerVersionLabel: player.versionLabel,
      teamName: state.currentTeam.name,
      eraLabel: state.currentEra.label,
      rating,
    },
  ];
  const availableCategories = state.availableCategories.filter(
    (category) => category !== state.selectedCategory,
  );
  const usedPlayerVersionIds = [
    ...state.usedPlayerVersionIds,
    player.playerVersionId,
  ];
  const roundHistory = [
    ...state.roundHistory,
    {
      roundNumber: state.currentRound,
      originalTeam: state.originalTeam,
      originalEra: state.originalEra,
      finalTeam: state.currentTeam,
      finalEra: state.currentEra,
      teamRespinUsed,
      eraRespinUsed,
      selectedCategory: state.selectedCategory,
      selectedPlayerVersionId: player.playerVersionId,
      selectedPlayerName: player.name,
      selectedPlayerVersionLabel: player.versionLabel,
      ratingApplied: rating,
    },
  ];
  const gameComplete =
    completedCategories.length >= state.totalRounds ||
    availableCategories.length === 0;

  return {
    ...state,
    status: gameComplete ? "gameComplete" : "spinning",
    currentRound: gameComplete ? state.currentRound : state.currentRound + 1,
    originalTeam: null,
    originalEra: null,
    currentTeam: null,
    currentEra: null,
    selectedCategory: null,
    availableCategories,
    completedCategories,
    usedPlayerVersionIds,
    roundHistory,
    spinError: null,
  };
}
