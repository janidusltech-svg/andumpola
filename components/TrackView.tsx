"use client";
// components/TrackView.tsx
// Invisible component that logs one anonymous page view per browser
// session (so refreshing doesn't inflate the numbers).
import { useEffect } from "react";

export default function TrackView({
  shopId,
  productId,
}: {
  shopId: string;
  productId?: string;
}) {
  useEffect(() => {
    try {
      const key = `apv:${productId ?? shopId}`;
      if (sessionStorage.getItem(key)) return; // already counted this session
      sessionStorage.setItem(key, "1");
    } catch {
      /* private mode etc. — still count the view below */
    }
    try {
      fetch("/api/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop_id: shopId,
          product_id: productId ?? null,
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* analytics must never break the page */
    }
  }, [shopId, productId]);

  return null;
}
