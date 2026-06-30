import type {
  Era,
  Player,
  PlayerAttributes,
  PlayerVersion,
  Team,
} from "@/types/game-data";

export const seedTeams: Team[] = [
  { id: "team-lal", name: "Los Angeles Lakers", abbreviation: "LAL", logoUrl: null },
  { id: "team-chi", name: "Chicago Bulls", abbreviation: "CHI", logoUrl: null },
  { id: "team-bos", name: "Boston Celtics", abbreviation: "BOS", logoUrl: null },
  { id: "team-mia", name: "Miami Heat", abbreviation: "MIA", logoUrl: null },
  { id: "team-gsw", name: "Golden State Warriors", abbreviation: "GSW", logoUrl: null },
];

export const seedEras: Era[] = [
  { id: "era-1980s", label: "1980s", startYear: 1980, endYear: 1989 },
  { id: "era-1990s", label: "1990s", startYear: 1990, endYear: 1999 },
  { id: "era-2000s", label: "2000s", startYear: 2000, endYear: 2009 },
  { id: "era-2010s", label: "2010s", startYear: 2010, endYear: 2019 },
  { id: "era-2020s", label: "2020s", startYear: 2020, endYear: 2029 },
];

export const seedPlayers: Player[] = [
  { id: "player-magic-johnson", name: "Magic Johnson", position: "PG", heightInches: 81, weightLbs: 215, imageUrl: null },
  { id: "player-kareem-abdul-jabbar", name: "Kareem Abdul-Jabbar", position: "C", heightInches: 86, weightLbs: 225, imageUrl: null },
  { id: "player-michael-jordan", name: "Michael Jordan", position: "SG", heightInches: 78, weightLbs: 216, imageUrl: null },
  { id: "player-scottie-pippen", name: "Scottie Pippen", position: "SF", heightInches: 80, weightLbs: 228, imageUrl: null },
  { id: "player-larry-bird", name: "Larry Bird", position: "SF", heightInches: 81, weightLbs: 220, imageUrl: null },
  { id: "player-kevin-mchale", name: "Kevin McHale", position: "PF", heightInches: 82, weightLbs: 210, imageUrl: null },
  { id: "player-dwyane-wade", name: "Dwyane Wade", position: "SG", heightInches: 76, weightLbs: 220, imageUrl: null },
  { id: "player-lebron-james", name: "LeBron James", position: "SF", heightInches: 81, weightLbs: 250, imageUrl: null },
  { id: "player-stephen-curry", name: "Stephen Curry", position: "PG", heightInches: 74, weightLbs: 185, imageUrl: null },
  { id: "player-klay-thompson", name: "Klay Thompson", position: "SG", heightInches: 78, weightLbs: 220, imageUrl: null },
  { id: "player-kobe-bryant", name: "Kobe Bryant", position: "SG", heightInches: 78, weightLbs: 212, imageUrl: null },
  { id: "player-anthony-davis", name: "Anthony Davis", position: "PF", heightInches: 82, weightLbs: 253, imageUrl: null },
  { id: "player-jimmy-butler", name: "Jimmy Butler", position: "SF", heightInches: 79, weightLbs: 230, imageUrl: null },
  { id: "player-jayson-tatum", name: "Jayson Tatum", position: "SF", heightInches: 80, weightLbs: 210, imageUrl: null },
];

export const seedPlayerVersions: PlayerVersion[] = [
  { id: "version-1980s-lal-magic", playerId: "player-magic-johnson", teamId: "team-lal", eraId: "era-1980s", label: "1980s Lakers Magic Johnson", seasonStart: 1980, seasonEnd: 1989 },
  { id: "version-1980s-lal-kareem", playerId: "player-kareem-abdul-jabbar", teamId: "team-lal", eraId: "era-1980s", label: "1980s Lakers Kareem Abdul-Jabbar", seasonStart: 1980, seasonEnd: 1989 },
  { id: "version-1990s-chi-jordan", playerId: "player-michael-jordan", teamId: "team-chi", eraId: "era-1990s", label: "1990s Bulls Michael Jordan", seasonStart: 1990, seasonEnd: 1998 },
  { id: "version-1990s-chi-pippen", playerId: "player-scottie-pippen", teamId: "team-chi", eraId: "era-1990s", label: "1990s Bulls Scottie Pippen", seasonStart: 1990, seasonEnd: 1998 },
  { id: "version-1980s-bos-bird", playerId: "player-larry-bird", teamId: "team-bos", eraId: "era-1980s", label: "1980s Celtics Larry Bird", seasonStart: 1980, seasonEnd: 1989 },
  { id: "version-1980s-bos-mchale", playerId: "player-kevin-mchale", teamId: "team-bos", eraId: "era-1980s", label: "1980s Celtics Kevin McHale", seasonStart: 1980, seasonEnd: 1989 },
  { id: "version-2000s-mia-wade", playerId: "player-dwyane-wade", teamId: "team-mia", eraId: "era-2000s", label: "2000s Heat Dwyane Wade", seasonStart: 2003, seasonEnd: 2009 },
  { id: "version-2010s-mia-lebron", playerId: "player-lebron-james", teamId: "team-mia", eraId: "era-2010s", label: "2010s Heat LeBron James", seasonStart: 2010, seasonEnd: 2014 },
  { id: "version-2010s-gsw-curry", playerId: "player-stephen-curry", teamId: "team-gsw", eraId: "era-2010s", label: "2010s Warriors Stephen Curry", seasonStart: 2010, seasonEnd: 2019 },
  { id: "version-2010s-gsw-klay", playerId: "player-klay-thompson", teamId: "team-gsw", eraId: "era-2010s", label: "2010s Warriors Klay Thompson", seasonStart: 2011, seasonEnd: 2019 },
  { id: "version-2000s-lal-kobe", playerId: "player-kobe-bryant", teamId: "team-lal", eraId: "era-2000s", label: "2000s Lakers Kobe Bryant", seasonStart: 2000, seasonEnd: 2009 },
  { id: "version-2020s-lal-lebron", playerId: "player-lebron-james", teamId: "team-lal", eraId: "era-2020s", label: "2020s Lakers LeBron James", seasonStart: 2020, seasonEnd: 2024 },
  { id: "version-2020s-lal-davis", playerId: "player-anthony-davis", teamId: "team-lal", eraId: "era-2020s", label: "2020s Lakers Anthony Davis", seasonStart: 2020, seasonEnd: 2024 },
  { id: "version-2020s-mia-butler", playerId: "player-jimmy-butler", teamId: "team-mia", eraId: "era-2020s", label: "2020s Heat Jimmy Butler", seasonStart: 2020, seasonEnd: 2024 },
  { id: "version-2020s-bos-tatum", playerId: "player-jayson-tatum", teamId: "team-bos", eraId: "era-2020s", label: "2020s Celtics Jayson Tatum", seasonStart: 2020, seasonEnd: 2024 },
];

export const seedPlayerAttributes: PlayerAttributes[] = [
  { id: "attributes-1980s-lal-magic", playerVersionId: "version-1980s-lal-magic", athleticism: 88, shooting: 86, finishing: 92, playmaking: 99, defense: 84 },
  { id: "attributes-1980s-lal-kareem", playerVersionId: "version-1980s-lal-kareem", athleticism: 84, shooting: 82, finishing: 98, playmaking: 78, defense: 93 },
  { id: "attributes-1990s-chi-jordan", playerVersionId: "version-1990s-chi-jordan", athleticism: 99, shooting: 91, finishing: 98, playmaking: 90, defense: 96 },
  { id: "attributes-1990s-chi-pippen", playerVersionId: "version-1990s-chi-pippen", athleticism: 94, shooting: 84, finishing: 88, playmaking: 89, defense: 97 },
  { id: "attributes-1980s-bos-bird", playerVersionId: "version-1980s-bos-bird", athleticism: 79, shooting: 97, finishing: 88, playmaking: 93, defense: 85 },
  { id: "attributes-1980s-bos-mchale", playerVersionId: "version-1980s-bos-mchale", athleticism: 80, shooting: 83, finishing: 96, playmaking: 75, defense: 92 },
  { id: "attributes-2000s-mia-wade", playerVersionId: "version-2000s-mia-wade", athleticism: 97, shooting: 84, finishing: 96, playmaking: 90, defense: 91 },
  { id: "attributes-2010s-mia-lebron", playerVersionId: "version-2010s-mia-lebron", athleticism: 98, shooting: 86, finishing: 99, playmaking: 96, defense: 94 },
  { id: "attributes-2010s-gsw-curry", playerVersionId: "version-2010s-gsw-curry", athleticism: 88, shooting: 99, finishing: 91, playmaking: 96, defense: 80 },
  { id: "attributes-2010s-gsw-klay", playerVersionId: "version-2010s-gsw-klay", athleticism: 84, shooting: 97, finishing: 84, playmaking: 79, defense: 91 },
  { id: "attributes-2000s-lal-kobe", playerVersionId: "version-2000s-lal-kobe", athleticism: 96, shooting: 94, finishing: 97, playmaking: 88, defense: 94 },
  { id: "attributes-2020s-lal-lebron", playerVersionId: "version-2020s-lal-lebron", athleticism: 91, shooting: 87, finishing: 96, playmaking: 97, defense: 86 },
  { id: "attributes-2020s-lal-davis", playerVersionId: "version-2020s-lal-davis", athleticism: 90, shooting: 82, finishing: 94, playmaking: 74, defense: 97 },
  { id: "attributes-2020s-mia-butler", playerVersionId: "version-2020s-mia-butler", athleticism: 88, shooting: 82, finishing: 91, playmaking: 86, defense: 94 },
  { id: "attributes-2020s-bos-tatum", playerVersionId: "version-2020s-bos-tatum", athleticism: 90, shooting: 91, finishing: 92, playmaking: 85, defense: 89 },
];
