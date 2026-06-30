import Link from "next/link";

export default function GamePage() {
  return (
    <main className="min-h-screen bg-[#171312] px-6 py-10 text-white sm:px-10">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-4xl flex-col justify-center">
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-[#f2b35e]">
          Round floor
        </p>
        <h1 className="text-4xl font-black sm:text-5xl">Game Table</h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-[#d8cbc1]">
          The foundation is ready for the first playable slice.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-12 w-fit items-center justify-center bg-white px-6 text-base font-bold text-[#171312] transition-colors hover:bg-[#f2b35e] focus:outline-none focus:ring-2 focus:ring-[#f2b35e] focus:ring-offset-2 focus:ring-offset-[#171312]"
        >
          Back Home
        </Link>
      </section>
    </main>
  );
}
