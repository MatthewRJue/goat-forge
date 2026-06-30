import { describe, expect, it } from "vitest";

import { gameReducer } from "@/lib/game/game-reducer";
import {
  MVP_CATEGORIES,
  MVP_TOTAL_ROUNDS,
  createInitialGameState,
  createStartedGameState,
} from "@/lib/game/game-state";
import type { GameState } from "@/lib/game/types";

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
      finalScore: 480,
      finalRank: "Hall of Fame",
    };

    const state = gameReducer(dirtyState, { type: "START_GAME" });

    expectStartedState(state);
  });
});

function expectStartedState(state: GameState) {
  expect(state.status).toBe("spinning");
  expect(state.currentRound).toBe(1);
  expect(state.totalRounds).toBe(5);
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
  expect(state.finalScore).toBeNull();
  expect(state.finalRank).toBeNull();
}
