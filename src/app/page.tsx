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
    <main className="min-h-screen bg-[#f8f3e7] text-[#171312]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-12 px-6 py-10 sm:px-10 lg:grid lg:grid-cols-[1fr_420px] lg:items-center">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-[#9d3b2f]">
            Build the all-time player
          </p>
          <h1 className="text-5xl font-black leading-none text-[#171312] sm:text-6xl">
            GOAT Builder
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#554943]">
            Spin an NBA team and era, choose one player version, and lock in
            the best part of their game across five categories.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              data-testid="start-game-button"
              href="/game"
              className="inline-flex min-h-12 items-center justify-center bg-[#171312] px-6 text-base font-bold text-white transition-colors hover:bg-[#352b27] focus:outline-none focus:ring-2 focus:ring-[#d8623d] focus:ring-offset-2"
            >
              Start Game
            </Link>
          </div>
        </div>

        <div
          aria-label="GOAT Builder attribute board"
          className="border-2 border-[#171312] bg-[#fdfaf1] p-4 shadow-[8px_8px_0_#d8623d]"
        >
          <div className="grid grid-cols-2 gap-3">
            {attributes.map((attribute, index) => (
              <div
                key={attribute}
                className="min-h-24 border border-[#d6c7a8] bg-white p-4"
              >
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#7d6d5d]">
                  Slot {index + 1}
                </p>
                <p className="mt-3 text-lg font-black text-[#171312]">
                  {attribute}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 border border-[#171312] bg-[#d8623d] px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-white">
            5 rounds. 1 build.
          </div>
        </div>
      </section>
    </main>
  );
}
