"use client";

import { useCallback, useEffect, useReducer } from "react";

import { getEras, getTeams } from "@/data/game-data";
import { gameReducer } from "@/lib/game/game-reducer";
import { createInitialGameState } from "@/lib/game/game-state";
import type { AttributeCategory, GameState } from "@/lib/game/types";

const categoryLabels: Record<AttributeCategory, string> = {
  athleticism: "Athleticism",
  shooting: "Shooting",
  finishing: "Finishing",
  playmaking: "Playmaking",
  defense: "Defense",
};

export function GameTable() {
  const [gameState, dispatch] = useReducer(
    gameReducer,
    undefined,
    createInitialGameState,
  );

  const startGame = useCallback(async () => {
    dispatch({ type: "START_GAME" });

    const [teams, eras] = await Promise.all([getTeams(), getEras()]);

    dispatch({
      type: "SPIN_ROUND",
      teams,
      eras,
      random: Math.random,
    });
  }, []);

  const handleTeamRespin = useCallback(async () => {
    const teams = await getTeams();

    dispatch({
      type: "USE_TEAM_RESPIN",
      teams,
      random: Math.random,
    });
  }, []);

  const handleEraRespin = useCallback(async () => {
    const eras = await getEras();

    dispatch({
      type: "USE_ERA_RESPIN",
      eras,
      random: Math.random,
    });
  }, []);

  useEffect(() => {
    void startGame();
  }, [startGame]);

  return (
    <main className="min-h-screen bg-[#171312] px-6 py-10 text-white sm:px-10">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl flex-col justify-center gap-8">
        <header className="max-w-3xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-[#f2b35e]">
            Active game
          </p>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">
            Round {gameState.currentRound || 1} of {gameState.totalRounds}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#d8cbc1]">
            The board has dealt your round constraints. Pick the best category
            for this team and era when the next step opens.
          </p>
        </header>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <GameStatePanel
            gameState={gameState}
            onEraRespin={handleEraRespin}
            onTeamRespin={handleTeamRespin}
          />
          <ProgressPanel gameState={gameState} startGame={startGame} />
        </div>
      </section>
    </main>
  );
}

function GameStatePanel({
  gameState,
  onEraRespin,
  onTeamRespin,
}: {
  gameState: GameState;
  onEraRespin: () => Promise<void>;
  onTeamRespin: () => Promise<void>;
}) {
  return (
    <section
      aria-label="Current game state"
      className="border-2 border-[#f2b35e] bg-[#211b19] p-5 shadow-[8px_8px_0_#d8623d]"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <StateMetric label="Status" value={gameState.status} />
        <StateMetric
          label="Team respin"
          value={gameState.respins.teamRespinAvailable ? "Available" : "Used"}
        />
        <StateMetric
          label="Era respin"
          value={gameState.respins.eraRespinAvailable ? "Available" : "Used"}
        />
      </div>

      <SpinPanel
        gameState={gameState}
        onEraRespin={onEraRespin}
        onTeamRespin={onTeamRespin}
      />

      <div className="mt-6">
        <h2 className="text-xl font-black">Available Categories</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {gameState.availableCategories.map((category) => (
            <div
              data-testid="available-category"
              key={category}
              className="min-h-20 border border-[#4d403b] bg-[#fff8ea] p-4 text-[#171312]"
            >
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#7d6d5d]">
                Open slot
              </p>
              <p className="mt-2 text-lg font-black">
                {categoryLabels[category]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
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
    gameState.status !== "selectingCategory" ||
    !gameState.respins.teamRespinAvailable;
  const eraRespinDisabled =
    gameState.status !== "selectingCategory" ||
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
      className="inline-flex min-h-12 w-full items-center justify-between gap-3 border border-[#f2b35e] bg-[#171312] px-4 py-3 text-left text-sm font-black text-white transition-colors hover:bg-[#352b27] focus:outline-none focus:ring-2 focus:ring-[#f2b35e] focus:ring-offset-2 focus:ring-offset-[#171312] disabled:cursor-not-allowed disabled:border-[#4d403b] disabled:bg-[#2c2522] disabled:text-[#95867e]"
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
      className="min-h-28 border border-[#4d403b] bg-[#fff8ea] p-4 text-[#171312]"
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
      className="border border-[#4d403b] bg-[#211b19] p-5"
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

      <button
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center bg-white px-5 text-base font-bold text-[#171312] transition-colors hover:bg-[#f2b35e] focus:outline-none focus:ring-2 focus:ring-[#f2b35e] focus:ring-offset-2 focus:ring-offset-[#171312]"
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

function StateMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#4d403b] bg-[#171312] p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#f2b35e]">
        {label}
      </p>
      <p className="mt-2 break-words text-xl font-black">{value}</p>
    </div>
  );
}

function ProgressRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#4d403b] pb-3">
      <dt className="text-[#d8cbc1]">{label}</dt>
      <dd className="text-right font-black text-white">{value}</dd>
    </div>
  );
}
