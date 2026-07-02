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
              className="arcade-button inline-flex min-h-12 items-center justify-center px-6 text-base"
            >
              Start Game
            </Link>
            <div className="scoreboard inline-flex min-h-12 items-center justify-center px-4 font-mono text-sm font-black text-[#19d3c5]">
              5 ROUNDS / 1 BUILD
            </div>
          </div>
        </div>

        <div
          aria-label="GOAT Builder attribute board"
          className="arcade-panel p-4"
        >
          <div className="scoreboard mb-4 flex items-center justify-between px-4 py-3">
            <span className="font-mono text-xs font-black uppercase text-[#aab7c8]">
              Attribute Console
            </span>
            <span className="font-mono text-xl font-black text-[#ffd166]">
              000
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {attributes.map((attribute, index) => (
              <div
                key={attribute}
                className="stat-card min-h-24 p-4"
              >
                <p className="font-mono text-xs font-black uppercase text-[#19d3c5]">
                  Slot {index + 1}
                </p>
                <p className="mt-3 text-lg font-black text-[#fff7e8]">
                  {attribute}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-[1fr_72px] gap-3">
            <div className="scoreboard px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#fff7e8]">
              Draft a legend
            </div>
            <div className="grid place-items-center rounded-full border-4 border-[#1f2937] bg-[#f47c20] font-mono text-xl font-black text-[#111827] shadow-[inset_-8px_-8px_0_rgba(124,45,18,0.35)]">
              24
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
