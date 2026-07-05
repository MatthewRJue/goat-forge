import type { AttributeCategory, PlayerOption } from "@/lib/game/types";
import type { PlayerPoolEntry } from "@/types/game-data";

export type PlayerPoolSortKey = "name" | AttributeCategory;

type BuildEligiblePlayerOptionsInput = {
  pool: readonly PlayerPoolEntry[];
  usedPlayerVersionIds: readonly string[];
};

type FilterAndSortPlayerOptionsInput = {
  players: readonly PlayerOption[];
  searchQuery?: string;
  position?: string;
  sortKey?: PlayerPoolSortKey;
};

export function buildEligiblePlayerOptions({
  pool,
  usedPlayerVersionIds,
}: BuildEligiblePlayerOptionsInput): PlayerOption[] {
  const usedVersionIds = new Set(usedPlayerVersionIds);

  return pool
    .filter((entry) => !usedVersionIds.has(entry.version.id))
    .map((entry) => ({
      playerVersionId: entry.version.id,
      playerId: entry.player.id,
      name: entry.player.name,
      position: entry.player.position,
      versionLabel: entry.version.label,
      teamId: entry.version.teamId,
      eraId: entry.version.eraId,
      imageUrl: entry.player.imageUrl,
      attributes: entry.attributes,
    }));
}

export function filterAndSortPlayerOptions({
  players,
  searchQuery = "",
  position = "",
  sortKey = "name",
}: FilterAndSortPlayerOptionsInput): PlayerOption[] {
  const normalizedSearchQuery = normalizeSearchValue(searchQuery);
  const normalizedPosition = normalizeSearchValue(position);

  return players
    .filter((player) => {
      const nameMatches =
        normalizedSearchQuery.length === 0 ||
        normalizeSearchValue(player.name).includes(normalizedSearchQuery);
      const positionMatches =
        normalizedPosition.length === 0 ||
        normalizeSearchValue(player.position) === normalizedPosition;

      return nameMatches && positionMatches;
    })
    .sort((firstPlayer, secondPlayer) => {
      if (sortKey === "name") {
        return comparePlayerNames(firstPlayer, secondPlayer);
      }

      const ratingDifference =
        secondPlayer.attributes[sortKey] - firstPlayer.attributes[sortKey];

      return ratingDifference || comparePlayerNames(firstPlayer, secondPlayer);
    });
}

export function getPlayerPoolPositions(
  players: readonly PlayerOption[],
): string[] {
  return Array.from(new Set(players.map((player) => player.position))).sort(
    (firstPosition, secondPosition) => firstPosition.localeCompare(secondPosition),
  );
}

export function getPlayerOptionRating(
  player: PlayerOption,
  category: AttributeCategory,
): number {
  return player.attributes[category];
}

function comparePlayerNames(
  firstPlayer: PlayerOption,
  secondPlayer: PlayerOption,
) {
  return firstPlayer.name.localeCompare(secondPlayer.name);
}

function normalizeSearchValue(value: string) {
  return value.trim().toLocaleLowerCase();
}
