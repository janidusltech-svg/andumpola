"use client";
// components/OrderManager.tsx — status updates, WhatsApp notify, notes
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatLKR } from "@/lib/types";
import { NEXT_ACTIONS, statusInfo, toWaNumber } from "@/lib/order-status";

type Order = {
  id: string;
  order_ref: string;
  customer_name: string;
  customer_phone: string;
  status: string;
  shop_note: string | null;
  owner_notes: string | null;
  size: string;
  quantity: number;
  total: number;
  product_title: string;
};

export default function OrderManager({
  order,
  shopName,
  siteUrl,
}: {
  order: Order;
  shopName: string;
  siteUrl: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [busy, setBusy] = useState(false);
  const [notify, setNotify] = useState(true);
  const [msgNote, setMsgNote] = useState("");
  const [notes, setNotes] = useState(order.owner_notes ?? "");
  const [notesSaved, setNotesSaved] = useState(false);
  const [showNotes, setShowNotes] = useState(!!order.owner_notes);

  const wa = toWaNumber(order.customer_phone);
  const trackUrl = `${siteUrl}/track?ref=${order.order_ref}`;

  function waLink(text: string) {
    return `https://wa.me/${wa}?text=${encodeURIComponent(text)}`;
  }

  function statusMessage(to: string, note: string) {
    const info = statusInfo(to);
    return [
      `Hi ${order.customer_name}! 👋`,
      ``,
      `Your order *${order.order_ref}* from ${shopName}:`,
      `${order.product_title} (Size ${order.size} × ${order.quantity}) — ${formatLKR(order.total)}`,
      ``,
      `Status: *${info.emoji} ${info.label}*`,
      info.customer,
      note ? `\nNote: ${note}` : null,
      ``,
      `Track your order: ${trackUrl}`,
    ]
      .filter((l) => l !== null)
      .join("\n");
  }

  async function changeStatus(to: string) {
    if (to === "approved" && !confirm("Confirm payment received? Stock will be reduced.")) return;
    if ((to === "rejected" || to === "cancelled") && !confirm(`Mark this order as ${statusInfo(to).label}?`)) return;

    const note = msgNote.trim();
    // Open WhatsApp right away (inside the click) so the browser doesn't block it
    if (notify) window.open(waLink(statusMessage(to, note)), "_blank");

    setBusy(true);
    const patch: Record<string, unknown> = {
      status: to,
      status_updated_at: new Date().toISOString(),
    };
    if (note) patch.shop_note = note;
    const { error } = await createClient().from("orders").update(patch).eq("id", order.id);
    setBusy(false);
    if (error) {
      alert("Could not update: " + error.message);
      return;
    }
    setStatus(to);
    setMsgNote("");
    router.refresh();
  }

  async function saveNotes() {
    const { error } = await createClient()
      .from("orders")
      .update({ owner_notes: notes.trim() || null })
      .eq("id", order.id);
    if (!error) {
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 1500);
    } else alert(error.message);
  }

  const actions = NEXT_ACTIONS[status] ?? [];

  return (
    <div className="mt-3 border-t border-line pt-3 space-y-3">
      {actions.length > 0 && (
        <>
          <input
            value={msgNote}
            onChange={(e) => setMsgNote(e.target.value)}
            placeholder="Message to customer (optional) — e.g. delivery tomorrow"
            className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-berry/30"
          />
          <div className="flex flex-wrap gap-2">
            {actions.map((a) => (
              <button
                key={a.to}
                onClick={() => changeStatus(a.to)}
                disabled={busy}
                className={`rounded-lg px-3.5 py-2 text-sm font-semibold disabled:opacity-60 ${
                  a.tone === "go"
                    ? "bg-ink text-white hover:opacity-90"
                    : "border border-berry text-berry hover:bg-berry/5"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs text-soft">
            <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
            Send update to customer on WhatsApp
          </label>
        </>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <a
          href={waLink(`Hi ${order.customer_name}, this is ${shopName} about your order ${order.order_ref}.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-leaf"
        >
          💬 Message customer
        </a>
        <button onClick={() => setShowNotes((s) => !s)} className="font-semibold text-soft hover:text-ink">
          📝 {showNotes ? "Hide notes" : order.owner_notes ? "Notes" : "Add note"}
        </button>
      </div>

      {showNotes && (
        <div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Private notes (only you see these) — courier, tracking no., etc."
            className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-berry/30 resize-none"
          />
          <button onClick={saveNotes} className="mt-1 text-sm font-semibold text-berry">
            {notesSaved ? "Saved ✓" : "Save note"}
          </button>
        </div>
      )}
    </div>
  );
}
