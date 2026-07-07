// components/cards.tsx
import Link from "next/link";
import { Product, Shop, formatLKR } from "@/lib/types";
import SaveButton from "@/components/SaveButton";

export function ProductCard({ product }: { product: Product }) {
  const img = product.images?.[0];
  return (
    <div className="group relative rounded-lg bg-white border border-line overflow-hidden hover:shadow-md transition-shadow">
      {/* Save heart sits outside the link to keep HTML valid */}
      <div className="absolute top-2 right-2 z-10">
        <SaveButton productId={product.id} />
      </div>
      <Link href={`/${product.shops?.slug}/${product.id}`} className="block">
        <div className="aspect-[3/4] bg-line/40 overflow-hidden">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img}
              alt={product.title}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-soft text-sm">
              No photo
            </div>
          )}
        </div>
        <div className="p-3 space-y-1.5">
          <p className="text-sm font-medium line-clamp-2">{product.title}</p>
          <div className="flex items-center justify-between">
            <span className="tag-price">{formatLKR(product.price)}</span>
          </div>
          {product.shops && (
            <p className="text-xs text-soft truncate">
              {product.shops.name}
              {product.shops.city ? ` · ${product.shops.city}` : ""}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}

export function ShopCard({ shop }: { shop: Shop }) {
  return (
    <Link
      href={`/${shop.slug}`}
      className="group rounded-lg bg-white border border-line overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="h-24 bg-berry/10">
        {shop.banner_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shop.banner_url}
            alt=""
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="p-4 flex items-center gap-3 -mt-8">
        <div className="h-14 w-14 rounded-full border-2 border-white bg-sand overflow-hidden shrink-0 shadow">
          {shop.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shop.logo_url}
              alt={shop.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center display font-bold text-berry">
              {shop.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="pt-6 min-w-0">
          <p className="font-semibold truncate group-hover:text-berry">
            {shop.name}
          </p>
          <p className="text-xs text-soft truncate">
            {shop.city || "Sri Lanka"}
          </p>
        </div>
      </div>
    </Link>
  );
}
