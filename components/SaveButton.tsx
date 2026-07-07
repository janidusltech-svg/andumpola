"use client";
// components/SaveButton.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SaveButton({
  productId,
  variant = "icon",
}: {
  productId: string;
  variant?: "icon" | "full";
}) {
  const router = useRouter();
  const supabase = createClient();
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (active) setReady(true);
        return;
      }
      const { data } = await supabase
        .from("saved_products")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle();
      if (active) {
        setSaved(!!data);
        setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [productId, supabase]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setBusy(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Not logged in → send to customer login, come back to this product
      router.push(
        `/account/login?next=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }

    // Confirm this is a customer (shop owners don't save)
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "customer") {
      alert("Saving is for customer accounts. Create one to save products.");
      setBusy(false);
      return;
    }

    if (saved) {
      await supabase
        .from("saved_products")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);
      setSaved(false);
    } else {
      await supabase
        .from("saved_products")
        .insert({ user_id: user.id, product_id: productId });
      setSaved(true);
    }
    setBusy(false);
    router.refresh();
  }

  const heart = (
    <svg
      viewBox="0 0 24 24"
      className={`h-5 w-5 ${saved ? "fill-berry" : "fill-none"}`}
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 21s-7.5-4.6-10-9.3C.5 8.6 2 5 5.4 5c2 0 3.4 1.2 4.3 2.5C10.6 6.2 12 5 14 5c3.4 0 4.9 3.6 3.4 6.7C19.5 16.4 12 21 12 21z" />
    </svg>
  );

  if (!ready)
    return (
      <span
        className={
          variant === "icon"
            ? "inline-flex h-9 w-9 items-center justify-center"
            : ""
        }
      />
    );

  if (variant === "full") {
    return (
      <button
        onClick={toggle}
        disabled={busy}
        className={`flex items-center justify-center gap-2 rounded-lg border-2 font-semibold py-3 w-full transition-colors ${
          saved
            ? "border-berry text-berry bg-berry/5"
            : "border-line text-ink hover:border-berry"
        }`}
      >
        {heart}
        {saved ? "Saved" : "Save for later"}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-label={saved ? "Remove from saved" : "Save product"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 border border-line text-berry hover:bg-white shadow-sm"
    >
      {heart}
    </button>
  );
}
