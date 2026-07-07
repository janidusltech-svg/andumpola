// app/search/page.tsx
import Link from "next/link";
import { Suspense } from "react";
import { supabasePublic } from "@/lib/supabase/public";
import { Category, Product } from "@/lib/types";
import { ProductCard } from "@/components/cards";
import SearchBar from "@/components/SearchBar";

export const metadata = { title: "Search — AndumPola" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const supabase = supabasePublic();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  let query = supabase
    .from("products")
    .select("*, shops(name, slug, city), categories!inner(name, slug)")
    .eq("is_available", true)
    .order("created_at", { ascending: false })
    .limit(48);

  if (q && q.trim()) {
    query = query.textSearch("search_vector", q.trim(), {
      type: "websearch",
      config: "simple",
    });
  }
  if (category) {
    query = query.eq("categories.slug", category);
  }

  const { data: products } = await query;
  const activeCategory = (categories as Category[] | null)?.find(
    (c) => c.slug === category
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between mb-6">
        <h1 className="display text-3xl font-bold">
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

      <div className="flex gap-2 flex-wrap mb-8">
        <Link
          href={q ? `/search?q=${encodeURIComponent(q)}` : "/search"}
          className={`rounded-full px-3 py-1.5 text-sm border ${
            !category
              ? "bg-berry text-white border-berry"
              : "bg-white border-line hover:border-berry"
          }`}
        >
          All
        </Link>
        {(categories as Category[] | null)?.map((c) => (
          <Link
            key={c.id}
            href={`/search?${q ? `q=${encodeURIComponent(q)}&` : ""}category=${
              c.slug
            }`}
            className={`rounded-full px-3 py-1.5 text-sm border ${
              category === c.slug
                ? "bg-berry text-white border-berry"
                : "bg-white border-line hover:border-berry"
            }`}
          >
            {c.name}
          </Link>
        ))}
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
            Try a different word or browse a category above.
          </p>
        </div>
      )}
    </div>
  );
}
