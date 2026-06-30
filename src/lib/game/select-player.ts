import { getPlayerOptionRating } from "@/lib/game/player-pool";
import type { AttributeCategory, GameState, PlayerOption } from "@/lib/game/types";

type SelectPlayerInput = {
  state: GameState;
  player: PlayerOption;
};

export function selectPlayer({ state, player }: SelectPlayerInput): GameState {
  if (
    state.status !== "selectingPlayer" ||
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

  return {
    ...state,
    status: "selectingCategory",
    selectedPlayerVersion: player,
    selectedCategory: null,
    spinError: null,
  };
}

type ApplySelectedCategoryInput = {
  state: GameState;
  category: AttributeCategory;
};

export function applySelectedCategory({
  state,
  category,
}: ApplySelectedCategoryInput): GameState {
  const completedCategory = state.completedCategories.some(
    (completed) => completed.category === category,
  );

  if (
    state.status !== "selectingCategory" ||
    !state.selectedPlayerVersion ||
    !state.originalTeam ||
    !state.originalEra ||
    !state.currentTeam ||
    !state.currentEra ||
    completedCategory ||
    !state.availableCategories.includes(category)
  ) {
    return state;
  }

  const player = state.selectedPlayerVersion;
  const rating = getPlayerOptionRating(player, category);
  const teamRespinUsed =
    state.respins.teamRespinUsedRound === state.currentRound;
  const eraRespinUsed = state.respins.eraRespinUsedRound === state.currentRound;
  const completedCategories = [
    ...state.completedCategories,
    {
      category,
      playerVersionId: player.playerVersionId,
      playerName: player.name,
      playerVersionLabel: player.versionLabel,
      teamName: state.currentTeam.name,
      eraLabel: state.currentEra.label,
      rating,
    },
  ];
  const availableCategories = state.availableCategories.filter(
    (availableCategory) => availableCategory !== category,
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
      selectedCategory: category,
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
    selectedPlayerVersion: null,
    selectedCategory: null,
    availableCategories,
    completedCategories,
    usedPlayerVersionIds,
    roundHistory,
    spinError: null,
  };
}
