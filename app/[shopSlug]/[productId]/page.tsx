// app/[shopSlug]/[productId]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabasePublic } from "@/lib/supabase/public";
import { Product, formatLKR, audienceLabel } from "@/lib/types";
import ContactButtons from "@/components/ContactButtons";
import OrderButton from "@/components/OrderButton";
import SaveButton from "@/components/SaveButton";
import ShareButton from "@/components/ShareButton";
import ProductGallery from "@/components/ProductGallery";

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
    .select("title, description, price, images, shops(name)")
    .eq("id", productId)
    .single();

  if (!product) return { title: "Product not found — AndumPola" };
  const shop = Array.isArray(product.shops)
    ? product.shops[0]
    : product.shops;
  const title = `${product.title} — ${shop?.name ?? "AndumPola"}`;
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
      "*, shops(name, slug, whatsapp, phone, city, enable_online_orders, bank_name, bank_branch, bank_account_name, bank_account_number), categories(name, slug)"
    )
    .eq("id", productId)
    .single();

  if (!product || product.shops?.slug !== shopSlug) notFound();
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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://andumpola.lk";
  const productUrl = `${baseUrl}/${shopSlug}/${p.id}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Breadcrumb */}
      <p className="text-sm text-soft mb-4">
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
          </div>
          <h1 className="display text-2xl sm:text-3xl font-bold mt-1">{p.title}</h1>
          <p className="mt-3">
            <span className="tag-price !text-lg !px-4 !py-1">
              {formatLKR(p.price)}
            </span>
          </p>

          {/* Sizes */}
          <div className="mt-6">
            <p className="text-sm font-semibold mb-2">Available sizes</p>
            {inStock.length > 0 ? (
              <div className="flex gap-2 flex-wrap">
                {inStock.map(([size, qty]) => (
                  <span
                    key={size}
                    className="rounded-md border border-line bg-white px-3 py-1.5 text-sm font-medium"
                    title={`${qty} in stock`}
                  >
                    {size}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-soft">
                Contact the shop for size availability.
              </p>
            )}
          </div>

          {p.description && (
            <div className="mt-6">
              <p className="text-sm font-semibold mb-1">Description</p>
              <p className="text-soft whitespace-pre-line">{p.description}</p>
            </div>
          )}

          {/* Shop + contact */}
          <div className="mt-8 rounded-xl bg-white border border-line p-5">
            <p className="text-sm text-soft">Sold by</p>
            <Link
              href={`/${shopSlug}`}
              className="display font-bold text-lg hover:text-berry"
            >
              {p.shops?.name}
            </Link>
            {p.shops?.city && (
              <p className="text-xs text-soft mb-4">{p.shops.city}</p>
            )}
            <div className="mt-3">
              <ContactButtons
                whatsapp={p.shops!.whatsapp}
                phone={p.shops!.phone}
                productTitle={p.title}
                price={p.price}
                productUrl={productUrl}
              />
            </div>
            {p.shops?.enable_online_orders && inStock.length > 0 && (
              <OrderButton
                productId={p.id}
                price={p.price}
                sizes={inStock.map(([s]) => s)}
                shopName={p.shops.name}
                bank={{
                  bank_name: shopBank.bank_name,
                  bank_branch: shopBank.bank_branch,
                  bank_account_name: shopBank.bank_account_name,
                  bank_account_number: shopBank.bank_account_number,
                }}
              />
            )}
            <div className="mt-3">
              <SaveButton productId={p.id} variant="full" />
            </div>
            <div className="mt-3 flex justify-center">
              <ShareButton
                url={productUrl}
                text={`Check out "${p.title}" on AndumPola!`}
                label="Share this product"
              />
            </div>
            <p className="mt-4 text-[11px] text-soft text-center border-t border-line pt-3">
              Payments go directly to the shop. AndumPola does not process or
              hold payments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
