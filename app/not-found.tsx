// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="display text-6xl font-bold text-berry">404</p>
      <h1 className="display text-2xl font-bold mt-2">
        This rack is empty
      </h1>
      <p className="text-soft mt-2">
        The page you&apos;re looking for doesn&apos;t exist — maybe the shop
        changed its name, or the link is broken.
      </p>
      <div className="mt-6 flex flex-col gap-2">
        <Link
          href="/"
          className="rounded-lg bg-berry text-white font-semibold py-3 hover:bg-berry-dark"
        >
          Back to the pola
        </Link>
        <Link
          href="/search"
          className="rounded-lg border border-line font-semibold py-3 hover:border-berry"
        >
          Search products
        </Link>
      </div>
    </div>
  );
}
