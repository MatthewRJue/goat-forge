import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  Era,
  Player,
  PlayerAttributes,
  PlayerVersion,
  Team,
} from "@/types/game-data";

type SupabaseError = {
  message: string;
};

type TeamRow = {
  id: string;
  name: string;
  abbreviation: string;
  logo_url: string | null;
};

type EraRow = {
  id: string;
  label: string;
  start_year: number;
  end_year: number;
};

type PlayerRow = {
  id: string;
  name: string;
  position: string;
  height_inches: number;
  weight_lbs: number;
  image_url: string | null;
};

type PlayerVersionRow = {
  id: string;
  player_id: string;
  team_id: string;
  era_id: string;
  label: string;
  season_start: number;
  season_end: number;
};

type PlayerAttributesRow = {
  id: string;
  player_version_id: string;
  athleticism: number;
  shooting: number;
  finishing: number;
  playmaking: number;
  defense: number;
};

export type PlayerPoolRecords = {
  players: Player[];
  playerVersions: PlayerVersion[];
  playerAttributes: PlayerAttributes[];
};

export async function getSupabaseTeams(
  client: SupabaseClient,
): Promise<Team[]> {
  const { data, error } = await client
    .from("teams")
    .select("id, name, abbreviation, logo_url")
    .order("name");

  throwIfSupabaseError(error, "teams");

  return ((data ?? []) as TeamRow[]).map(mapTeamRow);
}

export async function getSupabaseEras(client: SupabaseClient): Promise<Era[]> {
  const { data, error } = await client
    .from("eras")
    .select("id, label, start_year, end_year")
    .order("start_year");

  throwIfSupabaseError(error, "eras");

  return ((data ?? []) as EraRow[]).map(mapEraRow);
}

export async function getSupabasePlayerPoolRecords(
  client: SupabaseClient,
  teamId: string,
  eraId: string,
): Promise<PlayerPoolRecords> {
  const { data: versionData, error: versionError } = await client
    .from("player_versions")
    .select("id, player_id, team_id, era_id, label, season_start, season_end")
    .eq("team_id", teamId)
    .eq("era_id", eraId);

  throwIfSupabaseError(versionError, "player_versions");

  const versionRows = (versionData ?? []) as PlayerVersionRow[];

  if (versionRows.length === 0) {
    return {
      players: [],
      playerVersions: [],
      playerAttributes: [],
    };
  }

  const playerIds = versionRows.map((version) => version.player_id);
  const playerVersionIds = versionRows.map((version) => version.id);

  const [
    { data: playerData, error: playerError },
    { data: attributeData, error: attributeError },
  ] = await Promise.all([
    client
      .from("players")
      .select("id, name, position, height_inches, weight_lbs, image_url")
      .in("id", playerIds),
    client
      .from("player_attributes")
      .select(
        [
          "id",
          "player_version_id",
          "athleticism",
          "shooting",
          "finishing",
          "playmaking",
          "defense",
        ].join(", "),
      )
      .in("player_version_id", playerVersionIds),
  ]);

  throwIfSupabaseError(playerError, "players");
  throwIfSupabaseError(attributeError, "player_attributes");

  return {
    players: ((playerData ?? []) as PlayerRow[]).map(mapPlayerRow),
    playerVersions: versionRows.map(mapPlayerVersionRow),
    playerAttributes: ((attributeData ?? []) as PlayerAttributesRow[]).map(
      mapPlayerAttributesRow,
    ),
  };
}

function mapTeamRow(row: TeamRow): Team {
  return {
    id: row.id,
    name: row.name,
    abbreviation: row.abbreviation,
    logoUrl: row.logo_url,
  };
}

function mapEraRow(row: EraRow): Era {
  return {
    id: row.id,
    label: row.label,
    startYear: row.start_year,
    endYear: row.end_year,
  };
}

function mapPlayerRow(row: PlayerRow): Player {
  return {
    id: row.id,
    name: row.name,
    position: row.position,
    heightInches: row.height_inches,
    weightLbs: row.weight_lbs,
    imageUrl: row.image_url,
  };
}

function mapPlayerVersionRow(row: PlayerVersionRow): PlayerVersion {
  return {
    id: row.id,
    playerId: row.player_id,
    teamId: row.team_id,
    eraId: row.era_id,
    label: row.label,
    seasonStart: row.season_start,
    seasonEnd: row.season_end,
  };
}

function mapPlayerAttributesRow(row: PlayerAttributesRow): PlayerAttributes {
  return {
    id: row.id,
    playerVersionId: row.player_version_id,
    athleticism: row.athleticism,
    shooting: row.shooting,
    finishing: row.finishing,
    playmaking: row.playmaking,
    defense: row.defense,
  };
}

function throwIfSupabaseError(
  error: SupabaseError | null,
  tableName: string,
) {
  if (!error) {
    return;
  }

  throw new Error(`Unable to load ${tableName} from Supabase: ${error.message}`);
}
