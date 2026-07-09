import Link from "next/link";

const attributes = [
  { id: "athleticism", label: "Athleticism" },
  { id: "shooting", label: "Shooting" },
  { id: "finishing", label: "Finishing" },
  { id: "playmaking", label: "Playmaking" },
  { id: "defense", label: "Defense" },
];

export default function Home() {
  return (
    <main className="court-shell">
      <section className="hero-court mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-12 px-6 py-12 sm:px-10 lg:grid lg:grid-cols-[1.1fr_420px] lg:items-center lg:gap-16">
        <div className="max-w-2xl">
          <p className="micro-label mb-5">Five-round stat draft</p>
          <h1 className="screen-title text-6xl sm:text-8xl">GOAT Builder</h1>
          <p className="body-copy mt-6 max-w-xl text-lg leading-8">
            Spin an NBA team and era, choose one player version, and lock in
            the best part of their game across five categories.
          </p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <Link
              data-testid="start-game-button"
              href="/game"
              className="primary-action inline-flex min-h-13 items-center justify-center px-8 text-base"
            >
              Start Game
            </Link>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-muted">
              5 rounds &middot; 1 build
            </p>
          </div>
        </div>

        <div
          aria-label="GOAT Builder attribute board"
          className="game-panel p-5"
        >
          <div className="mb-4 flex items-baseline justify-between border-b border-border/80 pb-4">
            <span className="panel-title">Build Sheet</span>
            <span className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-accent">
              5 slots open
            </span>
          </div>
          <ul className="space-y-2">
            {attributes.map((attribute, index) => (
              <li
                key={attribute.id}
                className={`stat-card cat-${attribute.id} cat-bar flex items-center gap-4 px-4 py-3`}
              >
                <span className="cat-ink font-mono text-xs font-bold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-base font-bold text-foreground">
                  {attribute.label}
                </span>
                <span className="stat-chip cat-chip min-w-12 px-2 py-1 text-center font-mono text-sm font-bold text-muted">
                  --
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-center font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted">
            Team + Era + Player Version
          </p>
        </div>
      </section>
    </main>
  );
}
