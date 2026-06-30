import { describe, expect, it } from "vitest";

import {
  buildEligiblePlayerOptions,
  getPlayerOptionRating,
} from "@/lib/game/player-pool";
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
});
