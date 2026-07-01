import {
  seedEras,
  seedPlayerAttributes,
  seedPlayers,
  seedPlayerVersions,
  seedTeams,
} from "@/data/seed/game-data";
import { createSupabaseClient, hasSupabaseEnvironment } from "@/lib/supabase/client";
import {
  getSupabaseEras,
  getSupabasePlayerPoolRecords,
  getSupabaseTeams,
  type PlayerPoolRecords,
} from "@/lib/supabase/queries/game-data";
import type {
  Era,
  PlayerAttributeRatings,
  PlayerPoolEntry,
  Team,
} from "@/types/game-data";

const PLAYER_POOL_LIMIT = 20;

type BuildPlayerPoolOptions = {
  limit?: number;
  usedPlayerVersionIds?: readonly string[];
};

export async function getTeams(): Promise<Team[]> {
  if (shouldReadFromSupabase()) {
    return getSupabaseTeams(createSupabaseClient());
  }

  return [...seedTeams];
}

export async function getEras(): Promise<Era[]> {
  if (shouldReadFromSupabase()) {
    return getSupabaseEras(createSupabaseClient());
  }

  return [...seedEras];
}

export async function getPlayerPool(
  teamId: string,
  eraId: string,
  options: BuildPlayerPoolOptions = {},
): Promise<PlayerPoolEntry[]> {
  if (shouldReadFromSupabase()) {
    const records = await getSupabasePlayerPoolRecords(
      createSupabaseClient(),
      teamId,
      eraId,
    );

    return buildPlayerPool(records, teamId, eraId, options);
  }

  return buildPlayerPool(
    {
      players: seedPlayers,
      playerVersions: seedPlayerVersions,
      playerAttributes: seedPlayerAttributes,
    },
    teamId,
    eraId,
    options,
  );
}

function shouldReadFromSupabase() {
  return (
    process.env.NODE_ENV !== "test" &&
    !shouldForceSeedData() &&
    hasSupabaseEnvironment()
  );
}

function shouldForceSeedData() {
  if (process.env.NEXT_PUBLIC_GOAT_DATA_SOURCE === "seed") {
    return true;
  }

  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(
    window.localStorage.getItem("goat-builder-test-random") !== null ||
      window.localStorage.getItem("goat-builder-test-random-sequence") !== null,
  );
}

export function buildPlayerPool(
  records: PlayerPoolRecords,
  teamId: string,
  eraId: string,
  options: BuildPlayerPoolOptions = {},
): PlayerPoolEntry[] {
  const { limit = PLAYER_POOL_LIMIT, usedPlayerVersionIds = [] } = options;
  const usedVersionIds = new Set(usedPlayerVersionIds);
  const playersById = new Map(
    records.players.map((player) => [player.id, player]),
  );
  const attributesByVersionId = new Map(
    records.playerAttributes.map((attributes) => [
      attributes.playerVersionId,
      attributes,
    ]),
  );

  return records.playerVersions
    .filter(
      (version) =>
        version.teamId === teamId &&
        version.eraId === eraId &&
        !usedVersionIds.has(version.id),
    )
    .map((version) => {
      const player = playersById.get(version.playerId);
      const attributes = attributesByVersionId.get(version.id);

      if (!player || !attributes) {
        return null;
      }

      const ratings = {
        athleticism: attributes.athleticism,
        shooting: attributes.shooting,
        finishing: attributes.finishing,
        playmaking: attributes.playmaking,
        defense: attributes.defense,
      } satisfies PlayerAttributeRatings;

      return {
        player,
        version,
        attributes: ratings,
        totalRating: getTotalRating(ratings),
      };
    })
    .filter((entry): entry is PlayerPoolEntry => entry !== null)
    .sort((left, right) => right.totalRating - left.totalRating)
    .slice(0, limit);
}

function getTotalRating(attributes: PlayerAttributeRatings) {
  return (
    attributes.athleticism +
    attributes.shooting +
    attributes.finishing +
    attributes.playmaking +
    attributes.defense
  );
}
