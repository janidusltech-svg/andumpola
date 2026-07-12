// app/about/page.tsx
import Link from "next/link";
import BackButton from "@/components/BackButton";

export const metadata = { title: "About — AndumPola" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-4">
        <BackButton label="Back" fallback="/" />
      </div>
      <h1 className="display text-3xl sm:text-4xl font-bold mb-2">About AndumPola</h1>
      <p className="text-berry font-medium mb-8">
        ඇඳුම්පොළ — every clothing shop, one pola.
      </p>

      <div className="prose-custom space-y-6 text-ink">
        <p>
          AndumPola is Sri Lanka&apos;s online clothing market — a single place
          where clothing shops from every corner of the island can open a
          virtual shop, and where customers can browse thousands of products
          and connect directly with the sellers.
        </p>

        <div>
          <h2 className="display text-xl font-bold mb-2">Why we built it</h2>
          <p className="text-soft">
            Many small clothing businesses in Sri Lanka make wonderful products
            but struggle to reach customers online. Building a website is
            expensive and complicated. AndumPola solves this: for a small
            monthly fee — free for the first three months — any shop can have a
            professional online presence in minutes, with no technical skills
            needed.
          </p>
        </div>

        <div>
          <h2 className="display text-xl font-bold mb-2">How it works</h2>
          <p className="text-soft">
            Shops register, add their products with photos and prices, and share
            their shop link. Customers browse by category or location, save
            their favourites, and contact shops directly by WhatsApp or phone —
            or order online where the shop offers it. All payments happen
            directly between customer and shop. AndumPola simply connects the
            two; we never handle or hold any payment.
          </p>
        </div>

        <div>
          <h2 className="display text-xl font-bold mb-2">Built by J</h2>
          <p className="text-soft">
            AndumPola is proudly built in Sri Lanka, for Sri Lankan businesses
            and shoppers.
          </p>
        </div>
      </div>

      <div className="mt-10 flex gap-3 flex-wrap">
        <Link
          href="/signup"
          className="rounded-lg bg-berry text-white font-semibold px-6 py-3 hover:bg-berry-dark"
        >
          Open your shop
        </Link>
        <Link
          href="/shops"
          className="rounded-lg border border-line font-semibold px-6 py-3 hover:border-berry"
        >
          Browse shops
        </Link>
      </div>
    </div>
  );
}
