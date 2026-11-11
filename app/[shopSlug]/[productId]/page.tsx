// app/[shopSlug]/[productId]/page.tsx
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { supabasePublic } from "@/lib/supabase/public";
import { Product, formatLKR, audienceLabel, colorHex } from "@/lib/types";
import BackButton from "@/components/BackButton";
import OrderOnWhatsApp from "@/components/OrderOnWhatsApp";
import OrderButton from "@/components/OrderButton";
import SaveButton from "@/components/SaveButton";
import ShareButton from "@/components/ShareButton";
import ProductGallery from "@/components/ProductGallery";
import TrackView from "@/components/TrackView";
import { planInfo } from "@/lib/plan";
import DeliveryInfo from "@/components/DeliveryInfo";
import { T } from "@/lib/i18n";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shopSlug: string; productId: string }>;
}) {
  const { productId } = await params;
  const supabase = supabasePublic();
  const { data: product } = await supabase
    .from("products")
    .select("title, description, price, compare_at_price, images, shops(name)")
    .eq("id", productId)
    .single();

  if (!product) return { title: "Product not found — AndumPola" };
  const shop = Array.isArray(product.shops)
    ? product.shops[0]
    : product.shops;
  const price = `Rs ${Number(product.price).toLocaleString("en-LK")}`;
  const onSale =
    product.compare_at_price && product.compare_at_price > product.price;
  // Price in the title so it shows in WhatsApp / Facebook link previews
  const title = `${product.title} · ${price}${onSale ? " (SALE)" : ""} — ${
    shop?.name ?? "AndumPola"
  }`;
  const description =
    product.description?.slice(0, 150) ||
    `${product.title} for Rs ${Number(product.price).toLocaleString(
      "en-LK"
    )} from ${shop?.name ?? "a shop"} on AndumPola.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(product.images?.[0]
        ? { images: [{ url: product.images[0], alt: product.title }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(product.images?.[0] ? { images: [product.images[0]] } : {}),
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ shopSlug: string; productId: string }>;
}) {
  const { shopSlug, productId } = await params;
  const supabase = supabasePublic();

  const { data: product } = await supabase
    .from("products")
    .select(
      "*, shops(name, slug, whatsapp, phone, city, plan, status, delivery_areas, delivery_fee, cash_on_delivery, enable_online_orders, bank_name, bank_branch, bank_account_name, bank_account_number), categories(name, slug)"
    )
    .eq("id", productId)
    .single();

  if (!product || product.shops?.slug !== shopSlug) notFound();
  // closed / suspended shop → shop page explains it
  if ((product.shops as { status?: string }).status !== "active")
    redirect(`/${shopSlug}`);
  const p = product as Product;
  // bank fields aren't on the Product.shops type; read from raw row
  const shopBank = (product.shops ?? {}) as {
    bank_name: string | null;
    bank_branch: string | null;
    bank_account_name: string | null;
    bank_account_number: string | null;
  };

  const sizes = Object.entries(p.sizes ?? {});
  const inStock = sizes.filter(([, qty]) => Number(qty) > 0);
  const inStockSizes = inStock.map(([s]) => s);
  // sold out = owner tapped "Sold out", or every size has 0 stock
  const soldOut = !!p.sold_out || (sizes.length > 0 && inStock.length === 0);
  const onSale = !!p.compare_at_price && p.compare_at_price > p.price;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://andumpola.lk";
  const productUrl = `${baseUrl}/${shopSlug}/${p.id}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <TrackView shopId={p.shop_id} productId={p.id} />
      {/* Back */}
      <div className="mb-3">
        <BackButton label="Back" fallback={`/${shopSlug}`} />
      </div>

      {/* Breadcrumb */}
      <p className="text-sm text-soft mb-4 hidden sm:block">
        <Link href="/" className="hover:text-berry">
          Home
        </Link>{" "}
        /{" "}
        <Link href={`/${shopSlug}`} className="hover:text-berry">
          {p.shops?.name}
        </Link>{" "}
        / <span className="text-ink">{p.title}</span>
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gallery */}
        <div>
          <ProductGallery images={p.images ?? []} title={p.title} />
        </div>

        {/* Details */}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            {p.categories && (
              <Link
                href={`/search?category=${p.categories.slug}`}
                className="text-xs font-medium text-berry"
              >
                {p.categories.name}
              </Link>
            )}
            <Link
              href={`/search?audience=${p.audience}`}
              className="text-[11px] font-semibold bg-sand border border-line rounded-full px-2 py-0.5 hover:border-berry"
            >
              {audienceLabel(p.audience)}
            </Link>
            {p.wholesale_only && (
              <span className="text-[11px] font-bold bg-turmeric text-white rounded-full px-2 py-0.5">
                Wholesale only
              </span>
            )}
          </div>
          <h1 className="display text-2xl sm:text-3xl font-bold mt-1">{p.title}</h1>
          {p.colors && p.colors.length > 0 && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-sm text-soft"><T k="colours" />:</span>
              {p.colors.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 text-sm border border-line rounded-full px-2 py-0.5"
                >
                  <span
                    className="h-3 w-3 rounded-full border border-black/10"
                    style={{ backgroundColor: colorHex(c) }}
                  />
                  {c}
                </span>
              ))}
            </div>
          )}
          <p className="mt-3 flex items-center gap-3 flex-wrap">
            <span className="tag-price !text-lg !px-4 !py-1">
              {formatLKR(p.price)}
            </span>
            {onSale && (
              <>
                <span className="text-soft line-through">
                  {formatLKR(p.compare_at_price!)}
                </span>
                <span className="rounded-full bg-berry text-white text-xs font-bold px-2 py-0.5">
                  -{Math.round((1 - p.price / p.compare_at_price!) * 100)}%
                </span>
              </>
            )}
            {soldOut && (
              <span className="rounded-full bg-ink text-white text-xs font-bold px-2 py-0.5">
                <T k="soldOut" />
              </span>
            )}
          </p>

          {p.description && (
            <div className="mt-6">
              <p className="text-sm font-semibold mb-1"><T k="description" /></p>
              <p className="text-soft whitespace-pre-line">{p.description}</p>
            </div>
          )}

          {/* Shop + order */}
          <div className="mt-8 rounded-2xl bg-white border border-line p-5">
            <p className="text-sm text-soft"><T k="soldBy" /></p>
            <Link
              href={`/${shopSlug}`}
              className="display font-bold text-lg hover:text-berry"
            >
              {p.shops?.name}
            </Link>
            {p.shops?.city && (
              <p className="text-xs text-soft mb-3">{p.shops.city}</p>
            )}
            <DeliveryInfo
              compact
              areas={p.shops?.delivery_areas}
              fee={p.shops?.delivery_fee}
              cod={p.shops?.cash_on_delivery}
            />

            <div className="mt-4">
              <OrderOnWhatsApp
                productId={p.id}
                productTitle={p.title}
                price={p.price}
                whatsapp={p.shops!.whatsapp}
                phone={p.shops!.phone}
                shopName={p.shops!.name}
                sizes={inStockSizes}
                productUrl={productUrl}
                soldOut={soldOut}
              />
            </div>

            {/* Optional online order (shop opt-in) */}
            {p.shops?.enable_online_orders &&
              planInfo((product.shops as { plan?: string } | null)?.plan).onlineOrders &&
              !soldOut &&
              inStock.length > 0 && (
              <div className="mt-3 pt-3 border-t border-line">
                <p className="text-xs text-soft mb-1 text-center">
                  <T k="payByBank" />
                </p>
                <OrderButton
                  productId={p.id}
                  price={p.price}
                  sizes={inStockSizes}
                  shopName={p.shops.name}
                  bank={{
                    bank_name: shopBank.bank_name,
                    bank_branch: shopBank.bank_branch,
                    bank_account_name: shopBank.bank_account_name,
                    bank_account_number: shopBank.bank_account_number,
                  }}
                />
              </div>
            )}

            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1">
                <SaveButton productId={p.id} variant="full" />
              </div>
              <ShareButton
                url={productUrl}
                text={`Check out "${p.title}" on AndumPola!`}
                label="Share"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
