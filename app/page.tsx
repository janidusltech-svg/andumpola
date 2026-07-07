// app/page.tsx
import Link from "next/link";
import { Suspense } from "react";
import { supabasePublic } from "@/lib/supabase/public";
import { Category, Product, Shop } from "@/lib/types";
import { ProductCard, ShopCard } from "@/components/cards";
import SearchBar from "@/components/SearchBar";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = supabasePublic();

  const [{ data: categories }, { data: shops }, { data: products }] =
    await Promise.all([
      supabase.from("categories").select("*").order("sort_order"),
      supabase
        .from("shops")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("products")
        .select("*, shops(name, slug, city)")
        .eq("is_available", true)
        .order("created_at", { ascending: false })
        .limit(12),
    ]);

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero */}
      <section className="py-12 sm:py-16 text-center">
        <p className="text-berry font-medium tracking-wide text-sm mb-2">
          ඇඳුම්පොළ · Sri Lanka&apos;s online clothing market
        </p>
        <h1 className="display text-4xl sm:text-5xl font-bold leading-tight">
          Every clothing shop.
          <br />
          One <span className="text-berry">pola</span>.
        </h1>
        <p className="mt-4 text-soft max-w-xl mx-auto">
          Browse shops across Sri Lanka, find what you love, and talk to the
          shop directly on WhatsApp. No middleman.
        </p>
        <div className="mt-6 flex justify-center">
          <Suspense>
            <SearchBar big />
          </Suspense>
        </div>
      </section>

      {/* Categories */}
      <section className="pb-10">
        <div className="flex gap-2 flex-wrap justify-center">
          {(categories as Category[] | null)?.map((c) => (
            <Link
              key={c.id}
              href={`/search?category=${c.slug}`}
              className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium border-t-2 border-t-turmeric hover:border-berry hover:text-berry"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Shops */}
      <section className="py-8">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="display text-2xl font-bold">Shops on the pola</h2>
          <Link href="/shops" className="text-sm text-berry font-medium">
            View all →
          </Link>
        </div>
        {shops && shops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(shops as Shop[]).map((s) => (
              <ShopCard key={s.id} shop={s} />
            ))}
          </div>
        ) : (
          <p className="text-soft text-sm bg-white border border-line rounded-lg p-6 text-center">
            Shops are opening soon. Own a clothing shop?{" "}
            <Link href="/signup" className="text-berry font-medium">
              Open your shop free →
            </Link>
          </p>
        )}
      </section>

      {/* Latest products */}
      <section className="py-8">
        <h2 className="display text-2xl font-bold mb-4">Fresh on the racks</h2>
        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {(products as Product[]).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-soft text-sm bg-white border border-line rounded-lg p-6 text-center">
            New arrivals will appear here.
          </p>
        )}
      </section>

      {/* Shop owner CTA */}
      <section className="my-12 rounded-2xl bg-berry text-white p-8 sm:p-12 text-center">
        <h2 className="display text-3xl font-bold">
          Own a clothing shop? Get online today.
        </h2>
        <p className="mt-3 text-white/85 max-w-lg mx-auto">
          Your own shop page, unlimited customers, WhatsApp orders — free for
          your first 3 months. No website costs, no commissions.
        </p>
        <Link
          href="/signup"
          className="inline-block mt-6 rounded-lg bg-turmeric text-ink font-bold px-8 py-3 hover:opacity-90"
        >
          Open your shop free
        </Link>
      </section>
    </div>
  );
}
