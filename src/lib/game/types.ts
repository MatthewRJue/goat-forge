import type { AttributeCategory, PlayerAttributeRatings } from "@/types/game-data";

export type { AttributeCategory };

export type GameStatus =
  | "idle"
  | "spinning"
  | "selectingCategory"
  | "selectingPlayer"
  | "roundComplete"
  | "gameComplete";

export type TeamOption = {
  id: string;
  name: string;
  abbreviation: string;
  logoUrl?: string | null;
};

export type EraOption = {
  id: string;
  label: string;
  startYear: number;
  endYear: number;
};

export type PlayerOption = {
  playerVersionId: string;
  playerId: string;
  name: string;
  versionLabel: string;
  teamId: string;
  eraId: string;
  imageUrl?: string | null;
  attributes: PlayerAttributeRatings;
};

export type CompletedCategory = {
  category: AttributeCategory;
  playerVersionId: string;
  playerName: string;
  playerVersionLabel: string;
  teamName: string;
  eraLabel: string;
  rating: number;
};

export type RespinState = {
  teamRespinAvailable: boolean;
  eraRespinAvailable: boolean;
  teamRespinUsedRound: number | null;
  eraRespinUsedRound: number | null;
};

export type RoundResult = {
  roundNumber: number;
  originalTeam: TeamOption;
  originalEra: EraOption;
  finalTeam: TeamOption;
  finalEra: EraOption;
  teamRespinUsed: boolean;
  eraRespinUsed: boolean;
  selectedCategory: AttributeCategory;
  selectedPlayerVersionId: string;
  selectedPlayerName: string;
  selectedPlayerVersionLabel: string;
  ratingApplied: number;
};

export type GameRank =
  | "GOAT"
  | "Hall of Fame"
  | "All-Time Great"
  | "All-Star"
  | "Starter"
  | "Role Player";

export type GameState = {
  status: GameStatus;
  currentRound: number;
  totalRounds: number;
  currentTeam: TeamOption | null;
  currentEra: EraOption | null;
  selectedCategory: AttributeCategory | null;
  availableCategories: AttributeCategory[];
  completedCategories: CompletedCategory[];
  usedPlayerVersionIds: string[];
  respins: RespinState;
  roundHistory: RoundResult[];
  finalScore: number | null;
  finalRank: GameRank | null;
};
