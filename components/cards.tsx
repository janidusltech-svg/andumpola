// components/cards.tsx
import Link from "next/link";
import { Product, Shop, formatLKR } from "@/lib/types";
import SaveButton from "@/components/SaveButton";

export function ProductCard({ product }: { product: Product }) {
  const img = product.images?.[0];
  return (
    <div className="group relative rounded-2xl bg-white border border-line overflow-hidden hover:shadow-[0_12px_30px_rgba(27,23,32,0.08)] hover:-translate-y-0.5 transition-all">
      <div className="absolute top-2.5 right-2.5 z-10">
        <SaveButton productId={product.id} />
      </div>
      <Link href={`/${product.shops?.slug}/${product.id}`} className="block">
        <div className="aspect-[3/4] bg-sand overflow-hidden">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img}
              alt={product.title}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-soft text-sm">
              No photo
            </div>
          )}
        </div>
        <div className="p-3.5">
          <p className="text-sm font-medium line-clamp-2 mb-2">{product.title}</p>
          <span className="tag-price">{formatLKR(product.price)}</span>
          {product.shops && (
            <p className="text-xs text-soft truncate mt-2">
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
  const location =
    [shop.city, shop.province ? `${shop.province}` : null]
      .filter(Boolean)
      .join(" · ") || "Sri Lanka";
  return (
    <Link
      href={`/${shop.slug}`}
      className="group rounded-2xl bg-white border border-line overflow-hidden hover:shadow-[0_12px_30px_rgba(27,23,32,0.08)] hover:-translate-y-0.5 transition-all"
    >
      <div className="h-24 bg-gradient-to-br from-rose-soft to-white">
        {shop.banner_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shop.banner_url} alt="" className="h-full w-full object-cover" />
        )}
      </div>
      <div className="p-4 flex items-center gap-3 -mt-8">
        <div className="h-14 w-14 rounded-2xl border-[3px] border-white bg-sand overflow-hidden shrink-0 shadow-sm flex items-center justify-center">
          {shop.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shop.logo_url} alt={shop.name} className="h-full w-full object-cover" />
          ) : (
            <span className="display font-bold text-berry text-lg">
              {shop.name.charAt(0)}
            </span>
          )}
        </div>
        <div className="pt-6 min-w-0">
          <p className="font-semibold truncate group-hover:text-berry">
            {shop.name}
          </p>
          <p className="text-xs text-soft truncate">{location}</p>
        </div>
      </div>
    </Link>
  );
}
