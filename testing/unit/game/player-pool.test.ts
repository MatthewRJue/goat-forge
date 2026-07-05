import { describe, expect, it } from "vitest";

import {
  buildEligiblePlayerOptions,
  filterAndSortPlayerOptions,
  getPlayerOptionRating,
  getPlayerPoolPositions,
} from "@/lib/game/player-pool";
import type { PlayerOption } from "@/lib/game/types";
import type { PlayerPoolEntry } from "@/types/game-data";

const playerPool: PlayerPoolEntry[] = [
  {
    player: {
      id: "player-1",
      name: "Shared Player",
      position: "F",
      heightInches: 80,
      weightLbs: 230,
      imageUrl: null,
    },
    version: {
      id: "version-1",
      playerId: "player-1",
      teamId: "team-1",
      eraId: "era-1",
      label: "1990s Shared Player",
      seasonStart: 1990,
      seasonEnd: 1999,
    },
    attributes: {
      athleticism: 95,
      shooting: 80,
      finishing: 90,
      playmaking: 84,
      defense: 88,
    },
    totalRating: 437,
  },
  {
    player: {
      id: "player-1",
      name: "Shared Player",
      position: "F",
      heightInches: 80,
      weightLbs: 230,
      imageUrl: null,
    },
    version: {
      id: "version-2",
      playerId: "player-1",
      teamId: "team-2",
      eraId: "era-2",
      label: "2000s Shared Player",
      seasonStart: 2000,
      seasonEnd: 2009,
    },
    attributes: {
      athleticism: 90,
      shooting: 86,
      finishing: 93,
      playmaking: 88,
      defense: 82,
    },
    totalRating: 439,
  },
];

const playerOptions: PlayerOption[] = [
  {
    playerVersionId: "version-3",
    playerId: "player-3",
    name: "Beta Guard",
    position: "PG",
    versionLabel: "1990s Beta Guard",
    teamId: "team-1",
    eraId: "era-1",
    imageUrl: null,
    attributes: {
      athleticism: 91,
      shooting: 88,
      finishing: 82,
      playmaking: 96,
      defense: 78,
    },
  },
  {
    playerVersionId: "version-4",
    playerId: "player-4",
    name: "Alpha Wing",
    position: "SF",
    versionLabel: "1990s Alpha Wing",
    teamId: "team-1",
    eraId: "era-1",
    imageUrl: null,
    attributes: {
      athleticism: 97,
      shooting: 81,
      finishing: 95,
      playmaking: 84,
      defense: 93,
    },
  },
  {
    playerVersionId: "version-5",
    playerId: "player-5",
    name: "Gamma Center",
    position: "C",
    versionLabel: "1990s Gamma Center",
    teamId: "team-1",
    eraId: "era-1",
    imageUrl: null,
    attributes: {
      athleticism: 83,
      shooting: 74,
      finishing: 98,
      playmaking: 76,
      defense: 96,
    },
  },
];

describe("player pool game helpers", () => {
  it("maps pool entries into player options and excludes used player versions", () => {
    const options = buildEligiblePlayerOptions({
      pool: playerPool,
      usedPlayerVersionIds: ["version-1"],
    });

    expect(options).toHaveLength(1);
    expect(options[0]).toMatchObject({
      playerVersionId: "version-2",
      playerId: "player-1",
      name: "Shared Player",
      position: "F",
      versionLabel: "2000s Shared Player",
      teamId: "team-2",
      eraId: "era-2",
    });
  });

  it("allows a different version of the same base player to remain eligible", () => {
    const options = buildEligiblePlayerOptions({
      pool: playerPool,
      usedPlayerVersionIds: ["version-1"],
    });

    expect(options.map((option) => option.playerId)).toEqual(["player-1"]);
    expect(options.map((option) => option.playerVersionId)).toEqual(["version-2"]);
  });

  it("returns the selected category rating from a player option", () => {
    const [option] = buildEligiblePlayerOptions({
      pool: playerPool,
      usedPlayerVersionIds: [],
    });

    expect(getPlayerOptionRating(option, "shooting")).toBe(80);
    expect(getPlayerOptionRating(option, "defense")).toBe(88);
  });

  it("filters player options by visible player name", () => {
    const options = filterAndSortPlayerOptions({
      players: playerOptions,
      searchQuery: "wing",
    });

    expect(options.map((option) => option.name)).toEqual(["Alpha Wing"]);
  });

  it("filters player options by position", () => {
    const options = filterAndSortPlayerOptions({
      players: playerOptions,
      position: "SF",
    });

    expect(options.map((option) => option.name)).toEqual(["Alpha Wing"]);
  });

  it("sorts player options alphabetically by name by default", () => {
    const options = filterAndSortPlayerOptions({
      players: playerOptions,
    });

    expect(options.map((option) => option.name)).toEqual([
      "Alpha Wing",
      "Beta Guard",
      "Gamma Center",
    ]);
  });

  it.each([
    ["athleticism", ["Alpha Wing", "Beta Guard", "Gamma Center"]],
    ["shooting", ["Beta Guard", "Alpha Wing", "Gamma Center"]],
    ["finishing", ["Gamma Center", "Alpha Wing", "Beta Guard"]],
    ["playmaking", ["Beta Guard", "Alpha Wing", "Gamma Center"]],
    ["defense", ["Gamma Center", "Alpha Wing", "Beta Guard"]],
  ] as const)("sorts player options by %s rating descending", (sortKey, names) => {
    const options = filterAndSortPlayerOptions({
      players: playerOptions,
      sortKey,
    });

    expect(options.map((option) => option.name)).toEqual(names);
  });

  it("filters and sorts after used player versions have already been excluded", () => {
    const eligiblePlayers = buildEligiblePlayerOptions({
      pool: playerPool,
      usedPlayerVersionIds: ["version-1"],
    });
    const options = filterAndSortPlayerOptions({
      players: eligiblePlayers,
      searchQuery: "shared",
      sortKey: "shooting",
    });

    expect(options.map((option) => option.playerVersionId)).toEqual(["version-2"]);
  });

  it("returns sorted positions for player pool controls", () => {
    expect(getPlayerPoolPositions(playerOptions)).toEqual(["C", "PG", "SF"]);
  });
});
