import { describe, expect, it } from "vitest";

import { selectRandomItem } from "@/lib/game/random";
import { createRoundSpin } from "@/lib/game/spin-round";
import type { EraOption, TeamOption } from "@/lib/game/types";

const teams: TeamOption[] = [
  { id: "team-1", name: "First Team", abbreviation: "FST" },
  { id: "team-2", name: "Last Team", abbreviation: "LST" },
];

const eras: EraOption[] = [
  { id: "era-1", label: "1980s", startYear: 1980, endYear: 1989 },
  { id: "era-2", label: "2020s", startYear: 2020, endYear: 2029 },
];

describe("random item selection", () => {
  it("can force the first item with deterministic randomness", () => {
    const result = selectRandomItem(teams, () => 0);

    expect(result).toEqual({
      ok: true,
      item: teams[0],
      index: 0,
    });
  });

  it("can force the last item with deterministic randomness", () => {
    const result = selectRandomItem(teams, () => 0.999);

    expect(result).toEqual({
      ok: true,
      item: teams[1],
      index: 1,
    });
  });

  it("returns an error when the source list is empty", () => {
    const result = selectRandomItem([], () => 0);

    expect(result).toEqual({
      ok: false,
      message: "Cannot select from an empty list.",
    });
  });
});

describe("round spin", () => {
  it("creates original and current team and era values", () => {
    const result = createRoundSpin({
      teams,
      eras,
      random: sequenceRandom(0, 0.999),
    });

    expect(result).toEqual({
      ok: true,
      spin: {
        originalTeam: teams[0],
        originalEra: eras[1],
        currentTeam: teams[0],
        currentEra: eras[1],
      },
    });
  });

  it("allows duplicate-friendly single-item selections", () => {
    const result = createRoundSpin({
      teams: [teams[0]],
      eras: [eras[0]],
      random: sequenceRandom(0, 0),
    });

    expect(result).toEqual({
      ok: true,
      spin: {
        originalTeam: teams[0],
        originalEra: eras[0],
        currentTeam: teams[0],
        currentEra: eras[0],
      },
    });
  });

  it("reports missing teams", () => {
    const result = createRoundSpin({
      teams: [],
      eras,
      random: sequenceRandom(0),
    });

    expect(result).toEqual({
      ok: false,
      message: "No teams are available. Add team data before starting a round.",
    });
  });

  it("reports missing eras", () => {
    const result = createRoundSpin({
      teams,
      eras: [],
      random: sequenceRandom(0),
    });

    expect(result).toEqual({
      ok: false,
      message: "No eras are available. Add era data before starting a round.",
    });
  });

  it("reports no usable spin data when both sources are empty", () => {
    const result = createRoundSpin({
      teams: [],
      eras: [],
      random: sequenceRandom(0),
    });

    expect(result).toEqual({
      ok: false,
      message:
        "No usable spin data is available. Add at least one team and one era before starting a round.",
    });
  });
});

function sequenceRandom(...values: number[]) {
  let index = 0;

  return () => values[index++] ?? 0;
}
