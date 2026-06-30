export type AttributeCategory =
  | "athleticism"
  | "shooting"
  | "finishing"
  | "playmaking"
  | "defense";

export type PlayerAttributeRatings = Record<AttributeCategory, number>;

export type Team = {
  id: string;
  name: string;
  abbreviation: string;
  logoUrl: string | null;
};

export type Era = {
  id: string;
  label: string;
  startYear: number;
  endYear: number;
};

export type Player = {
  id: string;
  name: string;
  position: string;
  heightInches: number;
  weightLbs: number;
  imageUrl: string | null;
};

export type PlayerVersion = {
  id: string;
  playerId: string;
  teamId: string;
  eraId: string;
  label: string;
  seasonStart: number;
  seasonEnd: number;
};

export type PlayerAttributes = {
  id: string;
  playerVersionId: string;
} & PlayerAttributeRatings;

export type PlayerPoolEntry = {
  player: Player;
  version: PlayerVersion;
  attributes: PlayerAttributeRatings;
  totalRating: number;
};
