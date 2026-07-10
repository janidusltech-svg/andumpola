// components/VerticalLanding.tsx
import Link from "next/link";
import { supabasePublic } from "@/lib/supabase/public";
import { Shop, Product } from "@/lib/types";
import { ShopCard, ProductCard } from "@/components/cards";
import { getVertical, VerticalKey } from "@/lib/verticals";

export default async function VerticalLanding({
  vertical,
}: {
  vertical: VerticalKey;
}) {
  const v = getVertical(vertical);
  const supabase = supabasePublic();

  // Only active shops in this vertical
  const { data: shops } = await supabase
    .from("shops")
    .select("*")
    .eq("vertical", vertical)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(24);

  const shopList = (shops as Shop[]) ?? [];
  const shopIds = shopList.map((s) => s.id);

  // Recent products from active shops in this vertical
  let productList: Product[] = [];
  if (shopIds.length > 0) {
    const { data: products } = await supabase
      .from("products")
      .select("*, shops(name, slug, city), categories(name, slug)")
      .eq("vertical", vertical)
      .eq("is_available", true)
      .in("shop_id", shopIds)
      .order("created_at", { ascending: false })
      .limit(12);
    productList = (products as Product[]) ?? [];
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Hero */}
      <div className="text-center py-8">
        <span className="text-5xl">{v.emoji}</span>
        <h1 className="display text-3xl sm:text-5xl font-extrabold mt-3">
          {v.label}
        </h1>
        <p className="text-soft mt-2 max-w-lg mx-auto">{v.tagline}</p>
        <div className="flex items-center justify-center gap-3 mt-5">
          <Link
            href={`/search?vertical=${vertical}`}
            className="rounded-lg bg-berry text-white font-semibold px-5 py-2.5 hover:bg-berry-dark"
          >
            Browse all {v.label.toLowerCase()}
          </Link>
          <Link
            href="/signup"
            className="rounded-lg border border-line font-semibold px-5 py-2.5 hover:border-berry"
          >
            Sell here
          </Link>
        </div>
      </div>

      {/* Category quick links */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {v.categories.slice(0, 8).map((c) => (
          <Link
            key={c}
            href={`/search?vertical=${vertical}&q=${encodeURIComponent(c)}`}
            className="rounded-full border border-line bg-white px-3 py-1.5 text-sm hover:border-berry"
          >
            {c}
          </Link>
        ))}
      </div>

      {/* Shops */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="display text-xl sm:text-2xl font-bold">
          {v.label} shops
        </h2>
        {shopList.length > 0 && (
          <Link
            href={`/search?vertical=${vertical}`}
            className="text-sm text-berry font-medium"
          >
            See all →
          </Link>
        )}
      </div>
      {shopList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {shopList.map((s) => (
            <ShopCard key={s.id} shop={s} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-white border border-line p-8 text-center mb-12">
          <p className="text-soft">
            No {v.label.toLowerCase()} shops yet — be the first!
          </p>
          <Link
            href="/signup"
            className="inline-block mt-3 rounded-lg bg-berry text-white font-semibold px-5 py-2.5 hover:bg-berry-dark"
          >
            Open your {v.label.toLowerCase()} shop
          </Link>
        </div>
      )}

      {/* Recent products */}
      {productList.length > 0 && (
        <>
          <h2 className="display text-xl sm:text-2xl font-bold mb-3">
            Latest {v.label.toLowerCase()}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {productList.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
