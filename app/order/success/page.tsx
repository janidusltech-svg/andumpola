// app/order/success/page.tsx
import Link from "next/link";
import { Suspense } from "react";

function SuccessInner({ searchParams }: { searchParams: { ref?: string } }) {
  const ref = searchParams.ref;
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <div className="text-5xl mb-4">✅</div>
      <h1 className="display text-2xl font-bold">Order placed!</h1>
      <p className="text-soft mt-2">
        The shop will check their bank account and confirm your order. Save your
        reference to track it.
      </p>

      {ref && (
        <div className="mt-6 rounded-xl bg-white border border-line p-5">
          <p className="text-sm text-soft">Your order reference</p>
          <p className="display text-2xl font-bold tracking-wide mt-1">{ref}</p>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-2">
        <Link
          href={`/track${ref ? `?ref=${ref}` : ""}`}
          className="rounded-lg bg-berry text-white font-semibold py-3 hover:bg-berry-dark"
        >
          Track my order
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-line font-semibold py-3 hover:border-berry"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const sp = await searchParams;
  return (
    <Suspense>
      <SuccessInner searchParams={sp} />
    </Suspense>
  );
}
