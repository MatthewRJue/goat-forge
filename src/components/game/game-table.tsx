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

  const handlePlayerDeselect = useCallback(() => {
    dispatch({
      type: "DESELECT_PLAYER",
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
    <main className="min-h-screen bg-[#f8f3e7] px-6 py-10 text-[#171312] sm:px-10">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl flex-col justify-center gap-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-[#9d3b2f]">
              Active game
            </p>
            <h1 className="text-4xl font-black leading-tight sm:text-5xl">
              Round {gameState.currentRound || 1} of {gameState.totalRounds}
            </h1>
          </div>
          <button
            className="inline-flex min-h-12 w-full items-center justify-center bg-[#171312] px-5 text-base font-bold text-white transition-colors hover:bg-[#352b27] focus:outline-none focus:ring-2 focus:ring-[#d8623d] focus:ring-offset-2 focus:ring-offset-[#f8f3e7] sm:w-auto"
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
            onCategorySelect={handleCategorySelect}
            onEmptyPoolSpinAgain={handleEmptyPoolSpinAgain}
            onEraRespin={handleEraRespin}
            onPlayerDeselect={handlePlayerDeselect}
            onPlayerSelect={handlePlayerSelect}
            onTeamRespin={handleTeamRespin}
            playerPoolState={playerPoolState}
          />
          <ProgressPanel gameState={gameState} />
        </div>
      </section>
    </main>
  );
}

function GameStatePanel({
  gameState,
  onCategorySelect,
  onEmptyPoolSpinAgain,
  onEraRespin,
  onPlayerDeselect,
  onPlayerSelect,
  onTeamRespin,
  playerPoolState,
}: {
  gameState: GameState;
  onCategorySelect: (category: AttributeCategory) => void;
  onEmptyPoolSpinAgain: () => Promise<void>;
  onEraRespin: () => Promise<void>;
  onPlayerDeselect: () => void;
  onPlayerSelect: (player: PlayerOption) => void;
  onTeamRespin: () => Promise<void>;
  playerPoolState: PlayerPoolState;
}) {
  return (
    <section
      aria-label="Current game state"
      className="border-2 border-[#171312] bg-[#fdfaf1] p-5 shadow-[8px_8px_0_#d8623d]"
    >
      <SpinPanel
        gameState={gameState}
        onEraRespin={onEraRespin}
        onTeamRespin={onTeamRespin}
      />

      <CategorySelectionPanel
        gameState={gameState}
        onCategorySelect={onCategorySelect}
        onPlayerDeselect={onPlayerDeselect}
      />

      {gameState.status === "selectingPlayer" ? (
        <PlayerPoolPanel
          playerPoolState={playerPoolState}
          onEmptyPoolSpinAgain={onEmptyPoolSpinAgain}
          onPlayerSelect={onPlayerSelect}
        />
      ) : null}
    </section>
  );
}

function CategorySelectionPanel({
  gameState,
  onCategorySelect,
  onPlayerDeselect,
}: {
  gameState: GameState;
  onCategorySelect: (category: AttributeCategory) => void;
  onPlayerDeselect: () => void;
}) {
  const selectedPlayer = gameState.selectedPlayerVersion;

  if (selectedPlayer === null) {
    return null;
  }

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3">
        <button
          data-testid="back-to-player-list-button"
          type="button"
          aria-label="Back to player list"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center border border-[#d8623d] bg-[#fff8ea] text-lg font-black leading-none text-[#171312] transition-colors hover:bg-[#f2b35e] focus:outline-none focus:ring-2 focus:ring-[#d8623d] focus:ring-offset-2 focus:ring-offset-[#fdfaf1]"
          onClick={onPlayerDeselect}
        >
          ←
        </button>
        <h2 className="text-xl font-black">Attribute Choice</h2>
      </div>
      <div
        data-testid="selected-player-summary"
        className="mt-4 border border-[#d6c7a8] bg-white p-4"
      >
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9d3b2f]">
          Selected player
        </p>
        <p className="mt-2 truncate text-lg font-black text-[#171312]">
          {selectedPlayer.name}
        </p>
        <p className="mt-1 truncate text-sm font-bold text-[#554943]">
          {selectedPlayer.versionLabel}
        </p>
      </div>
      <div className="mt-4 space-y-3">
        {MVP_CATEGORIES.map((category) => {
          const completedCategory = gameState.completedCategories.some(
            (completed) => completed.category === category,
          );
          const selectedCategory = gameState.selectedCategory === category;
          const availableCategory =
            gameState.status === "selectingCategory" &&
            !completedCategory &&
            gameState.availableCategories.includes(category);
          const rating = getPlayerOptionRating(selectedPlayer, category);
          const buttonLabel = categoryLabels[category];
          const statusLabel = completedCategory
            ? "Locked"
            : selectedCategory
              ? "Selected"
              : availableCategory
                ? "Apply to build"
                : "Unavailable";

          return (
            <div data-testid="category-card" key={category}>
              <button
                data-testid={
                  availableCategory ? "available-category" : "locked-category"
                }
                type="button"
                disabled={!availableCategory}
                className="w-full border border-[#d6c7a8] bg-white p-3 text-left text-[#171312] transition-colors hover:bg-[#f2b35e] focus:outline-none focus:ring-2 focus:ring-[#d8623d] focus:ring-offset-2 focus:ring-offset-[#fdfaf1] disabled:cursor-not-allowed disabled:bg-[#efe5d3] disabled:text-[#8c7b6c] sm:p-4"
                aria-pressed={selectedCategory}
                onClick={() => {
                  onCategorySelect(category);
                }}
              >
                <span className="flex min-w-0 items-center justify-between gap-3 sm:gap-5">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base font-black sm:text-lg">
                      {buttonLabel}
                    </span>
                    <span className="mt-1 block truncate text-xs font-bold uppercase text-[#7d6d5d]">
                      {statusLabel}
                    </span>
                  </span>
                  <span className="shrink-0 border border-[#171312] bg-white px-3 py-2 text-center text-[#171312]">
                    <span className="block text-[0.6rem] font-bold uppercase leading-none text-[#7d6d5d] sm:text-[0.65rem]">
                      Rating
                    </span>
                    <span className="mt-1 block text-xl font-black sm:text-2xl">
                      {completedCategory ? "--" : rating}
                    </span>
                  </span>
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PlayerPoolPanel({
  onEmptyPoolSpinAgain,
  onPlayerSelect,
  playerPoolState,
}: {
  onEmptyPoolSpinAgain: () => Promise<void>;
  onPlayerSelect: (player: PlayerOption) => void;
  playerPoolState: PlayerPoolState;
}) {
  return (
    <div
      data-testid="player-pool-panel"
      className="mt-6 border border-[#d6c7a8] bg-[#fdfaf1] p-4"
    >
      {playerPoolState.status === "loading" ? (
        <div
          data-testid="player-pool-loading"
          className="border border-[#d6c7a8] bg-white p-4 text-sm font-bold text-[#554943]"
        >
          Loading player pool
        </div>
      ) : null}

      {playerPoolState.status === "error" ? (
        <div
          role="alert"
          className="border border-[#d8623d] bg-[#fff8ea] p-4 text-[#171312]"
        >
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#9d3b2f]">
            Player pool unavailable
          </p>
          <p className="mt-2 text-base font-bold">{playerPoolState.message}</p>
        </div>
      ) : null}

      {playerPoolState.status === "ready" && playerPoolState.players.length === 0 ? (
        <div
          data-testid="player-pool-empty"
          role="alert"
          className="border border-[#d8623d] bg-[#fff8ea] p-4 text-[#171312]"
        >
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#9d3b2f]">
            No eligible players found
          </p>
          <button
            type="button"
            className="mt-4 inline-flex min-h-11 items-center justify-center border border-[#171312] bg-[#171312] px-4 text-sm font-black text-white transition-colors hover:bg-[#352b27] focus:outline-none focus:ring-2 focus:ring-[#d8623d] focus:ring-offset-2 focus:ring-offset-[#fff8ea]"
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
}: {
  onSelect: (player: PlayerOption) => void;
  player: PlayerOption;
}) {
  return (
    <button
      data-testid="player-card"
      type="button"
      className="w-full border border-[#d6c7a8] bg-white p-3 text-left text-[#171312] transition-colors hover:bg-[#f2b35e] focus:outline-none focus:ring-2 focus:ring-[#d8623d] focus:ring-offset-2 focus:ring-offset-[#fdfaf1] sm:p-4"
      onClick={() => {
        onSelect(player);
      }}
    >
      <div className="flex min-w-0 items-center justify-between gap-3 sm:gap-5">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-black sm:text-lg">
            {player.name}
          </h3>
          <p className="mt-1 truncate text-xs font-bold text-[#7d6d5d] sm:text-sm">
            {player.versionLabel}
          </p>
        </div>
        <div className="grid shrink-0 grid-cols-5 gap-1 sm:gap-2">
          {MVP_CATEGORIES.map((category) => (
            <div
              key={category}
              className="w-8 border border-[#171312] bg-white px-1 py-2 text-center sm:w-14"
            >
              <p className="text-[0.55rem] font-bold uppercase leading-none text-[#7d6d5d] sm:text-[0.65rem]">
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
    gameState.status !== "selectingPlayer" ||
    !gameState.respins.teamRespinAvailable;
  const eraRespinDisabled =
    gameState.status !== "selectingPlayer" ||
    !gameState.respins.eraRespinAvailable;
  const spinGridClass = gameState.spinError
    ? "mt-4 grid gap-3 sm:grid-cols-2"
    : "grid gap-3 sm:grid-cols-2";

  return (
    <div className="mt-6">
      {gameState.spinError ? (
        <div
          role="alert"
          className="border border-[#d8623d] bg-[#fff8ea] p-4 text-[#171312]"
        >
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#9d3b2f]">
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
      className="group inline-flex min-h-9 w-full items-center justify-between gap-3 border border-[#d8623d] bg-[#fff8ea] px-3 py-2 text-left text-xs font-black text-[#171312] transition-colors hover:bg-[#f2b35e] focus:outline-none focus:ring-2 focus:ring-[#d8623d] focus:ring-offset-2 focus:ring-offset-[#fdfaf1] disabled:cursor-not-allowed disabled:border-[#d6c7a8] disabled:bg-white disabled:text-[#8c7b6c]"
      type="button"
      disabled={disabled}
      onClick={() => {
        void onClick();
      }}
    >
      <span>{label}</span>
      <span className="text-[0.65rem] uppercase text-[#9d3b2f] group-disabled:text-[#8c7b6c]">
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
      className="flex min-h-14 items-center border border-[#d6c7a8] bg-white px-4 py-3 text-[#171312]"
    >
      <p className="min-w-0 break-words text-lg font-black sm:text-xl">
        {value}
      </p>
    </div>
  );
}

function ProgressPanel({ gameState }: { gameState: GameState }) {
  return (
    <aside
      aria-label="Build progress"
      className="border border-[#171312] bg-[#fdfaf1] p-5"
    >
      <h2 className="text-xl font-black">Build Progress</h2>
      {gameState.completedCategories.length > 0 ? (
        <div className="mt-5 space-y-3">
          {gameState.completedCategories.map((completedCategory) => (
            <div
              data-testid="completed-category"
              key={completedCategory.category}
              className="border border-[#d6c7a8] bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9d3b2f]">
                    {categoryLabels[completedCategory.category]}
                  </p>
                  <p className="mt-2 text-base font-black text-[#171312]">
                    {completedCategory.playerName}
                  </p>
                  <p className="mt-1 text-xs font-bold text-[#7d6d5d]">
                    {completedCategory.teamName} / {completedCategory.eraLabel}
                  </p>
                </div>
                <div className="min-w-16 border border-[#d6c7a8] bg-[#fdfaf1] px-3 py-2 text-center text-[#171312]">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#7d6d5d]">
                    Rating
                  </p>
                  <p className="text-2xl font-black">
                    {completedCategory.rating}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </aside>
  );
}
