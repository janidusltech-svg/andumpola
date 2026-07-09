// app/[shopSlug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabasePublic } from "@/lib/supabase/public";
import { Product, Shop } from "@/lib/types";
import { ProductCard } from "@/components/cards";
import ShareButton from "@/components/ShareButton";
import ShopMap from "@/components/ShopMap";
import Stars from "@/components/Stars";
import ReviewForm from "@/components/ReviewForm";

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

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, profiles(full_name)")
    .eq("shop_id", s.id)
    .order("created_at", { ascending: false })
    .limit(30);

  const reviewCount = reviews?.length ?? 0;
  const avgRating =
    reviewCount > 0
      ? reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;

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
    <div className="mx-auto max-w-6xl px-4">
      {/* Banner — contained, 3:1 ratio like the cropper, rounded */}
      <div className="mt-4 rounded-2xl overflow-hidden bg-berry/10 aspect-[3/1] max-h-64">
        {s.banner_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={s.banner_url}
            alt={s.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <span className="display text-3xl font-bold text-berry/40">
              {s.name}
            </span>
          </div>
        )}
      </div>

      <div>
        {/* Shop header — stacks on mobile, row on desktop */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4 -mt-10 mb-6">
          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl border-4 border-sand bg-white overflow-hidden shadow shrink-0 flex items-center justify-center p-1.5">
            {s.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={s.logo_url}
                alt={s.name}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center display text-2xl sm:text-3xl font-bold text-berry">
                {s.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="pb-1 min-w-0 flex-1">
            <h1 className="display text-2xl sm:text-3xl font-bold break-words">
              {s.name}
            </h1>
            <p className="text-sm text-soft">
              {[
                s.city,
                (s as { district?: string }).district,
                (s as { province?: string }).province
                  ? `${(s as { province?: string }).province} Province`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ") || "Sri Lanka"}
            </p>
            {reviewCount > 0 && (
              <p className="text-sm mt-0.5 flex items-center gap-1.5">
                <Stars rating={avgRating} size="text-sm" />
                <span className="font-semibold">{avgRating.toFixed(1)}</span>
                <span className="text-soft">({reviewCount} review{reviewCount > 1 ? "s" : ""})</span>
              </p>
            )}
          </div>
          <div className="pb-1 hidden sm:block">
            <ShareButton
              url={`/${s.slug}`}
              text={`Check out ${s.name} on AndumPola!`}
              label="Share shop"
            />
          </div>
        </div>

        {/* Mobile share */}
        <div className="sm:hidden mb-4">
          <ShareButton
            url={`/${s.slug}`}
            text={`Check out ${s.name} on AndumPola!`}
            label="Share this shop"
          />
        </div>

        {/* Badges: wholesale + mode */}
        <div className="flex gap-2 flex-wrap mb-4">
          {(s.shop_type === "wholesale" || s.shop_type === "both") && (
            <span className="inline-flex items-center gap-1 rounded-full bg-turmeric/15 text-turmeric border border-turmeric/40 px-3 py-1 text-xs font-semibold">
              🏷️ Wholesale{s.shop_type === "both" ? " & Retail" : ""}
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-sand border border-line px-3 py-1 text-xs font-medium">
            {s.shop_mode === "online"
              ? "🌐 Online only"
              : s.shop_mode === "physical"
              ? "🏬 Physical store"
              : "🌐 Online & 🏬 Physical"}
          </span>
        </div>

        {s.description && (
          <p className="text-soft max-w-2xl mb-6">{s.description}</p>
        )}

        {/* Location map */}
        {s.latitude != null && s.longitude != null && (
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-semibold mb-2">📍 Shop location</p>
            <ShopMap lat={s.latitude} lng={s.longitude} name={s.name} />
          </div>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-8">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-soft bg-white border border-line rounded-lg p-8 text-center mb-8">
            This shop has not added products yet. Check back soon!
          </p>
        )}

        {/* Reviews */}
        <section className="pb-12 max-w-2xl">
          <h2 className="display text-xl sm:text-2xl font-bold mb-4">
            Reviews
            {reviewCount > 0 && (
              <span className="text-soft font-normal text-base ml-2">
                {avgRating.toFixed(1)} ★ · {reviewCount}
              </span>
            )}
          </h2>

          <div className="mb-5">
            <ReviewForm shopId={s.id} />
          </div>

          {reviewCount > 0 ? (
            <div className="space-y-3">
              {reviews!.map((r) => {
                const reviewer = Array.isArray(r.profiles)
                  ? r.profiles[0]
                  : r.profiles;
                return (
                  <div
                    key={r.id}
                    className="rounded-xl bg-white border border-line p-4"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-semibold text-sm truncate">
                        {(reviewer as { full_name?: string })?.full_name ||
                          "Customer"}
                      </p>
                      <Stars rating={r.rating} size="text-sm" />
                    </div>
                    {r.comment && (
                      <p className="text-sm text-soft">{r.comment}</p>
                    )}
                    <p className="text-[11px] text-soft mt-1.5">
                      {new Date(r.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-soft">
              No reviews yet — be the first to review this shop.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
