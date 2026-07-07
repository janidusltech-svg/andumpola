// app/[shopSlug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabasePublic } from "@/lib/supabase/public";
import { Product, Shop } from "@/lib/types";
import { ProductCard } from "@/components/cards";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shopSlug: string }>;
}) {
  const { shopSlug } = await params;
  const supabase = supabasePublic();
  const { data: shop } = await supabase
    .from("shops")
    .select("name, description, city, logo_url")
    .eq("slug", shopSlug)
    .single();

  if (!shop) return { title: "Shop not found — AndumPola" };
  return {
    title: `${shop.name} — AndumPola`,
    description:
      shop.description ||
      `Shop clothing from ${shop.name}${
        shop.city ? ` in ${shop.city}` : ""
      } on AndumPola, Sri Lanka's online clothing market.`,
    openGraph: {
      title: `${shop.name} — AndumPola`,
      description: shop.description || `Clothing from ${shop.name} on AndumPola.`,
      ...(shop.logo_url ? { images: [shop.logo_url] } : {}),
    },
  };
}

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ shopSlug: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { shopSlug } = await params;
  const { category } = await searchParams;
  const supabase = supabasePublic();

  const { data: shop } = await supabase
    .from("shops")
    .select("*")
    .eq("slug", shopSlug)
    .single();

  if (!shop) notFound();
  const s = shop as Shop;

  const { data: products } = await supabase
    .from("products")
    .select("*, shops(name, slug, city), categories(name, slug)")
    .eq("shop_id", s.id)
    .eq("is_available", true)
    .order("created_at", { ascending: false });

  const all = (products ?? []) as Product[];
  const shopCategories = Array.from(
    new Map(
      all
        .filter((p) => p.categories)
        .map((p) => [p.categories!.slug, p.categories!])
    ).values()
  );
  const visible = category
    ? all.filter((p) => p.categories?.slug === category)
    : all;

  return (
    <div>
      {/* Banner */}
      <div className="h-40 sm:h-56 bg-berry/15">
        {s.banner_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={s.banner_url}
            alt=""
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="mx-auto max-w-6xl px-4">
        {/* Shop header */}
        <div className="flex items-end gap-4 -mt-10 mb-6">
          <div className="h-24 w-24 rounded-xl border-4 border-sand bg-white overflow-hidden shadow shrink-0">
            {s.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={s.logo_url}
                alt={s.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center display text-3xl font-bold text-berry">
                {s.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="pb-1 min-w-0">
            <h1 className="display text-2xl sm:text-3xl font-bold truncate">
              {s.name}
            </h1>
            <p className="text-sm text-soft">
              {[s.city, s.address].filter(Boolean).join(" · ") || "Sri Lanka"}
            </p>
          </div>
        </div>

        {s.description && (
          <p className="text-soft max-w-2xl mb-6">{s.description}</p>
        )}

        {/* Category filter within shop */}
        {shopCategories.length > 1 && (
          <div className="flex gap-2 flex-wrap mb-6">
            <Link
              href={`/${s.slug}`}
              className={`rounded-full px-3 py-1.5 text-sm border ${
                !category
                  ? "bg-berry text-white border-berry"
                  : "bg-white border-line hover:border-berry"
              }`}
            >
              All ({all.length})
            </Link>
            {shopCategories.map((c) => (
              <Link
                key={c.slug}
                href={`/${s.slug}?category=${c.slug}`}
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
        )}

        {/* Products */}
        {visible.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-12">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-soft bg-white border border-line rounded-lg p-8 text-center mb-12">
            This shop has not added products yet. Check back soon!
          </p>
        )}
      </div>
    </div>
  );
}
