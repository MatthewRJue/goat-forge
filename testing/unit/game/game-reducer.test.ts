import { describe, expect, it } from "vitest";

import { gameReducer } from "@/lib/game/game-reducer";
import {
  MVP_CATEGORIES,
  MVP_TOTAL_ROUNDS,
  createInitialGameState,
  createStartedGameState,
} from "@/lib/game/game-state";
import type { EraOption, GameState, TeamOption } from "@/lib/game/types";

const teams: TeamOption[] = [
  { id: "team-1", name: "Example Team", abbreviation: "EXT" },
  { id: "team-2", name: "Last Team", abbreviation: "LST" },
];

const eras: EraOption[] = [
  { id: "era-1", label: "1980s", startYear: 1980, endYear: 1989 },
  { id: "era-2", label: "2020s", startYear: 2020, endYear: 2029 },
];

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

function sequenceRandom(...values: number[]) {
  let index = 0;

  return () => values[index++] ?? 0;
}
