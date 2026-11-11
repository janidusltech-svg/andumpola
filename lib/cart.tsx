"use client";
// lib/cart.tsx — shopping cart for everyone (guests too), kept on the device.
// Checkout = one WhatsApp message per shop with all its items.
import { createContext, useContext, useEffect, useState } from "react";

export type CartItem = {
  productId: string;
  shopId: string;
  shopSlug: string;
  shopName: string;
  whatsapp: string;
  title: string;
  price: number;
  image?: string | null;
  size?: string;
  qty: number;
};

type CartCtx = {
  items: CartItem[];
  count: number;
  add: (item: CartItem) => void;
  setQty: (productId: string, size: string | undefined, qty: number) => void;
  remove: (productId: string, size: string | undefined) => void;
  clearShop: (shopId: string) => void;
  ready: boolean;
};

const KEY = "ap-cart-v1";
const Ctx = createContext<CartCtx | null>(null);
const same = (a: CartItem, id: string, size?: string) =>
  a.productId === id && (a.size ?? "") === (size ?? "");

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setReady(true);
    // keep several open tabs in sync
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) {
        try {
          setItems(e.newValue ? JSON.parse(e.newValue) : []);
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function save(next: CartItem[]) {
    setItems(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  }

  const api: CartCtx = {
    items,
    ready,
    count: items.reduce((n, i) => n + i.qty, 0),
    add(item) {
      const found = items.find((i) => same(i, item.productId, item.size));
      save(
        found
          ? items.map((i) =>
              same(i, item.productId, item.size)
                ? { ...i, qty: Math.min(999, i.qty + item.qty), price: item.price }
                : i
            )
          : [...items, item]
      );
    },
    setQty(id, size, qty) {
      save(
        items.map((i) =>
          same(i, id, size) ? { ...i, qty: Math.max(1, Math.min(999, qty)) } : i
        )
      );
    },
    remove(id, size) {
      save(items.filter((i) => !same(i, id, size)));
    },
    clearShop(shopId) {
      save(items.filter((i) => i.shopId !== shopId));
    },
  };

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be inside CartProvider");
  return c;
}
