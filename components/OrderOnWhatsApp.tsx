"use client";
// components/OrderOnWhatsApp.tsx
// Primary order path: pick size + quantity, then "Order on WhatsApp" opens
// the shop's WhatsApp pre-filled with the full product details. Each click
// is logged as a lead so the shop owner can see demand in their dashboard.
import { useMemo, useState } from "react";
import { formatLKR } from "@/lib/types";
import { toWaNumber } from "@/lib/order-status";
import { useT } from "@/lib/i18n";

export default function OrderOnWhatsApp({
  productId,
  productTitle,
  price,
  whatsapp,
  phone,
  shopName,
  sizes,
  productUrl,
  soldOut,
}: {
  productId: string;
  productTitle: string;
  price: number;
  whatsapp: string;
  phone: string;
  shopName: string;
  sizes: string[]; // in-stock sizes (may be empty)
  productUrl: string;
  soldOut?: boolean; // owner marked "Sold out" or no stock left
}) {
  const [size, setSize] = useState<string>(sizes[0] ?? "");
  const [qty, setQty] = useState(1);
  const t = useT();

  const total = price * qty;
  const waNumber = toWaNumber(whatsapp);

  const waHref = useMemo(() => {
    const lines = soldOut
      ? [
          `Hi ${shopName}! I saw this on AndumPola and it shows sold out:`,
          ``,
          `*${productTitle}* (${formatLKR(price)})`,
          ``,
          `Will it be available again, or do you have something similar?`,
          productUrl,
        ]
      : [
      `Hi ${shopName}! I'd like to order from AndumPola:`,
      ``,
      `*${productTitle}*`,
      `Price: ${formatLKR(price)}`,
      size ? `Size: ${size}` : null,
      `Quantity: ${qty}`,
      `Total: ${formatLKR(total)}`,
      ``,
      productUrl,
    ].filter(Boolean);
    return `https://wa.me/${waNumber}?text=${encodeURIComponent(
      lines.join("\n")
    )}`;
  }, [shopName, productTitle, price, size, qty, total, productUrl, waNumber, soldOut]);

  function logLead() {
    try {
      const payload = JSON.stringify({ product_id: productId, size, quantity: qty });
      // keepalive so it completes even as the browser opens WhatsApp
      fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* never block the order on a logging error */
    }
  }

  if (soldOut)
    return (
      <div className="space-y-3">
        <p className="rounded-lg bg-berry/10 text-berry font-semibold text-center py-2.5">
          {t("soldOutNow")}
        </p>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-leaf text-white font-bold py-3.5 hover:opacity-90"
        >
          {t("askComeback")}
        </a>
        <a
          href={`tel:${phone}`}
          className="flex w-full items-center justify-center rounded-xl border-2 border-line font-semibold py-3 hover:border-berry hover:text-berry"
        >
          {t("callShop")}
        </a>
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Size picker */}
      {sizes.length > 0 && (
        <div>
          <p className="text-sm font-semibold mb-2">{t("chooseSize")}</p>
          <div className="flex gap-2 flex-wrap">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                  size === s
                    ? "bg-ink text-white border-ink"
                    : "bg-white border-line hover:border-berry"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{t("quantity")}</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="h-9 w-9 rounded-lg border border-line text-lg font-bold hover:border-berry disabled:opacity-40"
            disabled={qty <= 1}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-8 text-center font-semibold">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(999, q + 1))}
            className="h-9 w-9 rounded-lg border border-line text-lg font-bold hover:border-berry"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between rounded-lg bg-sand border border-line px-4 py-2.5">
        <span className="text-sm text-soft">{t("total")}</span>
        <span className="display font-bold text-lg">{formatLKR(total)}</span>
      </div>

      {/* Primary: Order on WhatsApp */}
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={logLead}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-leaf text-white font-bold py-3.5 text-base hover:opacity-90 active:scale-[0.99] transition"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden>
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.2 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.9-1.2-4.7-4.1-4.9-4.3-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5s.8 1.9.8 2c.1.1.1.3 0 .5l-.4.6c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1.1 2.2 1.4 2.5 1.5.3.2.5.1.7-.1l.7-.9c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.1.1.7-.1 1.3Z" />
        </svg>
        {t("orderOnWhatsApp")}
      </a>

      {/* Secondary: Call */}
      <a
        href={`tel:${phone}`}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-line text-ink font-semibold py-3 hover:border-berry hover:text-berry transition-colors"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
          <path d="M6.6 10.8a15.6 15.6 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.2.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.3 1l-2.2 2.2Z" />
        </svg>
        {t("callShop")}
      </a>

      <p className="text-[11px] text-soft text-center">
        {t("orderNote")}
      </p>
    </div>
  );
}
