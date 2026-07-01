import { describe, expect, it } from "vitest";

import { buildPlayerPool, getEras, getPlayerPool, getTeams } from "@/data/game-data";
import {
  seedEras,
  seedGameDataIds,
  seedPlayerAttributes,
  seedPlayers,
  seedPlayerVersions,
  seedTeams,
} from "@/data/seed/game-data";
import {
  fixtureEraId,
  fixtureTeamId,
  playerPoolFixture,
} from "../../fixtures/data/player-pool-fixture";

const attributeKeys = [
  "athleticism",
  "shooting",
  "finishing",
  "playmaking",
  "defense",
] as const;

describe("MVP game data", () => {
  it("includes representative teams, eras, players, player versions, and attributes", () => {
    expect(seedTeams.length).toBeGreaterThanOrEqual(5);
    expect(seedEras.length).toBeGreaterThanOrEqual(5);
    expect(seedPlayers.length).toBeGreaterThan(0);
    expect(seedPlayerVersions.length).toBeGreaterThan(0);
    expect(seedPlayerAttributes.length).toBe(seedPlayerVersions.length);
  });

  it("keeps player versions connected to valid teams, eras, players, and attributes", () => {
    const teamIds = new Set(seedTeams.map((team) => team.id));
    const eraIds = new Set(seedEras.map((era) => era.id));
    const playerIds = new Set(seedPlayers.map((player) => player.id));
    const attributeVersionIds = new Set(
      seedPlayerAttributes.map((attributes) => attributes.playerVersionId),
    );

    for (const version of seedPlayerVersions) {
      expect(teamIds.has(version.teamId)).toBe(true);
      expect(eraIds.has(version.eraId)).toBe(true);
      expect(playerIds.has(version.playerId)).toBe(true);
      expect(attributeVersionIds.has(version.id)).toBe(true);
    }
  });

  it("gives every seeded player version all five MVP ratings", () => {
    for (const attributes of seedPlayerAttributes) {
      for (const key of attributeKeys) {
        expect(attributes[key]).toEqual(expect.any(Number));
        expect(attributes[key]).toBeGreaterThanOrEqual(0);
        expect(attributes[key]).toBeLessThanOrEqual(100);
      }
    }
  });

  it("returns teams and eras through wrapper functions", async () => {
    await expect(getTeams()).resolves.toEqual(seedTeams);
    await expect(getEras()).resolves.toEqual(seedEras);
  });

  it("returns a populated player pool for a seeded team-era pair", async () => {
    const pool = await getPlayerPool(
      seedGameDataIds.teams.heat,
      seedGameDataIds.eras.twentyTens,
    );

    expect(pool).toHaveLength(1);
    expect(pool[0].version.id).toBe(
      seedGameDataIds.playerVersions.heatLebron2010s,
    );
    expect(pool[0].attributes.defense).toBe(94);
  });

  it("returns an empty player pool when no matching versions exist", async () => {
    await expect(
      getPlayerPool(
        seedGameDataIds.teams.warriors,
        seedGameDataIds.eras.nineteenEighties,
      ),
    ).resolves.toEqual([]);
  });

  it("sorts eligible player versions by total rating and caps the pool at 20", () => {
    const pool = buildPlayerPool(playerPoolFixture, fixtureTeamId, fixtureEraId);

    expect(pool).toHaveLength(20);
    expect(pool[0].version.id).toBe("fixture-version-1");
    expect(pool[19].version.id).toBe("fixture-version-20");
    expect(pool[0].totalRating).toBeGreaterThan(pool[19].totalRating);
  });

  it("excludes used player versions before applying the pool limit", () => {
    const pool = buildPlayerPool(playerPoolFixture, fixtureTeamId, fixtureEraId, {
      usedPlayerVersionIds: ["fixture-version-1"],
    });

    expect(pool).toHaveLength(20);
    expect(pool.map((entry) => entry.version.id)).not.toContain(
      "fixture-version-1",
    );
    expect(pool[0].version.id).toBe("fixture-version-2");
    expect(pool[19].version.id).toBe("fixture-version-21");
  });
});
