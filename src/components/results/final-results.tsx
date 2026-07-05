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
  onPlayAgain: () => void;
};

export function FinalResults({
  completedCategories,
  finalRank,
  finalScore,
  onPlayAgain,
}: FinalResultsProps) {
  return (
    <main className="court-shell px-6 py-10 sm:px-10">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl flex-col justify-center gap-8">
        <header className="max-w-3xl">
          <p
            data-testid="final-results-status"
            className="micro-label mb-4"
          >
            Build complete
          </p>
          <h1 className="screen-title text-4xl leading-tight sm:text-5xl">
            Final Results
          </h1>
          <p className="body-copy mt-5 max-w-2xl text-lg leading-8">
            Your finished GOAT build is locked in. Every rating below came from
            the player version you chose for that category.
          </p>
        </header>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <section
            aria-label="Final build"
            className="game-panel p-5"
          >
            <h2 className="text-xl font-black text-foreground">Final Build</h2>
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
            className="game-panel-soft p-5"
          >
            <h2 className="text-xl font-black text-foreground">Scorecard</h2>
            <dl className="mt-5 grid gap-3">
              <div
                data-testid="final-score"
                className="stat-strip p-4"
              >
                <dt className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
                  Final Score
                </dt>
                <dd className="mt-2 font-mono text-5xl font-black text-warning">
                  {finalScore}
                </dd>
              </div>
              <div
                data-testid="final-rank"
                className="stat-strip p-4"
              >
                <dt className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
                  Final Rank
                </dt>
                <dd className="mt-2 text-3xl font-black text-foreground">
                  {finalRank}
                </dd>
              </div>
            </dl>

            <button
              data-testid="play-again-button"
              className="primary-action mt-6 inline-flex min-h-12 w-full items-center justify-center px-5 text-base"
              onClick={onPlayAgain}
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
      className="stat-card is-complete p-4"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="category-name text-xs font-bold uppercase tracking-[0.14em] text-warning">
            {categoryLabels[completedCategory.category]}
          </h3>
          <p
            data-testid="final-result-player"
            className="category-title mt-2 text-lg font-black text-foreground"
          >
            {completedCategory.playerName}
          </p>
          <p
            data-testid="final-result-version"
            className="category-detail mt-1 text-sm font-bold text-muted"
          >
            {completedCategory.playerVersionLabel}
          </p>
          <p className="category-detail mt-1 text-xs font-bold text-muted">
            {completedCategory.teamName} / {completedCategory.eraLabel}
          </p>
        </div>
        <div
          data-testid="final-result-rating"
          className="stat-chip min-w-20 px-3 py-2 text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
            Rating
          </p>
          <p className="text-3xl font-black">{completedCategory.rating}</p>
        </div>
      </div>
    </article>
  );
}
