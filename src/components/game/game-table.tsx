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
    <main className="min-h-screen bg-[#f8f3e7] px-6 py-10 text-[#171312] sm:px-10">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl flex-col justify-center gap-8">
        <header className="max-w-3xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-[#9d3b2f]">
            Active game
          </p>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">
            Round {gameState.currentRound || 1} of {gameState.totalRounds}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#554943]">
            The board has dealt your round constraints. Pick a player from the
            pool, then choose which open skill belongs in your build.
          </p>
        </header>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <GameStatePanel
            gameState={gameState}
            onCategorySelect={handleCategorySelect}
            onEmptyPoolSpinAgain={handleEmptyPoolSpinAgain}
            onEraRespin={handleEraRespin}
            onPlayerSelect={handlePlayerSelect}
            onTeamRespin={handleTeamRespin}
            playerPoolState={playerPoolState}
          />
          <ProgressPanel gameState={gameState} startGame={startGame} />
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
  onPlayerSelect,
  onTeamRespin,
  playerPoolState,
}: {
  gameState: GameState;
  onCategorySelect: (category: AttributeCategory) => void;
  onEmptyPoolSpinAgain: () => Promise<void>;
  onEraRespin: () => Promise<void>;
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
      />

      {gameState.status === "selectingPlayer" ? (
        <PlayerPoolPanel
          currentEraLabel={gameState.currentEra?.label ?? "Unknown era"}
          currentTeamName={gameState.currentTeam?.name ?? "Unknown team"}
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
}: {
  gameState: GameState;
  onCategorySelect: (category: AttributeCategory) => void;
}) {
  const selectedPlayer = gameState.selectedPlayerVersion;

  if (selectedPlayer === null) {
    return null;
  }

  return (
    <div className="mt-6">
      <h2 className="text-xl font-black">Attribute Choice</h2>
      <div
        data-testid="selected-player-summary"
        className="mt-4 border border-[#d6c7a8] bg-white p-4"
      >
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9d3b2f]">
          Selected player
        </p>
        <p className="mt-2 text-lg font-black text-[#171312]">
          {selectedPlayer.name}
        </p>
        <p className="mt-1 text-sm font-bold text-[#554943]">
          {selectedPlayer.versionLabel}
        </p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                ? `Apply ${rating}`
                : "Unavailable";

          return (
            <div data-testid="category-card" key={category}>
              <button
                data-testid={
                  availableCategory ? "available-category" : "locked-category"
                }
                type="button"
                disabled={!availableCategory}
                className="min-h-24 w-full border border-[#d6c7a8] bg-white p-4 text-left text-[#171312] transition-colors hover:bg-[#f2b35e] focus:outline-none focus:ring-2 focus:ring-[#d8623d] focus:ring-offset-2 focus:ring-offset-[#fdfaf1] disabled:cursor-not-allowed disabled:bg-[#efe5d3] disabled:text-[#8c7b6c]"
                aria-pressed={selectedCategory}
                onClick={() => {
                  onCategorySelect(category);
                }}
              >
                <span className="block text-xs font-bold uppercase tracking-[0.14em] text-[#7d6d5d]">
                  {statusLabel}
                </span>
                <span className="mt-2 block text-lg font-black">
                  {buttonLabel}
                </span>
                {!completedCategory ? (
                  <span className="mt-3 block text-2xl font-black">{rating}</span>
                ) : null}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PlayerPoolPanel({
  currentEraLabel,
  currentTeamName,
  onEmptyPoolSpinAgain,
  onPlayerSelect,
  playerPoolState,
}: {
  currentEraLabel: string;
  currentTeamName: string;
  onEmptyPoolSpinAgain: () => Promise<void>;
  onPlayerSelect: (player: PlayerOption) => void;
  playerPoolState: PlayerPoolState;
}) {
  return (
    <div
      data-testid="player-pool-panel"
      className="mt-6 border border-[#d6c7a8] bg-[#fdfaf1] p-4"
    >
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9d3b2f]">
        Player Pool
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-lg font-black text-[#171312]">Choose a player</p>
          <p className="mt-1 text-sm font-bold text-[#554943]">
            {currentTeamName} / {currentEraLabel}
          </p>
        </div>
        {playerPoolState.status === "ready" ? (
          <p className="text-sm font-black text-[#9d3b2f]">
            {playerPoolState.players.length} available
          </p>
        ) : null}
      </div>

      {playerPoolState.status === "loading" ? (
        <div
          data-testid="player-pool-loading"
          className="mt-4 border border-[#d6c7a8] bg-white p-4 text-sm font-bold text-[#554943]"
        >
          Loading player pool
        </div>
      ) : null}

      {playerPoolState.status === "error" ? (
        <div
          role="alert"
          className="mt-4 border border-[#d8623d] bg-[#fff8ea] p-4 text-[#171312]"
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
          className="mt-4 border border-[#d8623d] bg-[#fff8ea] p-4 text-[#171312]"
        >
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#9d3b2f]">
            No eligible players found
          </p>
          <p className="mt-2 text-base font-bold">
            {currentTeamName} / {currentEraLabel}
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
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
      className="min-h-32 w-full border border-[#d6c7a8] bg-white p-4 text-left text-[#171312] transition-colors hover:bg-[#f2b35e] focus:outline-none focus:ring-2 focus:ring-[#d8623d] focus:ring-offset-2 focus:ring-offset-[#fdfaf1]"
      onClick={() => {
        onSelect(player);
      }}
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-black">{player.name}</h3>
          <p className="mt-1 text-sm font-bold text-[#7d6d5d]">
            {player.versionLabel}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {MVP_CATEGORIES.map((category) => (
            <div
              key={category}
              className="border border-[#171312] bg-white px-2 py-2 text-center"
            >
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[#7d6d5d]">
                {categoryLabels[category]}
              </p>
              <p className="text-xl font-black">
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

  return (
    <div className="mt-6">
      <h2 className="text-xl font-black">Round Spin</h2>

      {gameState.spinError ? (
        <div
          role="alert"
          className="mt-4 border border-[#d8623d] bg-[#fff8ea] p-4 text-[#171312]"
        >
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#9d3b2f]">
            Spin unavailable
          </p>
          <p className="mt-2 text-base font-bold">{gameState.spinError.message}</p>
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <SpinCard
          testId="team-display"
          label="Team"
          value={
            gameState.currentTeam
              ? `${gameState.currentTeam.name} (${gameState.currentTeam.abbreviation})`
              : "Spinning..."
          }
        />
        <SpinCard
          testId="era-display"
          label="Era"
          value={gameState.currentEra ? gameState.currentEra.label : "Spinning..."}
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <RespinButton
          disabled={teamRespinDisabled}
          label="Team Respin"
          testId="team-respin-button"
          usedRound={gameState.respins.teamRespinUsedRound}
          onClick={onTeamRespin}
        />
        <RespinButton
          disabled={eraRespinDisabled}
          label="Era Respin"
          testId="era-respin-button"
          usedRound={gameState.respins.eraRespinUsedRound}
          onClick={onEraRespin}
        />
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
      className="inline-flex min-h-12 w-full items-center justify-between gap-3 border border-[#171312] bg-[#171312] px-4 py-3 text-left text-sm font-black text-white transition-colors hover:bg-[#352b27] focus:outline-none focus:ring-2 focus:ring-[#d8623d] focus:ring-offset-2 focus:ring-offset-[#fdfaf1] disabled:cursor-not-allowed disabled:border-[#d6c7a8] disabled:bg-[#efe5d3] disabled:text-[#8c7b6c]"
      type="button"
      disabled={disabled}
      onClick={() => {
        void onClick();
      }}
    >
      <span>{label}</span>
      <span className="text-xs uppercase tracking-[0.14em]">
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
      className="min-h-28 border border-[#d6c7a8] bg-white p-4 text-[#171312]"
    >
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#7d6d5d]">
        {label}
      </p>
      <p className="mt-3 break-words text-2xl font-black">{value}</p>
    </div>
  );
}

function ProgressPanel({
  gameState,
  startGame,
}: {
  gameState: GameState;
  startGame: () => Promise<void>;
}) {
  return (
    <aside
      aria-label="Build progress"
      className="border border-[#171312] bg-[#fdfaf1] p-5"
    >
      <h2 className="text-xl font-black">Build Progress</h2>
      <dl className="mt-5 space-y-4 text-sm">
        <ProgressRow
          label="Completed categories"
          value={String(gameState.completedCategories.length)}
        />
        <ProgressRow
          label="Used player versions"
          value={String(gameState.usedPlayerVersionIds.length)}
        />
        <ProgressRow
          label="Round history"
          value={String(gameState.roundHistory.length)}
        />
        <ProgressRow
          label="Final score"
          value={gameState.finalScore === null ? "Not set" : String(gameState.finalScore)}
        />
        <ProgressRow
          label="Final rank"
          value={gameState.finalRank === null ? "Not set" : gameState.finalRank}
        />
      </dl>

      <div className="mt-6">
        <h3 className="text-sm font-black uppercase tracking-[0.14em] text-[#9d3b2f]">
          Active Build
        </h3>
        {gameState.completedCategories.length === 0 ? (
          <p className="mt-3 border border-[#d6c7a8] bg-white p-4 text-sm font-bold text-[#554943]">
            No categories completed
          </p>
        ) : (
          <div className="mt-3 space-y-3">
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
                    <p className="mt-1 text-xs font-bold text-[#554943]">
                      {completedCategory.playerVersionLabel}
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
        )}
      </div>

      <button
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center bg-[#171312] px-5 text-base font-bold text-white transition-colors hover:bg-[#352b27] focus:outline-none focus:ring-2 focus:ring-[#d8623d] focus:ring-offset-2 focus:ring-offset-[#fdfaf1]"
        type="button"
        onClick={() => {
          void startGame();
        }}
      >
        New Game
      </button>
    </aside>
  );
}

function ProgressRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#d6c7a8] pb-3">
      <dt className="text-[#554943]">{label}</dt>
      <dd className="text-right font-black text-[#171312]">{value}</dd>
    </div>
  );
}
