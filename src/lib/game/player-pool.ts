import type { AttributeCategory, PlayerOption } from "@/lib/game/types";
import type { PlayerPoolEntry } from "@/types/game-data";

type BuildEligiblePlayerOptionsInput = {
  pool: readonly PlayerPoolEntry[];
  usedPlayerVersionIds: readonly string[];
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
      versionLabel: entry.version.label,
      teamId: entry.version.teamId,
      eraId: entry.version.eraId,
      imageUrl: entry.player.imageUrl,
      attributes: entry.attributes,
    }));
}

export function getPlayerOptionRating(
  player: PlayerOption,
  category: AttributeCategory,
): number {
  return player.attributes[category];
}
