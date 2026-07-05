"use client";

import { useCallback, useEffect, useReducer, useState } from "react";

import { getEras, getPlayerPool, getTeams } from "@/data/game-data";
import { gameReducer } from "@/lib/game/game-reducer";
import { MVP_CATEGORIES, createStartedGameState } from "@/lib/game/game-state";
import {
  buildEligiblePlayerOptions,
  getPlayerOptionRating,
} from "@/lib/game/player-pool";
import type { AttributeCategory, GameState, PlayerOption } from "@/lib/game/types";
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

export function GameTable() {
  const [gameState, dispatch] = useReducer(
    gameReducer,
    undefined,
    createStartedGameState,
  );
  const [playerPoolState, setPlayerPoolState] = useState<PlayerPoolState>({
    status: "idle",
  });

  const startGame = useCallback(async () => {
    setPlayerPoolState({ status: "idle" });
    dispatch({ type: "START_GAME" });
  }, []);

  const handleTeamRespin = useCallback(async () => {
    const teams = await getTeams();

    setPlayerPoolState({ status: "loading" });
    dispatch({
      type: "USE_TEAM_RESPIN",
      teams,
      random: gameRandom,
    });
  }, []);

  const handleEraRespin = useCallback(async () => {
    const eras = await getEras();

    setPlayerPoolState({ status: "loading" });
    dispatch({
      type: "USE_ERA_RESPIN",
      eras,
      random: gameRandom,
    });
  }, []);

  const handleCategorySelect = useCallback((category: AttributeCategory) => {
    dispatch({
      type: "SELECT_CATEGORY",
      category,
    });
    setPlayerPoolState({ status: "idle" });
  }, []);

  const handleEmptyPoolSpinAgain = useCallback(async () => {
    setPlayerPoolState({ status: "loading" });

    const [teams, eras] = await Promise.all([getTeams(), getEras()]);

    dispatch({
      type: "SPIN_AGAIN_FOR_EMPTY_POOL",
      teams,
      eras,
      random: gameRandom,
    });
  }, []);

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

    let cancelled = false;

    void Promise.all([getTeams(), getEras()]).then(([teams, eras]) => {
      if (cancelled) {
        return;
      }

      setPlayerPoolState({ status: "loading" });
      dispatch({
        type: "SPIN_ROUND",
        teams,
        eras,
        random: gameRandom,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [gameState.currentRound, gameState.status]);

  useEffect(() => {
    if (
      gameState.status !== "selectingPlayer" ||
      !gameState.currentTeam ||
      !gameState.currentEra
    ) {
      return;
    }

    let cancelled = false;

    void getPlayerPool(gameState.currentTeam.id, gameState.currentEra.id, {
      usedPlayerVersionIds: gameState.usedPlayerVersionIds,
    })
      .then((pool) => {
        if (cancelled) {
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
        if (cancelled) {
          return;
        }

        setPlayerPoolState({
          status: "error",
          message: "Player pool unavailable.",
        });
      });

    return () => {
      cancelled = true;
    };
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
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="micro-label mb-4">
              Active stat lab
            </p>
            <h1 className="screen-title text-4xl leading-tight sm:text-5xl">
              Round {gameState.currentRound || 1} of {gameState.totalRounds}
            </h1>
            <p className="mt-3 font-mono text-sm font-black text-warning">
              {gameState.status}
            </p>
          </div>
          <button
            className="outline-button inline-flex min-h-12 w-full items-center justify-center px-5 text-base sm:w-auto"
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
            onEmptyPoolSpinAgain={handleEmptyPoolSpinAgain}
            onEraRespin={handleEraRespin}
            onPlayerSelect={handlePlayerSelect}
            onTeamRespin={handleTeamRespin}
            playerPoolState={playerPoolState}
          />
          <ProgressPanel
            gameState={gameState}
            onCategorySelect={handleCategorySelect}
          />
        </div>
      </section>
    </main>
  );
}

function GameStatePanel({
  gameState,
  onEmptyPoolSpinAgain,
  onEraRespin,
  onPlayerSelect,
  onTeamRespin,
  playerPoolState,
}: {
  gameState: GameState;
  onEmptyPoolSpinAgain: () => Promise<void>;
  onEraRespin: () => Promise<void>;
  onPlayerSelect: (player: PlayerOption) => void;
  onTeamRespin: () => Promise<void>;
  playerPoolState: PlayerPoolState;
}) {
  return (
    <section
      aria-label="Current game state"
      className="game-panel p-5"
    >
      <SpinPanel
        gameState={gameState}
        onEraRespin={onEraRespin}
        onTeamRespin={onTeamRespin}
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
        />
      ) : null}
    </section>
  );
}

function PlayerPoolPanel({
  onEmptyPoolSpinAgain,
  onPlayerSelect,
  playerPoolState,
  selectedPlayerVersionId,
}: {
  onEmptyPoolSpinAgain: () => Promise<void>;
  onPlayerSelect: (player: PlayerOption) => void;
  playerPoolState: PlayerPoolState;
  selectedPlayerVersionId: string | null;
}) {
  return (
    <div
      data-testid="player-pool-panel"
      className="game-panel-soft mt-6 p-4"
    >
      {playerPoolState.status === "loading" ? (
        <div
          data-testid="player-pool-loading"
          className="stat-strip p-4 text-sm font-bold text-muted"
        >
          Loading player pool
        </div>
      ) : null}

      {playerPoolState.status === "error" ? (
        <div
          role="alert"
          className="alert-panel p-4"
        >
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-danger">
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
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-danger">
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
        <div className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
          {playerPoolState.players.map((player) => (
            <PlayerCard
              key={player.playerVersionId}
              onSelect={onPlayerSelect}
              player={player}
              selected={player.playerVersionId === selectedPlayerVersionId}
            />
          ))}
        </div>
      ) : null}
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
          <h3 className="truncate text-base font-black sm:text-lg">
            {player.name}
          </h3>
          <p className="mt-1 truncate text-xs font-bold text-muted sm:text-sm">
            {player.versionLabel}
          </p>
        </div>
        <div className="grid w-full grid-cols-5 gap-1 sm:w-auto sm:shrink-0 sm:gap-2">
          {MVP_CATEGORIES.map((category) => (
            <div
              key={category}
              className="stat-chip min-w-0 px-1 py-2 text-center sm:w-14"
            >
              <p className="text-[0.55rem] font-bold uppercase leading-none text-accent sm:text-[0.65rem]">
                <span className="sr-only">{categoryLabels[category]}</span>
                <span aria-hidden="true">{categoryShortLabels[category]}</span>
              </p>
              <p className="mt-1 text-base font-black sm:text-xl">
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
  onEraRespin,
  onTeamRespin,
}: {
  gameState: GameState;
  onEraRespin: () => Promise<void>;
  onTeamRespin: () => Promise<void>;
}) {
  const teamRespinDisabled =
    (gameState.status !== "selectingPlayer" &&
      gameState.status !== "selectingCategory") ||
    !gameState.respins.teamRespinAvailable;
  const eraRespinDisabled =
    (gameState.status !== "selectingPlayer" &&
      gameState.status !== "selectingCategory") ||
    !gameState.respins.eraRespinAvailable;
  const spinGridClass = gameState.spinError
    ? "mt-4 grid gap-3 sm:grid-cols-2"
    : "grid gap-3 sm:grid-cols-2";

  return (
    <div className="mt-6">
      {gameState.spinError ? (
        <div
          role="alert"
          className="alert-panel p-4"
        >
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-danger">
            Spin unavailable
          </p>
          <p className="mt-2 text-base font-bold">{gameState.spinError.message}</p>
        </div>
      ) : null}

      <div className={spinGridClass}>
        <div className="space-y-2">
          <RespinButton
            disabled={teamRespinDisabled}
            label="Team Respin"
            testId="team-respin-button"
            usedRound={gameState.respins.teamRespinUsedRound}
            onClick={onTeamRespin}
          />
          <SpinCard
            testId="team-display"
            label="Team"
            value={
              gameState.currentTeam
                ? `${gameState.currentTeam.name} (${gameState.currentTeam.abbreviation})`
                : "Spinning..."
            }
          />
        </div>
        <div className="space-y-2">
          <RespinButton
            disabled={eraRespinDisabled}
            label="Era Respin"
            testId="era-respin-button"
            usedRound={gameState.respins.eraRespinUsedRound}
            onClick={onEraRespin}
          />
          <SpinCard
            testId="era-display"
            label="Era"
            value={gameState.currentEra ? gameState.currentEra.label : "Spinning..."}
          />
        </div>
      </div>
    </div>
  );
}

function RespinButton({
  disabled,
  label,
  onClick,
  testId,
  usedRound,
}: {
  disabled: boolean;
  label: string;
  onClick: () => Promise<void>;
  testId: string;
  usedRound: number | null;
}) {
  return (
    <button
      data-testid={testId}
      className="outline-button group inline-flex min-h-9 w-full items-center justify-between gap-3 px-3 py-2 text-left text-xs"
      type="button"
      disabled={disabled}
      onClick={() => {
        void onClick();
      }}
    >
      <span>{label}</span>
      <span className="text-[0.65rem] uppercase text-warning group-disabled:text-muted">
        {usedRound === null ? "Available" : `Used R${usedRound}`}
      </span>
    </button>
  );
}

function SpinCard({
  label,
  testId,
  value,
}: {
  label: string;
  testId: string;
  value: string;
}) {
  return (
    <div
      data-testid={testId}
      aria-label={label}
      className="stat-strip flex min-h-14 items-center px-4 py-3"
    >
      <p className="min-w-0 break-words text-lg font-black sm:text-xl">
        {value}
      </p>
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
      <h2 className="text-xl font-black text-foreground">Build Progress</h2>
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
            ? "Locked"
            : canApply
              ? "Apply selected player"
              : selectedPlayer
                ? "Unavailable"
                : "Select a player";

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
              className={`stat-card w-full p-4 text-left ${
                completedCategory ? "is-complete" : canApply ? "is-ready" : ""
              }`}
              onClick={() => {
                onCategorySelect(category);
              }}
            >
              <span className="flex items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="block text-xs font-bold uppercase tracking-[0.14em] text-warning">
                    {categoryLabels[category]}
                  </span>
                  <span className="mt-2 block truncate text-base font-black text-foreground">
                    {completedCategory?.playerName ??
                      selectedPlayer?.name ??
                      "Empty"}
                  </span>
                  <span className="mt-1 block truncate text-xs font-bold text-muted">
                    {completedCategory
                      ? `${completedCategory.teamName} / ${completedCategory.eraLabel}`
                      : statusLabel}
                  </span>
                </span>
                <span className="stat-chip min-w-16 px-3 py-2 text-center">
                  <span className="block text-xs font-bold uppercase tracking-[0.14em] text-accent">
                    Rating
                  </span>
                  <span className="block text-2xl font-black">
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
