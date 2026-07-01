import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import { buildPlayerPool } from "@/data/game-data";
import { seedGameDataIds } from "@/data/seed/game-data";
import {
  getSupabaseEras,
  getSupabasePlayerPoolRecords,
  getSupabaseTeams,
} from "@/lib/supabase/queries/game-data";

const mockRows = {
  teams: [
    {
      id: seedGameDataIds.teams.heat,
      name: "Miami Heat",
      abbreviation: "MIA",
      logo_url: null,
    },
  ],
  eras: [
    {
      id: seedGameDataIds.eras.twentyTens,
      label: "2010s",
      start_year: 2010,
      end_year: 2019,
    },
  ],
  players: [
    {
      id: seedGameDataIds.players.lebronJames,
      name: "LeBron James",
      position: "SF",
      height_inches: 81,
      weight_lbs: 250,
      image_url: null,
    },
  ],
  player_versions: [
    {
      id: seedGameDataIds.playerVersions.heatLebron2010s,
      player_id: seedGameDataIds.players.lebronJames,
      team_id: seedGameDataIds.teams.heat,
      era_id: seedGameDataIds.eras.twentyTens,
      label: "2010s Heat LeBron James",
      season_start: 2010,
      season_end: 2014,
    },
  ],
  player_attributes: [
    {
      id: seedGameDataIds.playerAttributes.heatLebron2010s,
      player_version_id: seedGameDataIds.playerVersions.heatLebron2010s,
      athleticism: 98,
      shooting: 86,
      finishing: 99,
      playmaking: 96,
      defense: 94,
    },
  ],
};

describe("Supabase game-data queries", () => {
  it("maps teams and eras from database rows into app types", async () => {
    const client = createMockSupabaseClient(mockRows);

    await expect(getSupabaseTeams(client)).resolves.toEqual([
      {
        id: seedGameDataIds.teams.heat,
        name: "Miami Heat",
        abbreviation: "MIA",
        logoUrl: null,
      },
    ]);

    await expect(getSupabaseEras(client)).resolves.toEqual([
      {
        id: seedGameDataIds.eras.twentyTens,
        label: "2010s",
        startYear: 2010,
        endYear: 2019,
      },
    ]);
  });

  it("loads player-pool records that preserve the existing wrapper contract", async () => {
    const records = await getSupabasePlayerPoolRecords(
      createMockSupabaseClient(mockRows),
      seedGameDataIds.teams.heat,
      seedGameDataIds.eras.twentyTens,
    );

    const pool = buildPlayerPool(
      records,
      seedGameDataIds.teams.heat,
      seedGameDataIds.eras.twentyTens,
    );

    expect(pool).toHaveLength(1);
    expect(pool[0]).toMatchObject({
      player: {
        id: seedGameDataIds.players.lebronJames,
        name: "LeBron James",
      },
      version: {
        id: seedGameDataIds.playerVersions.heatLebron2010s,
      },
      attributes: {
        defense: 94,
      },
    });
  });

  it("returns empty player-pool records for valid pairs without seeded players", async () => {
    await expect(
      getSupabasePlayerPoolRecords(
        createMockSupabaseClient(mockRows),
        seedGameDataIds.teams.warriors,
        seedGameDataIds.eras.nineteenEighties,
      ),
    ).resolves.toEqual({
      players: [],
      playerVersions: [],
      playerAttributes: [],
    });
  });

  it("surfaces Supabase query failures with table context", async () => {
    await expect(
      getSupabaseTeams(
        createMockSupabaseClient(mockRows, {
          teams: { message: "permission denied" },
        }),
      ),
    ).rejects.toThrow("Unable to load teams from Supabase: permission denied");
  });
});

type MockRows = Record<string, Record<string, unknown>[]>;

type MockError = {
  message: string;
};

function createMockSupabaseClient(
  rowsByTable: MockRows,
  errorsByTable: Record<string, MockError> = {},
): SupabaseClient {
  return {
    from(tableName: string) {
      return createMockQueryBuilder(rowsByTable, errorsByTable, tableName);
    },
  } as unknown as SupabaseClient;
}

function createMockQueryBuilder(
  rowsByTable: MockRows,
  errorsByTable: Record<string, MockError>,
  tableName: string,
) {
  let rows = [...(rowsByTable[tableName] ?? [])];

  const builder = {
    select() {
      return builder;
    },
    order(columnName: string) {
      rows = [...rows].sort((left, right) =>
        String(left[columnName]).localeCompare(String(right[columnName])),
      );

      return builder;
    },
    eq(columnName: string, value: unknown) {
      rows = rows.filter((row) => row[columnName] === value);

      return builder;
    },
    in(columnName: string, values: unknown[]) {
      rows = rows.filter((row) => values.includes(row[columnName]));

      return builder;
    },
    then<TResult1 = unknown, TResult2 = never>(
      onfulfilled?:
        | ((
            value: { data: Record<string, unknown>[] | null; error: MockError | null },
          ) => TResult1 | PromiseLike<TResult1>)
        | null,
      onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
    ) {
      return Promise.resolve({
        data: errorsByTable[tableName] ? null : rows,
        error: errorsByTable[tableName] ?? null,
      }).then(onfulfilled, onrejected);
    },
  };

  return builder;
}
