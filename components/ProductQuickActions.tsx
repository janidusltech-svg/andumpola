"use client";
// components/ProductQuickActions.tsx — one-tap Sold out / In stock + Duplicate
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProductQuickActions({
  id,
  soldOut,
}: {
  id: string;
  soldOut: boolean;
}) {
  const router = useRouter();
  const [isSoldOut, setIsSoldOut] = useState(soldOut);
  const [busy, setBusy] = useState<"" | "stock" | "copy">("");

  async function toggleSoldOut() {
    const next = !isSoldOut;
    setIsSoldOut(next); // instant feedback
    setBusy("stock");
    const { error } = await createClient()
      .from("products")
      .update({ sold_out: next, updated_at: new Date().toISOString() })
      .eq("id", id);
    setBusy("");
    if (error) {
      setIsSoldOut(!next);
      alert("Couldn't update. Please try again.");
    } else router.refresh();
  }

  async function duplicate() {
    setBusy("copy");
    const supabase = createClient();
    const { data: src, error: readErr } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();
    if (readErr || !src) {
      setBusy("");
      alert("Couldn't copy this product.");
      return;
    }
    const { data: copy, error } = await supabase
      .from("products")
      .insert({
        shop_id: src.shop_id,
        vertical: src.vertical,
        category_id: src.category_id,
        description: src.description,
        price: src.price,
        compare_at_price: src.compare_at_price ?? null,
        audience: src.audience,
        colors: src.colors,
        wholesale_only: src.wholesale_only,
        sizes: src.sizes,
        images: src.images,
        is_available: src.is_available,
        title: `${src.title} (copy)`.slice(0, 200),
        is_featured: false,
        sold_out: false,
      })
      .select("id")
      .single();
    setBusy("");
    if (error || !copy) {
      alert(error?.message || "Couldn't copy this product.");
      return;
    }
    router.push(`/dashboard/products/edit/${copy.id}`);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={busy !== ""}
        onClick={toggleSoldOut}
        className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors disabled:opacity-60 ${
          isSoldOut
            ? "bg-ink text-white border-ink"
            : "bg-leaf/10 text-leaf border-leaf/40"
        }`}
        title="Tap to switch"
      >
        {isSoldOut ? "Sold out" : "In stock"}
      </button>
      <button
        type="button"
        disabled={busy !== ""}
        onClick={duplicate}
        className="rounded-full px-3 py-1 text-xs font-semibold border border-line hover:border-berry disabled:opacity-60"
        title="Make a copy (e.g. same item, another colour)"
      >
        {busy === "copy" ? "Copying…" : "⧉ Duplicate"}
      </button>
    </div>
  );
}
