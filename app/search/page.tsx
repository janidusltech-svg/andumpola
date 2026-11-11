// app/search/page.tsx
import Link from "next/link";
import { Suspense } from "react";
import { supabasePublic } from "@/lib/supabase/public";
import { Category, Product, COLORS } from "@/lib/types";
import { ProductCard } from "@/components/cards";
import SearchBar from "@/components/SearchBar";
import CategoryPicker from "@/components/CategoryPicker";
import { PROVINCES } from "@/lib/lk-locations";
import BackButton from "@/components/BackButton";
import { byPlanRank } from "@/lib/plan";

export const metadata = { title: "Search — AndumPola" };

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    province?: string;
    district?: string;
    audience?: string;
    color?: string;
    vertical?: string;
    min?: string;
    max?: string;
    size?: string;
    sort?: string;
  }>;
}) {
  const { q, category, province, district, audience, color, vertical, size, sort } =
    await searchParams;
  const sp = await searchParams;
  const min = Number(sp.min) > 0 ? String(Math.floor(Number(sp.min))) : undefined;
  const max = Number(sp.max) > 0 ? String(Math.floor(Number(sp.max))) : undefined;
  const safeSize = size && SIZE_OPTIONS.includes(size) ? size : undefined;
  const supabase = supabasePublic();

  let categoriesQuery = supabase
    .from("categories")
    .select("*")
    .order("sort_order");
  if (vertical) categoriesQuery = categoriesQuery.eq("vertical", vertical);
  const { data: categories } = await categoriesQuery;

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
    .select("*, shops!inner(name, slug, city, district, plan, status), categories!inner(name, slug)")
    .eq("is_available", true)
    .eq("shops.status", "active")
    .order(sort === "price_asc" || sort === "price_desc" ? "price" : "created_at", {
      ascending: sort === "price_asc",
    })
    .limit(48);
  if (min) query = query.gte("price", Number(min));
  if (max) query = query.lte("price", Number(max));
  // size in stock (sizes is a jsonb map like {"M": 3})
  if (safeSize) query = query.gt(`sizes->>${safeSize}`, "0");

  if (q && q.trim()) {
    query = query.textSearch("search_vector", q.trim(), {
      type: "websearch",
      config: "simple",
    });
  }
  if (category) query = query.eq("categories.slug", category);
  if (audience) query = query.eq("audience", audience);
  if (vertical) query = query.eq("vertical", vertical);
  if (color) query = query.contains("colors", [color]);
  if (shopIds) {
    // no matching shops in that area → empty result
    query = query.in("shop_id", shopIds.length ? shopIds : ["none"]);
  }

  const { data: rawProducts } = await query;
  // Default sort: Ultra shops first, then Pro/trial, then Basic.
  // Price sorts keep the exact price order.
  const products = sort
    ? rawProducts ?? []
    : byPlanRank(rawProducts ?? [], (p) => (p.shops as { plan?: string } | null)?.plan);
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
      color,
      min,
      max,
      size: safeSize,
      sort,
      ...next,
    };
    const parts = Object.entries(merged)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`);
    return `/search${parts.length ? "?" + parts.join("&") : ""}`;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
      <div className="mb-3">
        <BackButton label="Back" fallback="/" />
      </div>
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

      {/* Price, size & sort */}
      <form
        action="/search"
        className="mb-4 rounded-xl bg-white border border-line p-4"
      >
        {Object.entries({ q, category, province, district, audience, color, vertical })
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
        <p className="text-sm font-semibold mb-2">Price, size &amp; sort</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <input
            name="min"
            type="number"
            min={0}
            defaultValue={min}
            placeholder="Min Rs"
            className="rounded-lg border border-line px-3 py-2 text-sm"
          />
          <input
            name="max"
            type="number"
            min={0}
            defaultValue={max}
            placeholder="Max Rs"
            className="rounded-lg border border-line px-3 py-2 text-sm"
          />
          <select
            name="size"
            defaultValue={safeSize ?? ""}
            className="rounded-lg border border-line px-3 py-2 text-sm bg-white"
          >
            <option value="">Any size</option>
            {SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                Size {s}
              </option>
            ))}
          </select>
          <select
            name="sort"
            defaultValue={sort ?? ""}
            className="rounded-lg border border-line px-3 py-2 text-sm bg-white"
          >
            <option value="">Best match</option>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
          <button className="col-span-2 sm:col-span-1 rounded-lg bg-berry text-white text-sm font-semibold px-4 py-2">
            Apply
          </button>
        </div>
        {(min || max || safeSize || sort) && (
          <Link
            href={qs({ min: undefined, max: undefined, size: undefined, sort: undefined })}
            className="inline-block mt-2 text-xs text-berry underline"
          >
            Clear price / size / sort
          </Link>
        )}
      </form>

      {/* Colour filter */}
      <div className="mb-4 rounded-xl bg-white border border-line p-4">
        <p className="text-sm font-semibold mb-2">Filter by colour</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={qs({ color: undefined })}
            className={`rounded-full px-3 py-1.5 text-sm border ${
              !color
                ? "bg-berry text-white border-berry"
                : "bg-white border-line hover:border-berry"
            }`}
          >
            All colours
          </Link>
          {COLORS.map((c) => (
            <Link
              key={c.name}
              href={qs({ color: c.name })}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm border ${
                color === c.name
                  ? "bg-ink text-white border-ink"
                  : "bg-white border-line hover:border-berry"
              }`}
            >
              <span
                className="h-3 w-3 rounded-full border border-black/10"
                style={{ backgroundColor: c.hex }}
              />
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div className="mb-8">
        <CategoryPicker
          categories={(categories as Category[]) ?? []}
          activeSlug={category}
          activeAudience={audience}
          baseParams={{ q, province, district, color, vertical }}
          showAudience={!vertical || vertical === "clothing"}
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
