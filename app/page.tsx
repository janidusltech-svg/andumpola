// app/page.tsx
import Link from "next/link";
import { Suspense } from "react";
import { supabasePublic } from "@/lib/supabase/public";
import { Category, Product, Shop } from "@/lib/types";
import { ProductCard, ShopCard } from "@/components/cards";
import SearchBar from "@/components/SearchBar";
import CategoryPicker from "@/components/CategoryPicker";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = supabasePublic();

  const [
    { data: categories },
    { data: shops },
    { data: products },
    { count: shopCount },
    { count: productCount },
  ] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase
      .from("shops")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("products")
      .select("*, shops(name, slug, city)")
      .eq("is_available", true)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("shops")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_available", true),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6">
      {/* Hero */}
      <section className="text-center pt-16 pb-10">
        <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-berry bg-rose-soft px-3.5 py-1.5 rounded-full mb-6">
          <span className="text-[8px]">●</span> Sri Lanka&apos;s online clothing
          market
        </span>
        <h1 className="display text-5xl sm:text-6xl font-extrabold leading-[1.02]">
          Every clothing shop.
          <br />
          One <span className="text-berry">pola</span>.
        </h1>
        <p className="mt-5 text-soft text-lg max-w-lg mx-auto">
          Browse hundreds of local shops, find what you love, and message them
          directly. No middleman, no markup.
        </p>
        <div className="mt-8 flex justify-center">
          <Suspense>
            <SearchBar big />
          </Suspense>
        </div>

        {/* Trust stats */}
        <div className="mt-8 flex gap-9 justify-center">
          <Stat value={`${shopCount ?? 0}+`} label="Shops" />
          <Stat value={`${productCount ?? 0}+`} label="Products" />
          <Stat value="9" label="Provinces" />
        </div>
      </section>

      {/* Categories */}
      <section className="pb-6">
        <div className="max-w-3xl mx-auto">
          <CategoryPicker categories={(categories as Category[]) ?? []} />
        </div>
      </section>

      {/* Shops */}
      <section className="py-10">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="display text-2xl font-bold">Shops on the pola</h2>
          <Link href="/shops" className="text-sm text-berry font-semibold">
            View all →
          </Link>
        </div>
        {shops && shops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(shops as Shop[]).map((s) => (
              <ShopCard key={s.id} shop={s} />
            ))}
          </div>
        ) : (
          <EmptyNote>
            Shops are opening soon.{" "}
            <Link href="/signup" className="text-berry font-medium">
              Open your shop free →
            </Link>
          </EmptyNote>
        )}
      </section>

      {/* Products */}
      <section className="pb-10">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="display text-2xl font-bold">Fresh on the racks</h2>
          <Link href="/search" className="text-sm text-berry font-semibold">
            Browse all →
          </Link>
        </div>
        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {(products as Product[]).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <EmptyNote>New arrivals will appear here.</EmptyNote>
        )}
      </section>

      {/* Shop owner CTA */}
      <section className="my-14 rounded-3xl bg-gradient-to-br from-berry to-berry-dark text-white p-10 sm:p-14 text-center">
        <h2 className="display text-3xl sm:text-4xl font-extrabold">
          Own a clothing shop? Get online today.
        </h2>
        <p className="mt-3 text-white/90 max-w-lg mx-auto">
          Your own shop page, unlimited customers, WhatsApp orders — free for
          your first 3 months. No website costs, no commissions.
        </p>
        <Link
          href="/signup"
          className="inline-block mt-7 rounded-xl bg-white text-berry font-bold px-8 py-3.5 hover:bg-white/90"
        >
          Open your shop free
        </Link>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <span className="display text-2xl font-bold block">{value}</span>
      <span className="text-soft text-[13px]">{label}</span>
    </div>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-soft text-sm bg-sand border border-line rounded-2xl p-8 text-center">
      {children}
    </p>
  );
}
