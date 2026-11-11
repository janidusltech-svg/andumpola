"use client";
// components/CartView.tsx — cart grouped by shop, checkout via WhatsApp
import Link from "next/link";
import { useState } from "react";
import { useCart, type CartItem } from "@/lib/cart";
import { formatLKR } from "@/lib/types";
import { toWaNumber } from "@/lib/order-status";

const SITE = "https://www.andumpola.lk";

export default function CartView() {
  const { items, ready, setQty, remove, clearShop } = useCart();
  const [sent, setSent] = useState<string[]>([]);

  if (!ready) return <p className="text-soft">Loading…</p>;

  if (items.length === 0)
    return (
      <div className="rounded-2xl bg-white border border-line p-10 text-center">
        <p className="text-4xl">🛒</p>
        <p className="display text-lg font-semibold mt-2">Your cart is empty</p>
        {sent.length > 0 && (
          <p className="text-sm text-leaf mt-1">
            ✅ Your order was sent on WhatsApp. The shop will reply to you there.
          </p>
        )}
        <Link
          href="/search"
          className="inline-block mt-4 rounded-lg bg-berry text-white font-semibold px-5 py-2.5"
        >
          Browse products
        </Link>
      </div>
    );

  // group by shop
  const groups = new Map<string, CartItem[]>();
  for (const i of items) groups.set(i.shopId, [...(groups.get(i.shopId) ?? []), i]);

  function checkout(list: CartItem[]) {
    const shop = list[0];
    const total = list.reduce((s, i) => s + i.price * i.qty, 0);
    const lines = [
      `Hi ${shop.shopName}! I'd like to order from AndumPola:`,
      ``,
      ...list.map(
        (i, n) =>
          `${n + 1}. *${i.title}*${i.size ? ` · Size ${i.size}` : ""} · Qty ${i.qty} · ${formatLKR(i.price * i.qty)}\n   ${SITE}/${i.shopSlug}/${i.productId}`
      ),
      ``,
      `Total: ${formatLKR(total)} (+ delivery)`,
      ``,
      `Please confirm availability and delivery. Thank you!`,
    ];
    const url = `https://wa.me/${toWaNumber(shop.whatsapp)}?text=${encodeURIComponent(
      lines.join("\n")
    )}`;

    // log each item as a WhatsApp order for the shop's dashboard
    for (const i of list) {
      try {
        fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: i.productId, size: i.size, quantity: i.qty }),
          keepalive: true,
        }).catch(() => {});
      } catch {}
    }

    window.open(url, "_blank", "noopener,noreferrer");
    setSent((s) => [...s, shop.shopId]);
    clearShop(shop.shopId);
  }

  return (
    <div className="space-y-5">
      {[...groups.values()].map((list) => {
        const shop = list[0];
        const total = list.reduce((s, i) => s + i.price * i.qty, 0);
        return (
          <div key={shop.shopId} className="rounded-2xl bg-white border border-line overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-sand border-b border-line">
              <Link href={`/${shop.shopSlug}`} className="font-semibold hover:text-berry">
                🏪 {shop.shopName}
              </Link>
              <span className="text-xs text-soft">
                {list.length} item{list.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="divide-y divide-line">
              {list.map((i) => (
                <div key={i.productId + (i.size ?? "")} className="flex gap-3 p-4">
                  <Link
                    href={`/${i.shopSlug}/${i.productId}`}
                    className="h-20 w-16 rounded-lg bg-sand overflow-hidden shrink-0"
                  >
                    {i.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={i.image} alt="" className="h-full w-full object-cover" />
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/${i.shopSlug}/${i.productId}`}
                        className="font-medium line-clamp-2 hover:text-berry"
                      >
                        {i.title}
                      </Link>
                      <button
                        type="button"
                        aria-label="Remove"
                        onClick={() => remove(i.productId, i.size)}
                        className="h-7 w-7 shrink-0 rounded-full text-soft hover:bg-berry/10 hover:text-berry"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-xs text-soft mt-0.5">
                      {i.size ? `Size ${i.size} · ` : ""}
                      {formatLKR(i.price)} each
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label="Decrease"
                          onClick={() => setQty(i.productId, i.size, i.qty - 1)}
                          disabled={i.qty <= 1}
                          className="h-8 w-8 rounded-lg border border-line font-bold disabled:opacity-40"
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-semibold">{i.qty}</span>
                        <button
                          type="button"
                          aria-label="Increase"
                          onClick={() => setQty(i.productId, i.size, i.qty + 1)}
                          className="h-8 w-8 rounded-lg border border-line font-bold"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-semibold whitespace-nowrap">
                        {formatLKR(i.price * i.qty)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-line space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-soft text-sm">Total (before delivery)</span>
                <span className="display text-xl font-bold">{formatLKR(total)}</span>
              </div>
              <button
                type="button"
                onClick={() => checkout(list)}
                className="w-full rounded-xl bg-leaf text-white font-bold py-3.5 hover:opacity-90"
              >
                Order from {shop.shopName} on WhatsApp
              </button>
            </div>
          </div>
        );
      })}
      <p className="text-[11px] text-soft text-center">
        Prices are from when you added the item — the shop confirms the final price.
      </p>
    </div>
  );
}
