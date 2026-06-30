import type {
  Player,
  PlayerAttributes,
  PlayerVersion,
} from "@/types/game-data";

export const fixtureTeamId = "fixture-team";
export const fixtureEraId = "fixture-era";

export const playerPoolFixture: {
  players: Player[];
  playerVersions: PlayerVersion[];
  playerAttributes: PlayerAttributes[];
} = {
  players: Array.from({ length: 25 }, (_, index) => {
    const playerNumber = index + 1;

    return {
      id: `fixture-player-${playerNumber}`,
      name: `Fixture Player ${playerNumber}`,
      position: "G",
      heightInches: 78,
      weightLbs: 210,
      imageUrl: null,
    };
  }),
  playerVersions: Array.from({ length: 25 }, (_, index) => {
    const playerNumber = index + 1;

    return {
      id: `fixture-version-${playerNumber}`,
      playerId: `fixture-player-${playerNumber}`,
      teamId: fixtureTeamId,
      eraId: fixtureEraId,
      label: `Fixture Version ${playerNumber}`,
      seasonStart: 2020,
      seasonEnd: 2021,
    };
  }),
  playerAttributes: Array.from({ length: 25 }, (_, index) => {
    const playerNumber = index + 1;
    const rating = 100 - index;

    return {
      id: `fixture-attributes-${playerNumber}`,
      playerVersionId: `fixture-version-${playerNumber}`,
      athleticism: rating,
      shooting: rating,
      finishing: rating,
      playmaking: rating,
      defense: rating,
    };
  }),
};
