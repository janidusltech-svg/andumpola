"use client";
// components/DeleteProductButton.tsx
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [busy, setBusy] = useState(false);

  async function del() {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setBusy(true);
    const { error } = await supabase.from("products").delete().eq("id", id);
    setBusy(false);
    if (error) {
      alert(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <button
      onClick={del}
      disabled={busy}
      className="text-sm font-medium text-soft hover:text-berry disabled:opacity-50"
    >
      {busy ? "…" : "Delete"}
    </button>
  );
}
