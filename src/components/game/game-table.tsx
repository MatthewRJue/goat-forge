"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { getEras, getPlayerPool, getTeams } from "@/data/game-data";
import { gameReducer } from "@/lib/game/game-reducer";
import { MVP_CATEGORIES, createStartedGameState } from "@/lib/game/game-state";
import { selectRandomItem } from "@/lib/game/random";
import {
  buildEligiblePlayerOptions,
  filterAndSortPlayerOptions,
  getPlayerOptionRating,
  getPlayerPoolPositions,
  type PlayerPoolSortKey,
} from "@/lib/game/player-pool";
import type {
  AttributeCategory,
  EraOption,
  GameState,
  PlayerOption,
  TeamOption,
} from "@/lib/game/types";
import { FinalResults } from "@/components/results/final-results";

const categoryLabels: Record<AttributeCategory, string> = {
  athleticism: "Athleticism",
  shooting: "Shooting",
  finishing: "Finishing",
  playmaking: "Playmaking",
  defense: "Defense",
};

const categoryShortLabels: Record<AttributeCategory, string> = {
  athleticism: "ATH",
  shooting: "SHO",
  finishing: "FIN",
  playmaking: "PLY",
  defense: "DEF",
};

const playerPoolSortLabels: Record<PlayerPoolSortKey, string> = {
  name: "Name A-Z",
  athleticism: "Athleticism",
  shooting: "Shooting",
  finishing: "Finishing",
  playmaking: "Playmaking",
  defense: "Defense",
};

const defaultPlayerPoolFilters = {
  searchQuery: "",
  position: "",
  sortKey: "name" as PlayerPoolSortKey,
};

type PlayerPoolFilters = typeof defaultPlayerPoolFilters;

type SpinAnimationTarget = "round" | "team" | "era";

const DEFAULT_SPIN_ANIMATION_DURATION_MS = 2200;
const REDUCED_SPIN_ANIMATION_DURATION_MS = 240;
const SPIN_ANIMATION_SETTLE_HOLD_MS = 1000;
const SPIN_WHEEL_STEP_MS = 150;

type SpinAnimationDetails = {
  target: SpinAnimationTarget;
  teamItems: string[];
  eraItems: string[];
  finalTeamLabel: string | null;
  finalEraLabel: string | null;
};

type RoundSpinPreview = {
  key: string;
  details: SpinAnimationDetails;
  eraRandomValue: number;
  teamRandomValue: number;
};

type PlayerPoolState =
  | {
      status: "idle";
    }
  | {
      status: "loading";
    }
  | {
      status: "ready";
      players: PlayerOption[];
    }
  | {
      status: "error";
      message: string;
    };

function gameRandom() {
  const testRandomSequence =
    typeof window !== "undefined"
      ? window.localStorage.getItem("goat-builder-test-random-sequence")
      : null;

  if (testRandomSequence) {
    const [nextValue, ...remainingValues] = testRandomSequence.split(",");
    window.localStorage.setItem(
      "goat-builder-test-random-sequence",
      remainingValues.join(","),
    );

    return Number(nextValue);
  }

  const testRandomEnabled =
    typeof window !== "undefined" &&
    window.localStorage.getItem("goat-builder-test-random") === "first";

  return process.env.NEXT_PUBLIC_E2E === "1" || testRandomEnabled
    ? 0
    : Math.random();
}

function getSpinAnimationDurationMs(prefersReducedMotion: boolean) {
  const defaultDuration = prefersReducedMotion
    ? REDUCED_SPIN_ANIMATION_DURATION_MS
    : DEFAULT_SPIN_ANIMATION_DURATION_MS;

  if (typeof window === "undefined") {
    return defaultDuration;
  }

  const testDuration = window.localStorage.getItem(
    "goat-builder-test-spin-animation-ms",
  );
  const parsedDuration = testDuration === null ? NaN : Number(testDuration);

  return Number.isFinite(parsedDuration) && parsedDuration >= 0
    ? parsedDuration
    : defaultDuration;
}

function waitForSpinAnimation(prefersReducedMotion: boolean) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, getSpinAnimationDurationMs(prefersReducedMotion));
  });
}

function takeTestRoundSpinRandomValues() {
  if (typeof window === "undefined") {
    return null;
  }

  const sequence = window.localStorage.getItem(
    "goat-builder-test-round-spin-sequence",
  );

  if (!sequence) {
    return null;
  }

  const [teamRandomValue, eraRandomValue, ...remainingValues] =
    sequence.split(",");

  window.localStorage.setItem(
    "goat-builder-test-round-spin-sequence",
    remainingValues.join(","),
  );

  if (teamRandomValue === undefined || eraRandomValue === undefined) {
    return null;
  }

  return [Number(teamRandomValue), Number(eraRandomValue)] as const;
}

function takeTestRoundSpinSelection(
  teams: readonly TeamOption[],
  eras: readonly EraOption[],
) {
  if (typeof window === "undefined") {
    return null;
  }

  const sequence = window.localStorage.getItem(
    "goat-builder-test-round-spin-selection-sequence",
  );

  if (!sequence) {
    return null;
  }

  const [nextSelection, ...remainingSelections] = sequence.split(";");

  window.localStorage.setItem(
    "goat-builder-test-round-spin-selection-sequence",
    remainingSelections.join(";"),
  );

  const [teamLookup, eraLookup] = nextSelection.split("|");
  const teamIndex = teams.findIndex(
    (team) =>
      team.id === teamLookup ||
      team.abbreviation === teamLookup ||
      team.name === teamLookup,
  );
  const eraIndex = eras.findIndex(
    (era) => era.id === eraLookup || era.label === eraLookup,
  );

  if (teamIndex === -1 || eraIndex === -1) {
    return null;
  }

  return {
    teamRandomValue: teamIndex / teams.length,
    eraRandomValue: eraIndex / eras.length,
  };
}

function randomFromValues(values: readonly number[]) {
  let index = 0;

  return () => {
    const value = values[index % values.length] ?? 0;

    index += 1;

    return value;
  };
}

function formatTeamLabel(team: TeamOption) {
  return `${team.name} (${team.abbreviation})`;
}

function formatTeamItems(teams: readonly TeamOption[]) {
  return teams.map(formatTeamLabel);
}

function formatEraItems(eras: readonly EraOption[]) {
  return eras.map((era) => era.label);
}

function createRoundSpinPreview({
  eras,
  roundNumber,
  teams,
}: {
  eras: readonly EraOption[];
  roundNumber: number;
  teams: readonly TeamOption[];
}): RoundSpinPreview {
  const testSelectionValues = takeTestRoundSpinSelection(teams, eras);
  const testRandomValues = takeTestRoundSpinRandomValues();
  const teamRandomValue =
    testSelectionValues?.teamRandomValue ?? testRandomValues?.[0] ?? gameRandom();
  const eraRandomValue =
    testSelectionValues?.eraRandomValue ?? testRandomValues?.[1] ?? gameRandom();
  const teamSelection = selectRandomItem(teams, () => teamRandomValue);
  const eraSelection = selectRandomItem(eras, () => eraRandomValue);

  return {
    key: [
      roundNumber,
      teams.map((team) => team.id).join("|"),
      eras.map((era) => era.id).join("|"),
    ].join(":"),
    details: {
      target: "round",
      teamItems: formatTeamItems(teams),
      eraItems: formatEraItems(eras),
      finalTeamLabel: teamSelection.ok
        ? formatTeamLabel(teamSelection.item)
        : null,
      finalEraLabel: eraSelection.ok ? eraSelection.item.label : null,
    },
    eraRandomValue,
    teamRandomValue,
  };
}

function subscribeToReducedMotion(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  mediaQuery.addEventListener("change", callback);

  return () => {
    mediaQuery.removeEventListener("change", callback);
  };
}

function getReducedMotionSnapshot() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function getReducedMotionServerSnapshot() {
  return false;
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
}

export function GameTable() {
  const [gameState, dispatch] = useReducer(
    gameReducer,
    undefined,
    createStartedGameState,
  );
  const [playerPoolState, setPlayerPoolState] = useState<PlayerPoolState>({
    status: "idle",
  });
  const [playerPoolFilters, setPlayerPoolFilters] = useState<PlayerPoolFilters>(
    defaultPlayerPoolFilters,
  );
  const [spinAnimationTarget, setSpinAnimationTargetState] =
    useState<SpinAnimationTarget | null>(null);
  const [spinAnimationDetails, setSpinAnimationDetails] =
    useState<SpinAnimationDetails | null>(null);
  const autoSpinRoundInFlightRef = useRef<number | null>(null);
  const gameStateRef = useRef(gameState);
  const playerPoolRequestRef = useRef(0);
  const roundSpinRequestRef = useRef(0);
  const spinAnimationTargetRef = useRef<SpinAnimationTarget | null>(null);
  const roundSpinPreviewRef = useRef<RoundSpinPreview | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);


  const setSpinAnimationTarget = useCallback(
    (target: SpinAnimationTarget | null) => {
      spinAnimationTargetRef.current = target;
      setSpinAnimationTargetState(target);
      if (target === null) {
        setSpinAnimationDetails(null);
      }
    },
    [],
  );

  const beginSpinAnimation = useCallback(
    (target: SpinAnimationTarget) => {
      if (spinAnimationTargetRef.current !== null) {
        return false;
      }

      setSpinAnimationTarget(target);
      return true;
    },
    [setSpinAnimationTarget],
  );

  const finishSpinAnimation = useCallback(
    (target: SpinAnimationTarget) => {
      if (spinAnimationTargetRef.current === target) {
        setSpinAnimationTarget(null);
      }
    },
    [setSpinAnimationTarget],
  );

  const spinAnimationActive = spinAnimationTarget !== null;

  const clearPlayerPoolFilters = useCallback(() => {
    setPlayerPoolFilters(defaultPlayerPoolFilters);
  }, []);

  const startGame = useCallback(async () => {
    setPlayerPoolState({ status: "idle" });
    clearPlayerPoolFilters();
    autoSpinRoundInFlightRef.current = null;
    roundSpinPreviewRef.current = null;
    roundSpinRequestRef.current += 1;
    setSpinAnimationTarget(null);
    dispatch({ type: "START_GAME" });
  }, [clearPlayerPoolFilters, setSpinAnimationTarget]);

  const handleTeamRespin = useCallback(async () => {
    if (!beginSpinAnimation("team")) {
      return;
    }

    setPlayerPoolState({ status: "loading" });
    clearPlayerPoolFilters();

    try {
      const teams = await getTeams();
      const alternateTeams = teams.filter(
        (team) => team.id !== gameState.currentTeam?.id,
      );
      const teamRandomValue = gameRandom();
      const teamSelection = selectRandomItem(
        alternateTeams,
        () => teamRandomValue,
      );

      setSpinAnimationDetails({
        target: "team",
        teamItems: formatTeamItems(alternateTeams),
        eraItems: gameState.currentEra ? [gameState.currentEra.label] : [],
        finalTeamLabel: teamSelection.ok
          ? formatTeamLabel(teamSelection.item)
          : gameState.currentTeam
            ? formatTeamLabel(gameState.currentTeam)
            : null,
        finalEraLabel: gameState.currentEra?.label ?? null,
      });

      await waitForSpinAnimation(prefersReducedMotion);

      dispatch({
        type: "USE_TEAM_RESPIN",
        teams,
        random: randomFromValues([teamRandomValue]),
      });
    } finally {
      finishSpinAnimation("team");
    }
  }, [
    beginSpinAnimation,
    clearPlayerPoolFilters,
    finishSpinAnimation,
    gameState.currentEra,
    gameState.currentTeam,
    prefersReducedMotion,
  ]);

  const handleEraRespin = useCallback(async () => {
    if (!beginSpinAnimation("era")) {
      return;
    }

    setPlayerPoolState({ status: "loading" });
    clearPlayerPoolFilters();

    try {
      const eras = await getEras();
      const alternateEras = eras.filter(
        (era) => era.id !== gameState.currentEra?.id,
      );
      const eraRandomValue = gameRandom();
      const eraSelection = selectRandomItem(alternateEras, () => eraRandomValue);

      setSpinAnimationDetails({
        target: "era",
        teamItems: gameState.currentTeam ? [formatTeamLabel(gameState.currentTeam)] : [],
        eraItems: formatEraItems(alternateEras),
        finalTeamLabel: gameState.currentTeam
          ? formatTeamLabel(gameState.currentTeam)
          : null,
        finalEraLabel: eraSelection.ok
          ? eraSelection.item.label
          : gameState.currentEra?.label ?? null,
      });

      await waitForSpinAnimation(prefersReducedMotion);

      dispatch({
        type: "USE_ERA_RESPIN",
        eras,
        random: randomFromValues([eraRandomValue]),
      });
    } finally {
      finishSpinAnimation("era");
    }
  }, [
    beginSpinAnimation,
    clearPlayerPoolFilters,
    finishSpinAnimation,
    gameState.currentEra,
    gameState.currentTeam,
    prefersReducedMotion,
  ]);

  const handleCategorySelect = useCallback((category: AttributeCategory) => {
    dispatch({
      type: "SELECT_CATEGORY",
      category,
    });
    setPlayerPoolState({ status: "idle" });
    clearPlayerPoolFilters();
  }, [clearPlayerPoolFilters]);

  const handleEmptyPoolSpinAgain = useCallback(async () => {
    if (!beginSpinAnimation("round")) {
      return;
    }

    setPlayerPoolState({ status: "loading" });
    clearPlayerPoolFilters();

    try {
      const [teams, eras] = await Promise.all([getTeams(), getEras()]);
      const preview = createRoundSpinPreview({
        eras,
        roundNumber: gameState.currentRound,
        teams,
      });

      setSpinAnimationDetails(preview.details);

      await waitForSpinAnimation(prefersReducedMotion);

      dispatch({
        type: "SPIN_AGAIN_FOR_EMPTY_POOL",
        teams,
        eras,
        random: randomFromValues([
          preview.teamRandomValue,
          preview.eraRandomValue,
        ]),
      });
    } finally {
      finishSpinAnimation("round");
    }
  }, [
    beginSpinAnimation,
    clearPlayerPoolFilters,
    finishSpinAnimation,
    gameState.currentRound,
    prefersReducedMotion,
  ]);

  const handlePlayerSelect = useCallback((player: PlayerOption) => {
    dispatch({
      type: "SELECT_PLAYER",
      player,
    });
  }, []);

  const usedPlayerVersionKey = gameState.usedPlayerVersionIds.join("|");

  useEffect(() => {
    if (gameState.status !== "spinning" || gameState.currentRound === 0) {
      return;
    }

    if (autoSpinRoundInFlightRef.current === gameState.currentRound) {
      return;
    }

    autoSpinRoundInFlightRef.current = gameState.currentRound;
    const requestId = roundSpinRequestRef.current + 1;
    let cancelled = false;

    roundSpinRequestRef.current = requestId;
    setSpinAnimationTarget("round");
    setPlayerPoolState({ status: "loading" });

    void Promise.all([getTeams(), getEras()])
      .then(([teams, eras]) => {
        const previewKey = [
          gameState.currentRound,
          teams.map((team) => team.id).join("|"),
          eras.map((era) => era.id).join("|"),
        ].join(":");
        const preview =
          roundSpinPreviewRef.current?.key === previewKey
            ? roundSpinPreviewRef.current
            : createRoundSpinPreview({
                eras,
                roundNumber: gameState.currentRound,
                teams,
              });

        roundSpinPreviewRef.current = preview;
        setSpinAnimationDetails(preview.details);

        return waitForSpinAnimation(prefersReducedMotion).then(() => {
          const latestGameState = gameStateRef.current;

          if (
            cancelled ||
            roundSpinRequestRef.current !== requestId ||
            latestGameState.status !== "spinning" ||
            latestGameState.currentRound !== gameState.currentRound
          ) {
            return;
          }

          dispatch({
            type: "SPIN_ROUND",
            teams,
            eras,
            random: randomFromValues([
              preview.teamRandomValue,
              preview.eraRandomValue,
            ]),
          });
          roundSpinPreviewRef.current = null;
        });
      })
      .finally(() => {
        if (cancelled) {
          return;
        }

        if (autoSpinRoundInFlightRef.current === gameState.currentRound) {
          autoSpinRoundInFlightRef.current = null;
        }

        finishSpinAnimation("round");
      });

    return () => {
      cancelled = true;

      if (autoSpinRoundInFlightRef.current === gameState.currentRound) {
        autoSpinRoundInFlightRef.current = null;
      }
    };
  }, [
    finishSpinAnimation,
    gameState.currentRound,
    gameState.status,
    prefersReducedMotion,
    setSpinAnimationTarget,
  ]);

  useEffect(() => {
    if (
      gameState.status !== "selectingPlayer" ||
      !gameState.currentTeam ||
      !gameState.currentEra
    ) {
      return;
    }

    const requestId = playerPoolRequestRef.current + 1;

    playerPoolRequestRef.current = requestId;

    void getPlayerPool(gameState.currentTeam.id, gameState.currentEra.id, {
      usedPlayerVersionIds: gameState.usedPlayerVersionIds,
    })
      .then((pool) => {
        if (playerPoolRequestRef.current !== requestId) {
          return;
        }

        setPlayerPoolState({
          status: "ready",
          players: buildEligiblePlayerOptions({
            pool,
            usedPlayerVersionIds: gameState.usedPlayerVersionIds,
          }),
        });
      })
      .catch(() => {
        if (playerPoolRequestRef.current !== requestId) {
          return;
        }

        setPlayerPoolState({
          status: "error",
          message: "Player pool unavailable.",
        });
      });
  }, [
    gameState.currentEra,
    gameState.currentTeam,
    gameState.respins.eraRespinUsedRound,
    gameState.respins.teamRespinUsedRound,
    gameState.status,
    gameState.usedPlayerVersionIds,
    usedPlayerVersionKey,
  ]);

  if (
    gameState.status === "gameComplete" &&
    gameState.finalScore !== null &&
    gameState.finalRank !== null
  ) {
    return (
      <FinalResults
        completedCategories={gameState.completedCategories}
        finalRank={gameState.finalRank}
        finalScore={gameState.finalScore}
        onPlayAgain={() => {
          void startGame();
        }}
      />
    );
  }

  return (
    <main className="court-shell px-6 py-10 sm:px-10">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl flex-col justify-center gap-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="micro-label mb-3">GOAT Builder</p>
            <h1 className="screen-title text-5xl sm:text-6xl">
              Round {gameState.currentRound || 1} of {gameState.totalRounds}
            </h1>
            <div
              aria-hidden="true"
              className="mt-4 flex items-center gap-1.5"
            >
              {Array.from({ length: gameState.totalRounds }).map(
                (_, roundIndex) => {
                  const completedRounds = gameState.completedCategories.length;
                  const dotState =
                    roundIndex < completedRounds
                      ? "is-done"
                      : roundIndex === completedRounds
                        ? "is-current"
                        : "";

                  return (
                    <span
                      key={roundIndex}
                      className={`round-dot ${dotState}`}
                    />
                  );
                },
              )}
            </div>
          </div>
          <button
            className="outline-button inline-flex min-h-12 w-full items-center justify-center px-6 text-sm sm:w-auto"
            type="button"
            onClick={() => {
              void startGame();
            }}
          >
            New Game
          </button>
        </header>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <GameStatePanel
            gameState={gameState}
            prefersReducedMotion={prefersReducedMotion}
            playerPoolFilters={playerPoolFilters}
            onEmptyPoolSpinAgain={handleEmptyPoolSpinAgain}
            onPlayerPoolFiltersChange={setPlayerPoolFilters}
            onPlayerPoolFiltersClear={clearPlayerPoolFilters}
            onEraRespin={handleEraRespin}
            onPlayerSelect={handlePlayerSelect}
            onTeamRespin={handleTeamRespin}
            playerPoolState={playerPoolState}
            spinAnimationActive={spinAnimationActive}
            spinAnimationTarget={spinAnimationTarget}
          />
          <ProgressPanel
            gameState={gameState}
            onCategorySelect={handleCategorySelect}
          />
        </div>
      </section>
      <SpinAnimationDialog
        animation={spinAnimationDetails}
        key={
          spinAnimationDetails
            ? [
                spinAnimationDetails.target,
                spinAnimationDetails.finalTeamLabel,
                spinAnimationDetails.finalEraLabel,
                spinAnimationDetails.teamItems.join("|"),
                spinAnimationDetails.eraItems.join("|"),
              ].join(":")
            : "settled"
        }
        prefersReducedMotion={prefersReducedMotion}
      />
    </main>
  );
}

function GameStatePanel({
  gameState,
  prefersReducedMotion,
  playerPoolFilters,
  onEmptyPoolSpinAgain,
  onEraRespin,
  onPlayerPoolFiltersChange,
  onPlayerPoolFiltersClear,
  onPlayerSelect,
  onTeamRespin,
  playerPoolState,
  spinAnimationActive,
  spinAnimationTarget,
}: {
  gameState: GameState;
  prefersReducedMotion: boolean;
  playerPoolFilters: PlayerPoolFilters;
  onEmptyPoolSpinAgain: () => Promise<void>;
  onEraRespin: () => Promise<void>;
  onPlayerPoolFiltersChange: (filters: PlayerPoolFilters) => void;
  onPlayerPoolFiltersClear: () => void;
  onPlayerSelect: (player: PlayerOption) => void;
  onTeamRespin: () => Promise<void>;
  playerPoolState: PlayerPoolState;
  spinAnimationActive: boolean;
  spinAnimationTarget: SpinAnimationTarget | null;
}) {
  return (
    <section
      aria-label="Current game state"
      className="game-panel p-5"
    >
      <SpinPanel
        gameState={gameState}
        prefersReducedMotion={prefersReducedMotion}
        onEraRespin={onEraRespin}
        onTeamRespin={onTeamRespin}
        spinAnimationActive={spinAnimationActive}
        spinAnimationTarget={spinAnimationTarget}
      />

      {gameState.status === "selectingPlayer" ||
      gameState.status === "selectingCategory" ? (
        <PlayerPoolPanel
          playerPoolState={playerPoolState}
          onEmptyPoolSpinAgain={onEmptyPoolSpinAgain}
          onPlayerSelect={onPlayerSelect}
          selectedPlayerVersionId={
            gameState.selectedPlayerVersion?.playerVersionId ?? null
          }
          filters={playerPoolFilters}
          onClearFilters={onPlayerPoolFiltersClear}
          onFiltersChange={onPlayerPoolFiltersChange}
        />
      ) : null}
    </section>
  );
}

function PlayerPoolPanel({
  filters,
  onClearFilters,
  onFiltersChange,
  onEmptyPoolSpinAgain,
  onPlayerSelect,
  playerPoolState,
  selectedPlayerVersionId,
}: {
  filters: PlayerPoolFilters;
  onClearFilters: () => void;
  onFiltersChange: (filters: PlayerPoolFilters) => void;
  onEmptyPoolSpinAgain: () => Promise<void>;
  onPlayerSelect: (player: PlayerOption) => void;
  playerPoolState: PlayerPoolState;
  selectedPlayerVersionId: string | null;
}) {
  const positions = useMemo(
    () =>
      playerPoolState.status === "ready"
        ? getPlayerPoolPositions(playerPoolState.players)
        : [],
    [playerPoolState],
  );
  const filteredPlayers = useMemo(
    () =>
      playerPoolState.status === "ready"
        ? filterAndSortPlayerOptions({
            players: playerPoolState.players,
            searchQuery: filters.searchQuery,
            position: filters.position,
            sortKey: filters.sortKey,
          })
        : [],
    [filters, playerPoolState],
  );
  return (
    <div
      data-testid="player-pool-panel"
      className="game-panel-plain mt-5 pt-5"
    >
      {playerPoolState.status === "loading" ? (
        <div
          data-testid="player-pool-loading"
          className="stat-strip p-4 font-mono text-xs font-bold uppercase tracking-[0.18em] text-muted"
        >
          Loading player pool
        </div>
      ) : null}

      {playerPoolState.status === "error" ? (
        <div
          role="alert"
          className="alert-panel p-4"
        >
          <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-danger">
            Player pool unavailable
          </p>
          <p className="mt-2 text-base font-bold">{playerPoolState.message}</p>
        </div>
      ) : null}

      {playerPoolState.status === "ready" && playerPoolState.players.length === 0 ? (
        <div
          data-testid="player-pool-empty"
          role="alert"
          className="alert-panel p-4"
        >
          <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-danger">
            No eligible players found
          </p>
          <button
            type="button"
            className="primary-action mt-4 inline-flex min-h-11 items-center justify-center px-4 text-sm"
            onClick={() => {
              void onEmptyPoolSpinAgain();
            }}
          >
            Spin Again
          </button>
        </div>
      ) : null}

      {playerPoolState.status === "ready" && playerPoolState.players.length > 0 ? (
        <div className="space-y-3">
          <PlayerPoolControls
            filters={filters}
            onClearFilters={onClearFilters}
            onFiltersChange={onFiltersChange}
            positions={positions}
          />

          {filteredPlayers.length === 0 ? (
            <div
              data-testid="player-pool-filtered-empty"
              role="status"
              className="stat-strip flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="text-sm font-black text-foreground">
                No players match these filters.
              </p>
              <button
                type="button"
                className="outline-button inline-flex min-h-11 items-center justify-center px-4 text-sm"
                onClick={onClearFilters}
              >
                Clear Filters
              </button>
            </div>
          ) : null}

          <div className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
            {filteredPlayers.map((player) => (
              <PlayerCard
                key={player.playerVersionId}
                onSelect={onPlayerSelect}
                player={player}
                selected={player.playerVersionId === selectedPlayerVersionId}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PlayerPoolControls({
  filters,
  onClearFilters,
  onFiltersChange,
  positions,
}: {
  filters: PlayerPoolFilters;
  onClearFilters: () => void;
  onFiltersChange: (filters: PlayerPoolFilters) => void;
  positions: string[];
}) {
  const hasActiveFilters =
    filters.searchQuery.trim().length > 0 ||
    filters.position !== "" ||
    filters.sortKey !== "name";

  return (
    <div
      aria-label="Player list controls"
      className="grid gap-2 sm:grid-cols-[1.2fr_0.8fr_1fr_auto] sm:items-end"
    >
      <label className="space-y-1.5">
        <span className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted">
          Search
        </span>
        <input
          data-testid="player-search-input"
          className="control-field min-h-11 w-full px-3 text-sm font-bold"
          type="search"
          value={filters.searchQuery}
          onChange={(event) => {
            onFiltersChange({
              ...filters,
              searchQuery: event.target.value,
            });
          }}
        />
      </label>

      <label className="space-y-1.5">
        <span className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted">
          Position
        </span>
        <select
          data-testid="player-position-filter"
          className="control-field min-h-11 w-full px-3 text-sm font-bold"
          value={filters.position}
          onChange={(event) => {
            onFiltersChange({
              ...filters,
              position: event.target.value,
            });
          }}
        >
          <option value="">All</option>
          {positions.map((position) => (
            <option
              key={position}
              value={position}
            >
              {position}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-1.5">
        <span className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted">
          Sort
        </span>
        <select
          data-testid="player-sort-select"
          className="control-field min-h-11 w-full px-3 text-sm font-bold"
          value={filters.sortKey}
          onChange={(event) => {
            onFiltersChange({
              ...filters,
              sortKey: event.target.value as PlayerPoolSortKey,
            });
          }}
        >
          {Object.entries(playerPoolSortLabels).map(([sortKey, label]) => (
            <option
              key={sortKey}
              value={sortKey}
            >
              {label}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        className="outline-button inline-flex min-h-11 items-center justify-center px-4 text-sm"
        disabled={!hasActiveFilters}
        onClick={onClearFilters}
      >
        Clear
      </button>
    </div>
  );
}

function PlayerCard({
  onSelect,
  player,
  selected,
}: {
  onSelect: (player: PlayerOption) => void;
  player: PlayerOption;
  selected: boolean;
}) {
  return (
    <button
      data-testid="player-card"
      type="button"
      aria-pressed={selected}
      className={`player-option w-full p-3 text-left sm:p-4 ${
        selected ? "is-selected" : ""
      }`}
      onClick={() => {
        onSelect(player);
      }}
    >
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
        <div className="min-w-0 sm:flex-1">
          <h3 className="truncate text-base font-bold sm:text-lg">
            {player.name}
          </h3>
          <p className="mt-2 inline-flex min-h-6 items-center rounded-full border border-accent/30 bg-accent/10 px-2.5 font-mono text-[0.65rem] font-bold uppercase tracking-[0.08em] text-accent">
            {player.position}
          </p>
        </div>
        <div className="grid w-full grid-cols-5 gap-1 sm:w-auto sm:shrink-0 sm:gap-1.5">
          {MVP_CATEGORIES.map((category) => (
            <div
              key={category}
              className={`stat-chip cat-chip cat-${category} min-w-0 px-1 py-2 text-center sm:w-14`}
            >
              <p className="cat-ink text-[0.55rem] font-bold uppercase leading-none sm:text-[0.6rem]">
                <span className="sr-only">{categoryLabels[category]}</span>
                <span aria-hidden="true">{categoryShortLabels[category]}</span>
              </p>
              <p className="mt-1 font-mono text-base font-bold sm:text-lg">
                {getPlayerOptionRating(player, category)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </button>
  );
}

function SpinPanel({
  gameState,
  prefersReducedMotion,
  onEraRespin,
  onTeamRespin,
  spinAnimationActive,
  spinAnimationTarget,
}: {
  gameState: GameState;
  prefersReducedMotion: boolean;
  onEraRespin: () => Promise<void>;
  onTeamRespin: () => Promise<void>;
  spinAnimationActive: boolean;
  spinAnimationTarget: SpinAnimationTarget | null;
}) {
  const teamRespinDisabled =
    spinAnimationActive ||
    (gameState.status !== "selectingPlayer" &&
      gameState.status !== "selectingCategory") ||
    !gameState.respins.teamRespinAvailable;
  const eraRespinDisabled =
    spinAnimationActive ||
    (gameState.status !== "selectingPlayer" &&
      gameState.status !== "selectingCategory") ||
    !gameState.respins.eraRespinAvailable;
  const spinGridClass = gameState.spinError
    ? "mt-4 grid gap-3 sm:grid-cols-2"
    : "grid gap-3 sm:grid-cols-2";

  return (
    <div>
      <div
        aria-live="polite"
        className="sr-only"
        data-animation-state={spinAnimationTarget ?? "settled"}
        data-motion-mode={prefersReducedMotion ? "reduced" : "full"}
        data-testid="spin-animation-state"
      >
        {spinAnimationTarget === null
          ? "Spin settled"
          : `${spinAnimationTarget} generating`}
      </div>
      {gameState.spinError ? (
        <div
          role="alert"
          className="alert-panel p-4"
        >
          <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-danger">
            Spin unavailable
          </p>
          <p className="mt-2 text-base font-bold">{gameState.spinError.message}</p>
        </div>
      ) : null}

      <div className={spinGridClass}>
        <div>
          <SpinCard
            isAnimating={
              spinAnimationTarget === "round" || spinAnimationTarget === "team"
            }
            testId="team-display"
            label="Team"
            action={
              <RespinButton
                disabled={teamRespinDisabled}
                isAnimating={spinAnimationTarget === "team"}
                label="Team"
                testId="team-respin-button"
                usedRound={gameState.respins.teamRespinUsedRound}
                onClick={onTeamRespin}
              />
            }
            value={
              gameState.currentTeam
                ? `${gameState.currentTeam.name} (${gameState.currentTeam.abbreviation})`
                : "Spinning..."
            }
          />
        </div>
        <div>
          <SpinCard
            isAnimating={
              spinAnimationTarget === "round" || spinAnimationTarget === "era"
            }
            testId="era-display"
            label="Era"
            action={
              <RespinButton
                disabled={eraRespinDisabled}
                isAnimating={spinAnimationTarget === "era"}
                label="Era"
                testId="era-respin-button"
                usedRound={gameState.respins.eraRespinUsedRound}
                onClick={onEraRespin}
              />
            }
            value={
              gameState.currentEra ? gameState.currentEra.label : "Spinning..."
            }
          />
        </div>
      </div>
    </div>
  );
}

function RespinButton({
  disabled,
  isAnimating,
  label,
  onClick,
  testId,
  usedRound,
}: {
  disabled: boolean;
  isAnimating: boolean;
  label: string;
  onClick: () => Promise<void>;
  testId: string;
  usedRound: number | null;
}) {
  const buttonText = isAnimating
    ? "Spinning"
    : usedRound === null
      ? "Respin"
      : `Used R${usedRound}`;

  return (
    <button
      data-testid={testId}
      className="outline-button inline-flex min-h-11 shrink-0 items-center justify-center px-3 text-xs"
      type="button"
      disabled={disabled}
      aria-busy={isAnimating}
      aria-label={`${label} ${buttonText}`}
      onClick={() => {
        void onClick();
      }}
    >
      {buttonText}
    </button>
  );
}

function SpinCard({
  isAnimating,
  action,
  label,
  testId,
  value,
}: {
  isAnimating: boolean;
  action?: ReactNode;
  label: string;
  testId: string;
  value: string;
}) {
  return (
    <div
      data-testid={testId}
      data-animation-state={isAnimating ? "generating" : "settled"}
      aria-label={label}
      aria-busy={isAnimating}
      className={`spin-result-card stat-strip min-h-24 px-4 py-3 ${
        isAnimating ? "is-generating" : ""
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted">
          {label}
        </p>
        {action}
      </div>
      <p className="min-w-0 break-words text-xl font-bold sm:text-2xl">{value}</p>
    </div>
  );
}

function SpinAnimationDialog({
  animation,
  prefersReducedMotion,
}: {
  animation: SpinAnimationDetails | null;
  prefersReducedMotion: boolean;
}) {
  const [displayIndex, setDisplayIndex] = useState(0);
  const [settled, setSettled] = useState(prefersReducedMotion);

  useEffect(() => {
    if (!animation || prefersReducedMotion || settled) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setDisplayIndex((currentIndex) => currentIndex + 1);
    }, SPIN_WHEEL_STEP_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [animation, prefersReducedMotion, settled]);

  useEffect(() => {
    if (!animation || prefersReducedMotion) {
      return;
    }

    const settleDelay = Math.max(
      getSpinAnimationDurationMs(prefersReducedMotion) -
        SPIN_ANIMATION_SETTLE_HOLD_MS,
      0,
    );
    const timeoutId = window.setTimeout(() => {
      setSettled(true);
    }, settleDelay);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [animation, prefersReducedMotion]);

  if (animation === null) {
    return null;
  }

  const { target } = animation;

  return (
    <div
      className="spin-dialog-backdrop"
      data-testid="spin-animation-dialog-backdrop"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="spin-animation-dialog-title"
        className="spin-dialog game-panel p-6 sm:p-8"
        data-animation-state={target}
        data-motion-mode={prefersReducedMotion ? "reduced" : "full"}
        data-testid="spin-animation-dialog"
      >
        <h2
          id="spin-animation-dialog-title"
          className="sr-only"
        >
          Spin result
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <SpinWheelColumn
            displayIndex={displayIndex}
            finalLabel={animation.finalTeamLabel}
            items={animation.teamItems}
            settled={settled || prefersReducedMotion}
            testId="spin-animation-team-wheel"
          />
          <SpinWheelColumn
            displayIndex={displayIndex + 2}
            finalLabel={animation.finalEraLabel}
            items={animation.eraItems}
            settled={settled || prefersReducedMotion}
            testId="spin-animation-era-wheel"
          />
        </div>
      </section>
    </div>
  );
}

function SpinWheelColumn({
  displayIndex,
  finalLabel,
  items,
  settled,
  testId,
}: {
  displayIndex: number;
  finalLabel: string | null;
  items: string[];
  settled: boolean;
  testId: string;
}) {
  const wheelItems = items.length > 0 ? items : finalLabel ? [finalLabel] : ["--"];
  const visibleLabel = settled
    ? finalLabel ?? wheelItems[0]
    : wheelItems[displayIndex % wheelItems.length];

  return (
    <div
      className={`spin-wheel-column p-4 ${settled ? "is-settled" : ""}`}
      data-testid={testId}
    >
      <div className="spin-wheel-window">
        <p
          className="spin-wheel-value"
          key={visibleLabel}
        >
          {visibleLabel}
        </p>
      </div>
    </div>
  );
}

function ProgressPanel({
  gameState,
  onCategorySelect,
}: {
  gameState: GameState;
  onCategorySelect: (category: AttributeCategory) => void;
}) {
  const selectedPlayer = gameState.selectedPlayerVersion;

  return (
    <aside
      aria-label="Build progress"
      className="game-panel-soft p-5"
    >
      <h2 className="panel-title">Build Progress</h2>
      <div className="mt-5 space-y-3">
        {MVP_CATEGORIES.map((category) => {
          const completedCategory = gameState.completedCategories.find(
            (completed) => completed.category === category,
          );
          const canApply =
            gameState.status === "selectingCategory" &&
            selectedPlayer !== null &&
            completedCategory === undefined &&
            gameState.availableCategories.includes(category);
          const rating =
            completedCategory?.rating ??
            (selectedPlayer ? getPlayerOptionRating(selectedPlayer, category) : null);
          const statusLabel = completedCategory
            ? `${completedCategory.teamName} / ${completedCategory.eraLabel}`
            : canApply
              ? selectedPlayer.name
              : selectedPlayer
                ? "Locked"
                : "Select player";

          return (
            <button
              data-testid={
                completedCategory
                  ? "completed-category"
                  : canApply
                    ? "available-category"
                    : "locked-category"
              }
              key={category}
              type="button"
              disabled={!canApply}
              className={`stat-card cat-${category} w-full p-4 text-left ${
                completedCategory
                  ? "is-complete"
                  : canApply
                    ? "is-ready"
                    : "is-locked"
              }`}
              onClick={() => {
                onCategorySelect(category);
              }}
            >
              <span className="flex items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="category-name block font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em]">
                    {categoryLabels[category]}
                  </span>
                  <span className="category-title mt-2 block truncate text-base font-bold text-foreground">
                    {completedCategory?.playerName ?? statusLabel}
                  </span>
                  {completedCategory ? (
                    <span className="category-detail mt-1 block truncate text-xs font-medium text-muted">
                      {statusLabel}
                    </span>
                  ) : null}
                </span>
                <span className="stat-chip cat-chip min-w-16 px-3 py-2 text-center">
                  <span className="block text-[0.6rem] font-bold uppercase tracking-[0.12em] text-muted">
                    Rating
                  </span>
                  <span className="block font-mono text-2xl font-bold">
                    {rating ?? "--"}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
