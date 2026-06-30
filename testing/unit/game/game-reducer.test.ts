import { describe, expect, it } from "vitest";

import { gameReducer } from "@/lib/game/game-reducer";
import {
  MVP_CATEGORIES,
  MVP_TOTAL_ROUNDS,
  createInitialGameState,
  createStartedGameState,
} from "@/lib/game/game-state";
import type {
  EraOption,
  GameState,
  PlayerOption,
  TeamOption,
} from "@/lib/game/types";

const teams: TeamOption[] = [
  { id: "team-1", name: "Example Team", abbreviation: "EXT" },
  { id: "team-2", name: "Last Team", abbreviation: "LST" },
];

const eras: EraOption[] = [
  { id: "era-1", label: "1980s", startYear: 1980, endYear: 1989 },
  { id: "era-2", label: "2020s", startYear: 2020, endYear: 2029 },
];

const player: PlayerOption = {
  playerVersionId: "version-1",
  playerId: "player-1",
  name: "Example Player",
  versionLabel: "1980s Example Player",
  teamId: "team-1",
  eraId: "era-1",
  imageUrl: null,
  attributes: {
    athleticism: 91,
    shooting: 84,
    finishing: 96,
    playmaking: 88,
    defense: 93,
  },
};

describe("game reducer", () => {
  it("creates the idle initial state before a game starts", () => {
    const state = createInitialGameState();

    expect(state.status).toBe("idle");
    expect(state.currentRound).toBe(0);
    expect(state.totalRounds).toBe(MVP_TOTAL_ROUNDS);
    expect(state.availableCategories).toEqual(MVP_CATEGORIES);
    expect(state.completedCategories).toEqual([]);
    expect(state.usedPlayerVersionIds).toEqual([]);
    expect(state.roundHistory).toEqual([]);
    expect(state.finalScore).toBeNull();
    expect(state.finalRank).toBeNull();
  });

  it("starts a clean five-round game", () => {
    const state = createStartedGameState();

    expectStartedState(state);
  });

  it("moves from idle into the first round flow when starting a game", () => {
    const state = gameReducer(createInitialGameState(), { type: "START_GAME" });

    expectStartedState(state);
  });

  it("resets previous in-memory game data when starting a new game", () => {
    const dirtyState: GameState = {
      ...createStartedGameState(),
      status: "gameComplete",
      currentRound: 5,
      originalTeam: teams[0],
      originalEra: eras[0],
      currentTeam: teams[0],
      currentEra: eras[0],
      availableCategories: ["defense"],
      completedCategories: [
        {
          category: "athleticism",
          playerVersionId: "version-1",
          playerName: "Example Player",
          playerVersionLabel: "2010s Example",
          teamName: "Example Team",
          eraLabel: "2010s",
          rating: 99,
        },
      ],
      usedPlayerVersionIds: ["version-1"],
      respins: {
        teamRespinAvailable: false,
        eraRespinAvailable: false,
        teamRespinUsedRound: 1,
        eraRespinUsedRound: 1,
      },
      roundHistory: [
        {
          roundNumber: 1,
          originalTeam: {
            id: "team-1",
            name: "Example Team",
            abbreviation: "EXT",
          },
          originalEra: {
            id: "era-1",
            label: "2010s",
            startYear: 2010,
            endYear: 2019,
          },
          finalTeam: {
            id: "team-1",
            name: "Example Team",
            abbreviation: "EXT",
          },
          finalEra: {
            id: "era-1",
            label: "2010s",
            startYear: 2010,
            endYear: 2019,
          },
          teamRespinUsed: false,
          eraRespinUsed: false,
          selectedCategory: "athleticism",
          selectedPlayerVersionId: "version-1",
          selectedPlayerName: "Example Player",
          selectedPlayerVersionLabel: "2010s Example",
          ratingApplied: 99,
        },
      ],
      spinError: {
        message: "Previous spin error.",
      },
      finalScore: 480,
      finalRank: "Hall of Fame",
    };

    const state = gameReducer(dirtyState, { type: "START_GAME" });

    expectStartedState(state);
  });

  it("spins the active round and moves into category selection", () => {
    const state = gameReducer(createStartedGameState(), {
      type: "SPIN_ROUND",
      teams,
      eras,
      random: sequenceRandom(0, 0.999),
    });

    expect(state.status).toBe("selectingCategory");
    expect(state.originalTeam).toEqual(teams[0]);
    expect(state.currentTeam).toEqual(teams[0]);
    expect(state.originalEra).toEqual(eras[1]);
    expect(state.currentEra).toEqual(eras[1]);
    expect(state.spinError).toBeNull();
  });

  it("keeps duplicate team and era spins valid across rounds", () => {
    const repeatedState: GameState = {
      ...createStartedGameState(),
      roundHistory: [
        {
          roundNumber: 1,
          originalTeam: teams[0],
          originalEra: eras[0],
          finalTeam: teams[0],
          finalEra: eras[0],
          teamRespinUsed: false,
          eraRespinUsed: false,
          selectedCategory: "athleticism",
          selectedPlayerVersionId: "version-1",
          selectedPlayerName: "Example Player",
          selectedPlayerVersionLabel: "1980s Example",
          ratingApplied: 99,
        },
      ],
    };

    const state = gameReducer(repeatedState, {
      type: "SPIN_ROUND",
      teams: [teams[0]],
      eras: [eras[0]],
      random: sequenceRandom(0, 0),
    });

    expect(state.status).toBe("selectingCategory");
    expect(state.currentTeam).toEqual(teams[0]);
    expect(state.currentEra).toEqual(eras[0]);
  });

  it("stores a spin error when team data is missing", () => {
    const state = gameReducer(createStartedGameState(), {
      type: "SPIN_ROUND",
      teams: [],
      eras,
      random: sequenceRandom(0),
    });

    expect(state.status).toBe("spinning");
    expect(state.currentTeam).toBeNull();
    expect(state.currentEra).toBeNull();
    expect(state.spinError?.message).toContain("No teams");
  });

  it("uses one team respin and keeps the current era unchanged", () => {
    const spunState = createSelectingCategoryState();

    const state = gameReducer(spunState, {
      type: "USE_TEAM_RESPIN",
      teams,
      random: sequenceRandom(0.999),
    });

    expect(state.currentTeam).toEqual(teams[1]);
    expect(state.currentEra).toEqual(spunState.currentEra);
    expect(state.originalTeam).toEqual(spunState.originalTeam);
    expect(state.originalEra).toEqual(spunState.originalEra);
    expect(state.respins.teamRespinAvailable).toBe(false);
    expect(state.respins.teamRespinUsedRound).toBe(1);
    expect(state.respins.eraRespinAvailable).toBe(true);
    expect(state.respins.eraRespinUsedRound).toBeNull();
    expect(state.status).toBe("selectingCategory");
  });

  it("uses one era respin and keeps the current team unchanged", () => {
    const spunState = createSelectingCategoryState();

    const state = gameReducer(spunState, {
      type: "USE_ERA_RESPIN",
      eras,
      random: sequenceRandom(0.999),
    });

    expect(state.currentTeam).toEqual(spunState.currentTeam);
    expect(state.currentEra).toEqual(eras[1]);
    expect(state.originalTeam).toEqual(spunState.originalTeam);
    expect(state.originalEra).toEqual(spunState.originalEra);
    expect(state.respins.teamRespinAvailable).toBe(true);
    expect(state.respins.teamRespinUsedRound).toBeNull();
    expect(state.respins.eraRespinAvailable).toBe(false);
    expect(state.respins.eraRespinUsedRound).toBe(1);
    expect(state.status).toBe("selectingCategory");
  });

  it("allows both respins during the same round", () => {
    const teamRespunState = gameReducer(createSelectingCategoryState(), {
      type: "USE_TEAM_RESPIN",
      teams,
      random: sequenceRandom(0.999),
    });

    const state = gameReducer(teamRespunState, {
      type: "USE_ERA_RESPIN",
      eras,
      random: sequenceRandom(0.999),
    });

    expect(state.currentTeam).toEqual(teams[1]);
    expect(state.currentEra).toEqual(eras[1]);
    expect(state.respins).toEqual({
      teamRespinAvailable: false,
      eraRespinAvailable: false,
      teamRespinUsedRound: 1,
      eraRespinUsedRound: 1,
    });
    expect(state.status).toBe("selectingCategory");
    expect(state.availableCategories).toEqual(MVP_CATEGORIES);
  });

  it.each(MVP_CATEGORIES)("selects the %s category for player selection", (category) => {
    const spunState = createSelectingCategoryState();

    const state = gameReducer(spunState, {
      type: "SELECT_CATEGORY",
      category,
    });

    expect(state.status).toBe("selectingPlayer");
    expect(state.selectedCategory).toBe(category);
    expect(state.availableCategories).toEqual(MVP_CATEGORIES);
    expect(state.completedCategories).toEqual([]);
    expect(state.roundHistory).toEqual([]);
    expect(state.finalScore).toBeNull();
    expect(state.finalRank).toBeNull();
  });

  it("does not select a category before the round spin completes", () => {
    const spinningState = createStartedGameState();

    const state = gameReducer(spinningState, {
      type: "SELECT_CATEGORY",
      category: "defense",
    });

    expect(state).toEqual(spinningState);
  });

  it("does not select a category that is no longer available", () => {
    const unavailableState: GameState = {
      ...createSelectingCategoryState(),
      availableCategories: ["shooting", "finishing", "playmaking", "defense"],
    };

    const state = gameReducer(unavailableState, {
      type: "SELECT_CATEGORY",
      category: "athleticism",
    });

    expect(state).toEqual(unavailableState);
  });

  it("does not select a completed category", () => {
    const completedState: GameState = {
      ...createSelectingCategoryState(),
      completedCategories: [
        {
          category: "athleticism",
          playerVersionId: "version-1",
          playerName: "Example Player",
          playerVersionLabel: "1980s Example",
          teamName: "Example Team",
          eraLabel: "1980s",
          rating: 96,
        },
      ],
    };

    const state = gameReducer(completedState, {
      type: "SELECT_CATEGORY",
      category: "athleticism",
    });

    expect(state).toEqual(completedState);
  });

  it("does not let invalid category input corrupt game state", () => {
    const spunState = createSelectingCategoryState();

    const state = gameReducer(spunState, {
      type: "SELECT_CATEGORY",
      category: "rebounding" as never,
    });

    expect(state).toEqual(spunState);
  });

  it("does not select another category after player selection starts", () => {
    const selectingPlayerState = gameReducer(createSelectingCategoryState(), {
      type: "SELECT_CATEGORY",
      category: "defense",
    });

    const state = gameReducer(selectingPlayerState, {
      type: "SELECT_CATEGORY",
      category: "shooting",
    });

    expect(state).toEqual(selectingPlayerState);
  });

  it("selects a player and applies the selected category rating", () => {
    const selectingPlayerState = createSelectingPlayerState("defense");

    const state = gameReducer(selectingPlayerState, {
      type: "SELECT_PLAYER",
      player,
    });

    expect(state.status).toBe("roundComplete");
    expect(state.selectedCategory).toBeNull();
    expect(state.availableCategories).toEqual([
      "athleticism",
      "shooting",
      "finishing",
      "playmaking",
    ]);
    expect(state.completedCategories).toEqual([
      {
        category: "defense",
        playerVersionId: "version-1",
        playerName: "Example Player",
        playerVersionLabel: "1980s Example Player",
        teamName: "Example Team",
        eraLabel: "1980s",
        rating: 93,
      },
    ]);
    expect(state.usedPlayerVersionIds).toEqual(["version-1"]);
    expect(state.roundHistory).toEqual([
      {
        roundNumber: 1,
        originalTeam: teams[0],
        originalEra: eras[0],
        finalTeam: teams[0],
        finalEra: eras[0],
        teamRespinUsed: false,
        eraRespinUsed: false,
        selectedCategory: "defense",
        selectedPlayerVersionId: "version-1",
        selectedPlayerName: "Example Player",
        selectedPlayerVersionLabel: "1980s Example Player",
        ratingApplied: 93,
      },
    ]);
  });

  it("uses the rating for the selected category instead of the player total", () => {
    const selectingPlayerState = createSelectingPlayerState("shooting");

    const state = gameReducer(selectingPlayerState, {
      type: "SELECT_PLAYER",
      player,
    });

    expect(state.completedCategories[0]?.rating).toBe(84);
    expect(state.roundHistory[0]?.ratingApplied).toBe(84);
  });

  it("records respin usage in round history when selecting a player", () => {
    const teamRespunState = gameReducer(createSelectingCategoryState(), {
      type: "USE_TEAM_RESPIN",
      teams,
      random: sequenceRandom(0.999),
    });
    const eraRespunState = gameReducer(teamRespunState, {
      type: "USE_ERA_RESPIN",
      eras,
      random: sequenceRandom(0.999),
    });
    const selectingPlayerState = gameReducer(eraRespunState, {
      type: "SELECT_CATEGORY",
      category: "playmaking",
    });
    const respunPlayer: PlayerOption = {
      ...player,
      teamId: "team-2",
      eraId: "era-2",
    };

    const state = gameReducer(selectingPlayerState, {
      type: "SELECT_PLAYER",
      player: respunPlayer,
    });

    expect(state.roundHistory[0]).toMatchObject({
      originalTeam: teams[0],
      originalEra: eras[0],
      finalTeam: teams[1],
      finalEra: eras[1],
      teamRespinUsed: true,
      eraRespinUsed: true,
      selectedCategory: "playmaking",
      ratingApplied: 88,
    });
  });

  it("does not select a player before player selection starts", () => {
    const selectingCategoryState = createSelectingCategoryState();

    const state = gameReducer(selectingCategoryState, {
      type: "SELECT_PLAYER",
      player,
    });

    expect(state).toEqual(selectingCategoryState);
  });

  it("does not select an already used player version", () => {
    const selectingPlayerState: GameState = {
      ...createSelectingPlayerState("defense"),
      usedPlayerVersionIds: ["version-1"],
    };

    const state = gameReducer(selectingPlayerState, {
      type: "SELECT_PLAYER",
      player,
    });

    expect(state).toEqual(selectingPlayerState);
  });

  it("allows a different player version for the same base player", () => {
    const selectingPlayerState: GameState = {
      ...createSelectingPlayerState("defense"),
      usedPlayerVersionIds: ["version-old"],
    };
    const alternateVersionPlayer: PlayerOption = {
      ...player,
      playerVersionId: "version-new",
      playerId: "player-1",
    };

    const state = gameReducer(selectingPlayerState, {
      type: "SELECT_PLAYER",
      player: alternateVersionPlayer,
    });

    expect(state.status).toBe("roundComplete");
    expect(state.usedPlayerVersionIds).toEqual(["version-old", "version-new"]);
  });

  it("does not select a player outside the current team and era pool", () => {
    const selectingPlayerState = createSelectingPlayerState("defense");
    const wrongPoolPlayer: PlayerOption = {
      ...player,
      teamId: "team-2",
    };

    const state = gameReducer(selectingPlayerState, {
      type: "SELECT_PLAYER",
      player: wrongPoolPlayer,
    });

    expect(state).toEqual(selectingPlayerState);
  });

  it("spins again for an empty player pool without consuming respins", () => {
    const selectingPlayerState = gameReducer(createSelectingCategoryState(), {
      type: "SELECT_CATEGORY",
      category: "defense",
    });

    const state = gameReducer(selectingPlayerState, {
      type: "SPIN_AGAIN_FOR_EMPTY_POOL",
      teams,
      eras,
      random: sequenceRandom(0.999, 0.999),
    });

    expect(state.status).toBe("selectingPlayer");
    expect(state.selectedCategory).toBe("defense");
    expect(state.currentTeam).toEqual(teams[1]);
    expect(state.currentEra).toEqual(eras[1]);
    expect(state.respins).toEqual(selectingPlayerState.respins);
    expect(state.usedPlayerVersionIds).toEqual([]);
  });

  it("does not spin again for an empty pool before player selection starts", () => {
    const selectingCategoryState = createSelectingCategoryState();

    const state = gameReducer(selectingCategoryState, {
      type: "SPIN_AGAIN_FOR_EMPTY_POOL",
      teams,
      eras,
      random: sequenceRandom(0.999, 0.999),
    });

    expect(state).toEqual(selectingCategoryState);
  });

  it("does not consume an exhausted team respin again", () => {
    const usedState = gameReducer(createSelectingCategoryState(), {
      type: "USE_TEAM_RESPIN",
      teams,
      random: sequenceRandom(0.999),
    });

    const state = gameReducer(usedState, {
      type: "USE_TEAM_RESPIN",
      teams,
      random: sequenceRandom(0),
    });

    expect(state).toEqual(usedState);
  });

  it("does not consume an exhausted era respin again", () => {
    const usedState = gameReducer(createSelectingCategoryState(), {
      type: "USE_ERA_RESPIN",
      eras,
      random: sequenceRandom(0.999),
    });

    const state = gameReducer(usedState, {
      type: "USE_ERA_RESPIN",
      eras,
      random: sequenceRandom(0),
    });

    expect(state).toEqual(usedState);
  });

  it("does not consume respins outside category selection", () => {
    const spinningState = createStartedGameState();

    const state = gameReducer(spinningState, {
      type: "USE_TEAM_RESPIN",
      teams,
      random: sequenceRandom(0.999),
    });

    expect(state).toEqual(spinningState);
  });

  it("allows a team respin to return the same team", () => {
    const spunState = createSelectingCategoryState();

    const state = gameReducer(spunState, {
      type: "USE_TEAM_RESPIN",
      teams,
      random: sequenceRandom(0),
    });

    expect(state.currentTeam).toEqual(spunState.currentTeam);
    expect(state.respins.teamRespinAvailable).toBe(false);
    expect(state.respins.teamRespinUsedRound).toBe(1);
  });
});

function expectStartedState(state: GameState) {
  expect(state.status).toBe("spinning");
  expect(state.currentRound).toBe(1);
  expect(state.totalRounds).toBe(5);
  expect(state.originalTeam).toBeNull();
  expect(state.originalEra).toBeNull();
  expect(state.currentTeam).toBeNull();
  expect(state.currentEra).toBeNull();
  expect(state.selectedCategory).toBeNull();
  expect(state.availableCategories).toEqual([
    "athleticism",
    "shooting",
    "finishing",
    "playmaking",
    "defense",
  ]);
  expect(state.completedCategories).toEqual([]);
  expect(state.usedPlayerVersionIds).toEqual([]);
  expect(state.respins).toEqual({
    teamRespinAvailable: true,
    eraRespinAvailable: true,
    teamRespinUsedRound: null,
    eraRespinUsedRound: null,
  });
  expect(state.roundHistory).toEqual([]);
  expect(state.spinError).toBeNull();
  expect(state.finalScore).toBeNull();
  expect(state.finalRank).toBeNull();
}

function createSelectingCategoryState() {
  return gameReducer(createStartedGameState(), {
    type: "SPIN_ROUND",
    teams,
    eras,
    random: sequenceRandom(0, 0),
  });
}

function createSelectingPlayerState(category: NonNullable<GameState["selectedCategory"]>) {
  return gameReducer(createSelectingCategoryState(), {
    type: "SELECT_CATEGORY",
    category,
  });
}

function sequenceRandom(...values: number[]) {
  let index = 0;

  return () => values[index++] ?? 0;
}
