import {
  seedEras,
  seedPlayerAttributes,
  seedPlayers,
  seedPlayerVersions,
  seedTeams,
} from "@/data/seed/game-data";
import type {
  Era,
  Player,
  PlayerAttributes,
  PlayerAttributeRatings,
  PlayerPoolEntry,
  PlayerVersion,
  Team,
} from "@/types/game-data";

const PLAYER_POOL_LIMIT = 20;

type PlayerPoolRecords = {
  players: Player[];
  playerVersions: PlayerVersion[];
  playerAttributes: PlayerAttributes[];
};

export async function getTeams(): Promise<Team[]> {
  return [...seedTeams];
}

export async function getEras(): Promise<Era[]> {
  return [...seedEras];
}

export async function getPlayerPool(
  teamId: string,
  eraId: string,
): Promise<PlayerPoolEntry[]> {
  return buildPlayerPool(
    {
      players: seedPlayers,
      playerVersions: seedPlayerVersions,
      playerAttributes: seedPlayerAttributes,
    },
    teamId,
    eraId,
  );
}

export function buildPlayerPool(
  records: PlayerPoolRecords,
  teamId: string,
  eraId: string,
  limit = PLAYER_POOL_LIMIT,
): PlayerPoolEntry[] {
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
    .filter((version) => version.teamId === teamId && version.eraId === eraId)
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
