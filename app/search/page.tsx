// app/search/page.tsx
import Link from "next/link";
import { Suspense } from "react";
import { supabasePublic } from "@/lib/supabase/public";
import { Category, Product } from "@/lib/types";
import { ProductCard } from "@/components/cards";
import SearchBar from "@/components/SearchBar";
import CategoryPicker from "@/components/CategoryPicker";
import { PROVINCES } from "@/lib/lk-locations";

export const metadata = { title: "Search — AndumPola" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    province?: string;
    district?: string;
    audience?: string;
  }>;
}) {
  const { q, category, province, district, audience } = await searchParams;
  const supabase = supabasePublic();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  // If filtering by province/district, first find matching shop ids
  let shopIds: string[] | null = null;
  if (province || district) {
    let shopQuery = supabase.from("shops").select("id").eq("status", "active");
    if (province) shopQuery = shopQuery.eq("province", province);
    if (district) shopQuery = shopQuery.eq("district", district);
    const { data: shops } = await shopQuery;
    shopIds = (shops ?? []).map((s) => s.id);
  }

  let query = supabase
    .from("products")
    .select("*, shops(name, slug, city, district), categories!inner(name, slug)")
    .eq("is_available", true)
    .order("created_at", { ascending: false })
    .limit(48);

  if (q && q.trim()) {
    query = query.textSearch("search_vector", q.trim(), {
      type: "websearch",
      config: "simple",
    });
  }
  if (category) query = query.eq("categories.slug", category);
  if (audience) query = query.eq("audience", audience);
  if (shopIds) {
    // no matching shops in that area → empty result
    query = query.in("shop_id", shopIds.length ? shopIds : ["none"]);
  }

  const { data: products } = await query;
  const activeCategory = (categories as Category[] | null)?.find(
    (c) => c.slug === category
  );

  const selectedProvince = PROVINCES.find((p) => p.name === province);

  // helper to build a query string preserving other filters
  function qs(next: Record<string, string | undefined>) {
    const merged: Record<string, string | undefined> = {
      q,
      category,
      province,
      district,
      audience,
      ...next,
    };
    const parts = Object.entries(merged)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`);
    return `/search${parts.length ? "?" + parts.join("&") : ""}`;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between mb-6">
        <h1 className="display text-2xl sm:text-3xl font-bold">
          {q
            ? `Results for "${q}"`
            : activeCategory
            ? activeCategory.name
            : "Search the pola"}
        </h1>
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>

      {/* Location filter */}
      <div className="mb-4 rounded-xl bg-white border border-line p-4">
        <p className="text-sm font-semibold mb-2">Filter by location</p>
        <div className="flex flex-wrap gap-2 items-center">
          <Link
            href={qs({ province: undefined, district: undefined })}
            className={`rounded-full px-3 py-1.5 text-sm border ${
              !province
                ? "bg-berry text-white border-berry"
                : "bg-white border-line hover:border-berry"
            }`}
          >
            All Sri Lanka
          </Link>
          {PROVINCES.map((p) => (
            <Link
              key={p.slug}
              href={qs({ province: p.name, district: undefined })}
              className={`rounded-full px-3 py-1.5 text-sm border ${
                province === p.name
                  ? "bg-berry text-white border-berry"
                  : "bg-white border-line hover:border-berry"
              }`}
            >
              {p.name}
            </Link>
          ))}
        </div>

        {/* Districts of the selected province */}
        {selectedProvince && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-line">
            <Link
              href={qs({ district: undefined })}
              className={`rounded-full px-3 py-1 text-xs border ${
                !district
                  ? "bg-ink text-white border-ink"
                  : "bg-white border-line hover:border-berry"
              }`}
            >
              All {selectedProvince.name}
            </Link>
            {selectedProvince.districts.map((d) => (
              <Link
                key={d}
                href={qs({ district: d })}
                className={`rounded-full px-3 py-1 text-xs border ${
                  district === d
                    ? "bg-ink text-white border-ink"
                    : "bg-white border-line hover:border-berry"
                }`}
              >
                {d}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Category filter */}
      <div className="mb-8">
        <CategoryPicker
          categories={(categories as Category[]) ?? []}
          activeSlug={category}
          activeAudience={audience}
          baseParams={{ q, province, district }}
        />
      </div>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {(products as Product[]).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-line rounded-lg">
          <p className="display text-xl font-semibold">Nothing found</p>
          <p className="text-soft text-sm mt-1">
            Try a different word, category, or location.
          </p>
        </div>
      )}
    </div>
  );
}
