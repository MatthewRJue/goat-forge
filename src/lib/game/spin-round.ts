import { selectRandomItem, type RandomFn } from "@/lib/game/random";
import type { EraOption, TeamOption } from "@/lib/game/types";

type CreateRoundSpinInput = {
  teams: readonly TeamOption[];
  eras: readonly EraOption[];
  random: RandomFn;
};

export type RoundSpin = {
  originalTeam: TeamOption;
  originalEra: EraOption;
  currentTeam: TeamOption;
  currentEra: EraOption;
};

export type RoundSpinResult =
  | {
      ok: true;
      spin: RoundSpin;
    }
  | {
      ok: false;
      message: string;
    };

export function createRoundSpin({
  teams,
  eras,
  random,
}: CreateRoundSpinInput): RoundSpinResult {
  if (teams.length === 0 && eras.length === 0) {
    return {
      ok: false,
      message:
        "No usable spin data is available. Add at least one team and one era before starting a round.",
    };
  }

  if (teams.length === 0) {
    return {
      ok: false,
      message: "No teams are available. Add team data before starting a round.",
    };
  }

  if (eras.length === 0) {
    return {
      ok: false,
      message: "No eras are available. Add era data before starting a round.",
    };
  }

  const teamSelection = selectRandomItem(teams, random);
  const eraSelection = selectRandomItem(eras, random);

  if (!teamSelection.ok || !eraSelection.ok) {
    return {
      ok: false,
      message:
        "No usable spin data is available. Add at least one team and one era before starting a round.",
    };
  }

  return {
    ok: true,
    spin: {
      originalTeam: teamSelection.item,
      originalEra: eraSelection.item,
      currentTeam: teamSelection.item,
      currentEra: eraSelection.item,
    },
  };
}
