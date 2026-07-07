"use client";
// app/error.tsx
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="text-5xl mb-3">🧵</p>
      <h1 className="display text-2xl font-bold">Something got tangled</h1>
      <p className="text-soft mt-2">
        An unexpected error happened. It&apos;s not you — try again, and if it
        keeps happening the team will look into it.
      </p>
      <div className="mt-6 flex flex-col gap-2">
        <button
          onClick={reset}
          className="rounded-lg bg-berry text-white font-semibold py-3 hover:bg-berry-dark"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-line font-semibold py-3 hover:border-berry"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
