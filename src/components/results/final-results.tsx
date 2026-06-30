import type {
  AttributeCategory,
  CompletedCategory,
  GameRank,
} from "@/lib/game/types";

const categoryLabels: Record<AttributeCategory, string> = {
  athleticism: "Athleticism",
  shooting: "Shooting",
  finishing: "Finishing",
  playmaking: "Playmaking",
  defense: "Defense",
};

type FinalResultsProps = {
  completedCategories: readonly CompletedCategory[];
  finalRank: GameRank;
  finalScore: number;
};

export function FinalResults({
  completedCategories,
  finalRank,
  finalScore,
}: FinalResultsProps) {
  return (
    <main className="min-h-screen bg-[#171312] px-6 py-10 text-white sm:px-10">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl flex-col justify-center gap-8">
        <header className="max-w-3xl">
          <p
            data-testid="final-results-status"
            className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-[#f2b35e]"
          >
            gameComplete
          </p>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">
            Final Results
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#d8cbc1]">
            Your finished GOAT build is locked in. Every rating below came from
            the player version you chose for that category.
          </p>
        </header>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <section
            aria-label="Final build"
            className="border-2 border-[#f2b35e] bg-[#211b19] p-5 shadow-[8px_8px_0_#d8623d]"
          >
            <h2 className="text-xl font-black">Final Build</h2>
            <div className="mt-5 grid gap-3">
              {completedCategories.map((completedCategory) => (
                <ResultCategoryRow
                  completedCategory={completedCategory}
                  key={completedCategory.category}
                />
              ))}
            </div>
          </section>

          <aside
            aria-label="Final score and rank"
            className="border border-[#4d403b] bg-[#211b19] p-5"
          >
            <h2 className="text-xl font-black">Scorecard</h2>
            <dl className="mt-5 grid gap-3">
              <div
                data-testid="final-score"
                className="border border-[#f2b35e] bg-[#fff8ea] p-4 text-[#171312]"
              >
                <dt className="text-xs font-bold uppercase tracking-[0.14em] text-[#7d6d5d]">
                  Final Score
                </dt>
                <dd className="mt-2 text-4xl font-black">{finalScore}</dd>
              </div>
              <div
                data-testid="final-rank"
                className="border border-[#4d403b] bg-[#171312] p-4"
              >
                <dt className="text-xs font-bold uppercase tracking-[0.14em] text-[#f2b35e]">
                  Final Rank
                </dt>
                <dd className="mt-2 text-3xl font-black text-white">{finalRank}</dd>
              </div>
            </dl>

            <button
              data-testid="play-again-button"
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center bg-white px-5 text-base font-bold text-[#171312] transition-colors disabled:cursor-not-allowed disabled:bg-[#2c2522] disabled:text-[#95867e]"
              disabled
              type="button"
            >
              Play Again
            </button>
          </aside>
        </div>
      </section>
    </main>
  );
}

function ResultCategoryRow({
  completedCategory,
}: {
  completedCategory: CompletedCategory;
}) {
  return (
    <article
      data-testid="final-result-category"
      className="border border-[#4d403b] bg-[#171312] p-4"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#f2b35e]">
            {categoryLabels[completedCategory.category]}
          </h3>
          <p
            data-testid="final-result-player"
            className="mt-2 text-lg font-black text-white"
          >
            {completedCategory.playerName}
          </p>
          <p
            data-testid="final-result-version"
            className="mt-1 text-sm font-bold text-[#d8cbc1]"
          >
            {completedCategory.playerVersionLabel}
          </p>
          <p className="mt-1 text-xs font-bold text-[#95867e]">
            {completedCategory.teamName} / {completedCategory.eraLabel}
          </p>
        </div>
        <div
          data-testid="final-result-rating"
          className="min-w-20 border border-[#f2b35e] bg-[#fff8ea] px-3 py-2 text-center text-[#171312]"
        >
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#7d6d5d]">
            Rating
          </p>
          <p className="text-3xl font-black">{completedCategory.rating}</p>
        </div>
      </div>
    </article>
  );
}
