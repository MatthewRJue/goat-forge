import Link from "next/link";

const attributes = [
  "Athleticism",
  "Shooting",
  "Finishing",
  "Playmaking",
  "Defense",
];

export default function Home() {
  return (
    <main className="court-shell">
      <section className="hero-court mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-10 px-6 py-10 sm:px-10 lg:grid lg:grid-cols-[1fr_440px] lg:items-center">
        <div className="max-w-2xl">
          <p className="micro-label mb-4">
            Five-round stat draft
          </p>
          <h1 className="screen-title text-5xl leading-none sm:text-7xl">
            GOAT Builder
          </h1>
          <p className="body-copy mt-6 max-w-xl text-lg leading-8">
            Spin an NBA team and era, choose one player version, and lock in
            the best part of their game across five categories.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              data-testid="start-game-button"
              href="/game"
              className="primary-action inline-flex min-h-12 items-center justify-center px-6 text-base"
            >
              Start Game
            </Link>
            <div className="stat-strip inline-flex min-h-12 items-center justify-center px-4 font-mono text-sm font-black text-[#36c4b4]">
              5 ROUNDS / 1 BUILD
            </div>
          </div>
        </div>

        <div
          aria-label="GOAT Builder attribute board"
          className="game-panel p-4"
        >
          <div className="stat-strip mb-4 flex items-center justify-between px-4 py-3">
            <span className="font-mono text-xs font-black uppercase text-[#aab7c8]">
              Build Sheet
            </span>
            <span className="font-mono text-sm font-black uppercase text-[#e9bd6a]">
              Live
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {attributes.map((attribute, index) => (
              <div
                key={attribute}
                className="stat-card min-h-24 p-4"
              >
                <p className="font-mono text-xs font-black uppercase text-[#36c4b4]">
                  Slot {index + 1}
                </p>
                <p className="mt-3 text-lg font-black text-[#f7f2e8]">
                  {attribute}
                </p>
              </div>
            ))}
          </div>
          <div className="stat-strip mt-4 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#f7f2e8]">
            Team + Era + Player Version
          </div>
        </div>
      </section>
    </main>
  );
}
