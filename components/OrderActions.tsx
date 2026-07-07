"use client";
// components/OrderActions.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function OrderActions({
  orderId,
  approvedMode = false,
}: {
  orderId: string;
  approvedMode?: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [busy, setBusy] = useState(false);

  async function update(status: string, note?: string) {
    setBusy(true);
    const patch: Record<string, unknown> = { status };
    if (note) patch.shop_note = note;
    const { error } = await supabase
      .from("orders")
      .update(patch)
      .eq("id", orderId);
    setBusy(false);
    if (error) {
      alert(error.message);
      return;
    }
    router.refresh();
  }

  if (approvedMode) {
    return (
      <button
        onClick={() => update("delivered")}
        disabled={busy}
        className="rounded-lg bg-ink text-white text-sm font-semibold px-4 py-2 disabled:opacity-60"
      >
        {busy ? "…" : "Mark delivered"}
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => {
          if (confirm("Approve this order? Stock will be reduced."))
            update("approved");
        }}
        disabled={busy}
        className="rounded-lg bg-leaf text-white text-sm font-semibold px-4 py-2 disabled:opacity-60"
      >
        Approve
      </button>
      <button
        onClick={() => {
          const note = prompt("Reason for rejection (optional):") ?? "";
          update("rejected", note);
        }}
        disabled={busy}
        className="rounded-lg border border-berry text-berry text-sm font-semibold px-4 py-2 disabled:opacity-60"
      >
        Reject
      </button>
    </div>
  );
}
