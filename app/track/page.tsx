"use client";
// app/track/page.tsx
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { formatLKR } from "@/lib/types";

type OrderStatus = {
  order_ref: string;
  status: string;
  size: string;
  quantity: number;
  total: number;
  shop_note: string | null;
  created_at: string;
  product_title: string;
  shop_name: string;
  shop_whatsapp: string;
};

function TrackInner() {
  const params = useSearchParams();
  const [ref, setRef] = useState(params.get("ref") ?? "");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function check() {
    setError("");
    setOrder(null);
    if (!ref.trim() || !phone.trim()) {
      setError("Enter your order reference and phone number.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/orders/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_ref: ref, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Not found.");
      setOrder(data.order);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="display text-3xl font-bold mb-2">Track your order</h1>
      <p className="text-soft mb-6">
        Enter your order reference and the phone number you used.
      </p>

      <div className="bg-white border border-line rounded-xl p-6 space-y-3">
        <label className="block">
          <span className="text-sm font-medium">Order reference</span>
          <input
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder="ORD-XXXXXXXX"
            className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:ring-2 focus:ring-berry/40"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Phone number</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && check()}
            placeholder="0771234567"
            className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:ring-2 focus:ring-berry/40"
          />
        </label>
        {error && <p className="text-sm text-berry">{error}</p>}
        <button
          onClick={check}
          disabled={loading}
          className="w-full rounded-lg bg-berry text-white font-semibold py-3 hover:bg-berry-dark disabled:opacity-60"
        >
          {loading ? "Checking…" : "Check status"}
        </button>
      </div>

      {order && (
        <div className="mt-6 bg-white border border-line rounded-xl p-6">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm bg-sand px-2 py-0.5 rounded">
              {order.order_ref}
            </span>
            <StatusBadge status={order.status} />
          </div>
          <h2 className="display font-bold text-lg mt-3">
            {order.product_title}
          </h2>
          <p className="text-sm text-soft">
            {order.shop_name} · Size {order.size} · Qty {order.quantity}
          </p>
          <p className="mt-2 display font-bold">{formatLKR(order.total)}</p>

          <div className="mt-4">
            <StatusExplainer status={order.status} note={order.shop_note} />
          </div>

          {order.shop_whatsapp && (
            <a
              href={`https://wa.me/${order.shop_whatsapp.replace(
                /[^0-9]/g,
                ""
              )}?text=${encodeURIComponent(
                `Hi, I'm checking on my order ${order.order_ref}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block text-center rounded-lg border border-leaf text-leaf font-semibold py-2.5 hover:bg-leaf hover:text-white"
            >
              Message shop on WhatsApp
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-turmeric/20 text-turmeric",
    approved: "bg-leaf/15 text-leaf",
    rejected: "bg-berry/15 text-berry",
    delivered: "bg-ink/10 text-ink",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
        map[status] || "bg-line"
      }`}
    >
      {status}
    </span>
  );
}

function StatusExplainer({
  status,
  note,
}: {
  status: string;
  note: string | null;
}) {
  const messages: Record<string, string> = {
    pending:
      "The shop is verifying your payment. You'll be confirmed once they check their account.",
    approved:
      "Your payment is confirmed and your order is being prepared for delivery. 🎉",
    rejected:
      "Unfortunately this order was rejected. If you already paid, contact the shop.",
    delivered: "This order has been delivered. Thank you for shopping! 🛍️",
  };
  return (
    <div className="rounded-lg bg-sand p-3 text-sm">
      <p>{messages[status] || "Status updated."}</p>
      {note && <p className="text-soft mt-1">Shop note: {note}</p>}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense>
      <TrackInner />
    </Suspense>
  );
}
