import { describe, expect, it } from "vitest";

import { gameReducer } from "@/lib/game/game-reducer";
import {
  MVP_CATEGORIES,
  MVP_TOTAL_ROUNDS,
  createInitialGameState,
  createStartedGameState,
} from "@/lib/game/game-state";
import type {
  AttributeCategory,
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
  position: "SF",
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
    expect(state.selectedPlayerVersion).toBeNull();
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
      selectedPlayerVersion: player,
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
          originalTeam: teams[0],
          originalEra: eras[0],
          finalTeam: teams[0],
          finalEra: eras[0],
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

  it("spins the active round and moves directly into player selection", () => {
    const state = gameReducer(createStartedGameState(), {
      type: "SPIN_ROUND",
      teams,
      eras,
      random: sequenceRandom(0, 0.999),
    });

    expect(state.status).toBe("selectingPlayer");
    expect(state.originalTeam).toEqual(teams[0]);
    expect(state.currentTeam).toEqual(teams[0]);
    expect(state.originalEra).toEqual(eras[1]);
    expect(state.currentEra).toEqual(eras[1]);
    expect(state.selectedPlayerVersion).toBeNull();
    expect(state.selectedCategory).toBeNull();
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

    expect(state.status).toBe("selectingPlayer");
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
    const spunState = createSelectingPlayerState();

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
    expect(state.status).toBe("selectingPlayer");
  });

  it("prevents a team respin from returning the current team", () => {
    const spunState = createSelectingPlayerState();

    const state = gameReducer(spunState, {
      type: "USE_TEAM_RESPIN",
      teams,
      random: sequenceRandom(0),
    });

    expect(state.currentTeam).toEqual(teams[1]);
    expect(state.currentTeam).not.toEqual(spunState.currentTeam);
    expect(state.respins.teamRespinAvailable).toBe(false);
    expect(state.respins.teamRespinUsedRound).toBe(1);
  });

  it("does not consume a team respin when no alternate team is available", () => {
    const spunState = createSelectingPlayerState();

    const state = gameReducer(spunState, {
      type: "USE_TEAM_RESPIN",
      teams: [spunState.currentTeam as TeamOption],
      random: sequenceRandom(0),
    });

    expect(state.currentTeam).toEqual(spunState.currentTeam);
    expect(state.respins.teamRespinAvailable).toBe(true);
    expect(state.respins.teamRespinUsedRound).toBeNull();
    expect(state.spinError?.message).toContain("No alternate teams");
  });

  it("uses one era respin and keeps the current team unchanged", () => {
    const spunState = createSelectingPlayerState();

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
    expect(state.status).toBe("selectingPlayer");
  });

  it("prevents an era respin from returning the current era", () => {
    const spunState = createSelectingPlayerState();

    const state = gameReducer(spunState, {
      type: "USE_ERA_RESPIN",
      eras,
      random: sequenceRandom(0),
    });

    expect(state.currentEra).toEqual(eras[1]);
    expect(state.currentEra).not.toEqual(spunState.currentEra);
    expect(state.respins.eraRespinAvailable).toBe(false);
    expect(state.respins.eraRespinUsedRound).toBe(1);
  });

  it("does not consume an era respin when no alternate era is available", () => {
    const spunState = createSelectingPlayerState();

    const state = gameReducer(spunState, {
      type: "USE_ERA_RESPIN",
      eras: [spunState.currentEra as EraOption],
      random: sequenceRandom(0),
    });

    expect(state.currentEra).toEqual(spunState.currentEra);
    expect(state.respins.eraRespinAvailable).toBe(true);
    expect(state.respins.eraRespinUsedRound).toBeNull();
    expect(state.spinError?.message).toContain("No alternate eras");
  });

  it("allows both respins during the same round", () => {
    const teamRespunState = gameReducer(createSelectingPlayerState(), {
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
    expect(state.status).toBe("selectingPlayer");
    expect(state.availableCategories).toEqual(MVP_CATEGORIES);
  });

  it("selects a player before choosing an attribute category", () => {
    const selectingPlayerState = createSelectingPlayerState();

    const state = gameReducer(selectingPlayerState, {
      type: "SELECT_PLAYER",
      player,
    });

    expect(state.status).toBe("selectingCategory");
    expect(state.selectedPlayerVersion).toEqual(player);
    expect(state.selectedCategory).toBeNull();
    expect(state.availableCategories).toEqual(MVP_CATEGORIES);
    expect(state.completedCategories).toEqual([]);
    expect(state.usedPlayerVersionIds).toEqual([]);
    expect(state.roundHistory).toEqual([]);
  });

  it("returns to player selection after deselecting a selected player", () => {
    const selectingCategoryState = createSelectingCategoryState();

    const state = gameReducer(selectingCategoryState, {
      type: "DESELECT_PLAYER",
    });

    expect(state.status).toBe("selectingPlayer");
    expect(state.selectedPlayerVersion).toBeNull();
    expect(state.selectedCategory).toBeNull();
    expect(state.currentRound).toBe(selectingCategoryState.currentRound);
    expect(state.currentTeam).toEqual(selectingCategoryState.currentTeam);
    expect(state.currentEra).toEqual(selectingCategoryState.currentEra);
    expect(state.availableCategories).toEqual(MVP_CATEGORIES);
    expect(state.completedCategories).toEqual([]);
    expect(state.usedPlayerVersionIds).toEqual([]);
    expect(state.roundHistory).toEqual([]);
  });

  it("does not deselect a player when no player is selected", () => {
    const selectingPlayerState = createSelectingPlayerState();

    const state = gameReducer(selectingPlayerState, {
      type: "DESELECT_PLAYER",
    });

    expect(state).toEqual(selectingPlayerState);
  });

  it("does not select a player before player selection starts", () => {
    const spinningState = createStartedGameState();

    const state = gameReducer(spinningState, {
      type: "SELECT_PLAYER",
      player,
    });

    expect(state).toEqual(spinningState);
  });

  it("does not select an already used player version", () => {
    const selectingPlayerState: GameState = {
      ...createSelectingPlayerState(),
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
      ...createSelectingPlayerState(),
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

    expect(state.status).toBe("selectingCategory");
    expect(state.selectedPlayerVersion?.playerVersionId).toBe("version-new");
    expect(state.usedPlayerVersionIds).toEqual(["version-old"]);
  });

  it("does not select a player outside the current team and era pool", () => {
    const selectingPlayerState = createSelectingPlayerState();
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

  it.each(MVP_CATEGORIES)(
    "applies the selected player's %s rating after player selection",
    (category) => {
      const selectingCategoryState = createSelectingCategoryState();

      const state = gameReducer(selectingCategoryState, {
        type: "SELECT_CATEGORY",
        category,
      });

      expect(state.status).toBe("spinning");
      expect(state.currentRound).toBe(2);
      expect(state.originalTeam).toBeNull();
      expect(state.originalEra).toBeNull();
      expect(state.currentTeam).toBeNull();
      expect(state.currentEra).toBeNull();
      expect(state.selectedPlayerVersion).toBeNull();
      expect(state.selectedCategory).toBeNull();
      expect(state.availableCategories).not.toContain(category);
      expect(state.completedCategories).toEqual([
        {
          category,
          playerVersionId: "version-1",
          playerName: "Example Player",
          playerVersionLabel: "1980s Example Player",
          teamName: "Example Team",
          eraLabel: "1980s",
          rating: player.attributes[category],
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
          selectedCategory: category,
          selectedPlayerVersionId: "version-1",
          selectedPlayerName: "Example Player",
          selectedPlayerVersionLabel: "1980s Example Player",
          ratingApplied: player.attributes[category],
        },
      ]);
    },
  );

  it("does not select a category before a player has been chosen", () => {
    const selectingPlayerState = createSelectingPlayerState();

    const state = gameReducer(selectingPlayerState, {
      type: "SELECT_CATEGORY",
      category: "defense",
    });

    expect(state).toEqual(selectingPlayerState);
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
          playerVersionId: "version-old",
          playerName: "Old Player",
          playerVersionLabel: "1980s Old Player",
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
    const selectingCategoryState = createSelectingCategoryState();

    const state = gameReducer(selectingCategoryState, {
      type: "SELECT_CATEGORY",
      category: "rebounding" as never,
    });

    expect(state).toEqual(selectingCategoryState);
  });

  it("updates the selected player before an attribute is applied", () => {
    const selectingCategoryState = createSelectingCategoryState();
    const alternatePlayer: PlayerOption = {
      ...player,
      playerVersionId: "version-2",
      name: "Alternate Player",
    };

    const state = gameReducer(selectingCategoryState, {
      type: "SELECT_PLAYER",
      player: alternatePlayer,
    });

    expect(state.status).toBe("selectingCategory");
    expect(state.selectedPlayerVersion).toEqual(alternatePlayer);
    expect(state.availableCategories).toEqual(MVP_CATEGORIES);
    expect(state.completedCategories).toEqual([]);
    expect(state.usedPlayerVersionIds).toEqual([]);
  });

  it("records respin usage in round history when applying an attribute", () => {
    const teamRespunState = gameReducer(createSelectingPlayerState(), {
      type: "USE_TEAM_RESPIN",
      teams,
      random: sequenceRandom(0.999),
    });
    const eraRespunState = gameReducer(teamRespunState, {
      type: "USE_ERA_RESPIN",
      eras,
      random: sequenceRandom(0.999),
    });
    const respunPlayer: PlayerOption = {
      ...player,
      teamId: "team-2",
      eraId: "era-2",
    };
    const selectingCategoryState = gameReducer(eraRespunState, {
      type: "SELECT_PLAYER",
      player: respunPlayer,
    });

    const state = gameReducer(selectingCategoryState, {
      type: "SELECT_CATEGORY",
      category: "playmaking",
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
    expect(state.respins).toEqual({
      teamRespinAvailable: false,
      eraRespinAvailable: false,
      teamRespinUsedRound: 1,
      eraRespinUsedRound: 1,
    });
    expect(state.currentRound).toBe(2);
  });

  it("advances through exactly five player-first rounds and completes the game", () => {
    let state = createSelectingPlayerState();

    MVP_CATEGORIES.forEach((category, index) => {
      state = completeRound(state, category, createPlayerVersion(index + 1));

      if (index < MVP_CATEGORIES.length - 1) {
        expect(state.status).toBe("spinning");
        expect(state.currentRound).toBe(index + 2);
        expect(state.originalTeam).toBeNull();
        expect(state.originalEra).toBeNull();
        expect(state.currentTeam).toBeNull();
        expect(state.currentEra).toBeNull();
        expect(state.selectedPlayerVersion).toBeNull();

        state = gameReducer(state, {
          type: "SPIN_ROUND",
          teams,
          eras,
          random: sequenceRandom(0, 0),
        });
      }
    });

    expect(state.status).toBe("gameComplete");
    expect(state.currentRound).toBe(MVP_TOTAL_ROUNDS);
    expect(state.availableCategories).toEqual([]);
    expect(state.completedCategories.map((item) => item.category)).toEqual(
      MVP_CATEGORIES,
    );
    expect(state.usedPlayerVersionIds).toEqual([
      "version-1",
      "version-2",
      "version-3",
      "version-4",
      "version-5",
    ]);
    expect(state.roundHistory).toHaveLength(MVP_TOTAL_ROUNDS);
    expect(state.roundHistory.at(-1)?.roundNumber).toBe(MVP_TOTAL_ROUNDS);
    expect(state.originalTeam).toBeNull();
    expect(state.originalEra).toBeNull();
    expect(state.currentTeam).toBeNull();
    expect(state.currentEra).toBeNull();
    expect(state.selectedPlayerVersion).toBeNull();
    expect(state.selectedCategory).toBeNull();
  });

  it("stores final score and rank after the fifth completed category", () => {
    let state = createSelectingPlayerState();

    MVP_CATEGORIES.forEach((category, index) => {
      state = completeRound(
        state,
        category,
        createPlayerVersionWithRating(
          index + 1,
          category,
          [99, 95, 98, 94, 90][index],
        ),
      );

      if (index < MVP_CATEGORIES.length - 1) {
        expect(state.finalScore).toBeNull();
        expect(state.finalRank).toBeNull();

        state = gameReducer(state, {
          type: "SPIN_ROUND",
          teams,
          eras,
          random: sequenceRandom(0, 0),
        });
      }
    });

    expect(state.status).toBe("gameComplete");
    expect(state.finalScore).toBe(476);
    expect(state.finalRank).toBe("Hall of Fame");
  });

  it("spins again for an empty player pool without consuming respins", () => {
    const selectingPlayerState = createSelectingPlayerState();

    const state = gameReducer(selectingPlayerState, {
      type: "SPIN_AGAIN_FOR_EMPTY_POOL",
      teams,
      eras,
      random: sequenceRandom(0.999, 0.999),
    });

    expect(state.status).toBe("selectingPlayer");
    expect(state.selectedPlayerVersion).toBeNull();
    expect(state.currentTeam).toEqual(teams[1]);
    expect(state.currentEra).toEqual(eras[1]);
    expect(state.respins).toEqual(selectingPlayerState.respins);
    expect(state.usedPlayerVersionIds).toEqual([]);
  });

  it("does not spin again for an empty pool after a player has been chosen", () => {
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
    const usedState = gameReducer(createSelectingPlayerState(), {
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
    const usedState = gameReducer(createSelectingPlayerState(), {
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

  it("uses a team respin after player selection and clears the selected player", () => {
    const selectingCategoryState = createSelectingCategoryState();

    const state = gameReducer(selectingCategoryState, {
      type: "USE_TEAM_RESPIN",
      teams,
      random: sequenceRandom(0.999),
    });

    expect(state.status).toBe("selectingPlayer");
    expect(state.currentTeam).toEqual(teams[1]);
    expect(state.currentEra).toEqual(selectingCategoryState.currentEra);
    expect(state.selectedPlayerVersion).toBeNull();
    expect(state.selectedCategory).toBeNull();
    expect(state.respins.teamRespinAvailable).toBe(false);
    expect(state.respins.teamRespinUsedRound).toBe(1);
    expect(state.completedCategories).toEqual([]);
    expect(state.usedPlayerVersionIds).toEqual([]);
  });

  it("uses an era respin after player selection and clears the selected player", () => {
    const selectingCategoryState = createSelectingCategoryState();

    const state = gameReducer(selectingCategoryState, {
      type: "USE_ERA_RESPIN",
      eras,
      random: sequenceRandom(0.999),
    });

    expect(state.status).toBe("selectingPlayer");
    expect(state.currentTeam).toEqual(selectingCategoryState.currentTeam);
    expect(state.currentEra).toEqual(eras[1]);
    expect(state.selectedPlayerVersion).toBeNull();
    expect(state.selectedCategory).toBeNull();
    expect(state.respins.eraRespinAvailable).toBe(false);
    expect(state.respins.eraRespinUsedRound).toBe(1);
    expect(state.completedCategories).toEqual([]);
    expect(state.usedPlayerVersionIds).toEqual([]);
  });

  it("prevents a selecting-category team respin from returning the same team", () => {
    const spunState = createSelectingCategoryState();

    const state = gameReducer(spunState, {
      type: "USE_TEAM_RESPIN",
      teams,
      random: sequenceRandom(0),
    });

    expect(state.currentTeam).not.toEqual(spunState.currentTeam);
    expect(state.selectedPlayerVersion).toBeNull();
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
  expect(state.selectedPlayerVersion).toBeNull();
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

function createSelectingPlayerState() {
  return gameReducer(createStartedGameState(), {
    type: "SPIN_ROUND",
    teams,
    eras,
    random: sequenceRandom(0, 0),
  });
}

function createSelectingCategoryState(selectedPlayer: PlayerOption = player) {
  return gameReducer(createSelectingPlayerState(), {
    type: "SELECT_PLAYER",
    player: selectedPlayer,
  });
}

function completeRound(
  state: GameState,
  category: AttributeCategory,
  selectedPlayer: PlayerOption,
) {
  const selectingCategoryState = gameReducer(state, {
    type: "SELECT_PLAYER",
    player: selectedPlayer,
  });

  return gameReducer(selectingCategoryState, {
    type: "SELECT_CATEGORY",
    category,
  });
}

function createPlayerVersion(versionNumber: number): PlayerOption {
  return {
    ...player,
    playerVersionId: `version-${versionNumber}`,
  };
}

function createPlayerVersionWithRating(
  versionNumber: number,
  category: AttributeCategory,
  rating: number,
): PlayerOption {
  return {
    ...createPlayerVersion(versionNumber),
    attributes: {
      ...player.attributes,
      [category]: rating,
    },
  };
}

function sequenceRandom(...values: number[]) {
  let index = 0;

  return () => values[index++] ?? 0;
}
