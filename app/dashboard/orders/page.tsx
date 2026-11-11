// app/dashboard/orders/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatLKR } from "@/lib/types";
import { statusInfo } from "@/lib/order-status";
import OrderManager from "@/components/OrderManager";
import LeadStatus from "@/components/LeadStatus";

type OrderRow = {
  id: string;
  order_ref: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  size: string;
  quantity: number;
  total: number;
  status: string;
  shop_note: string | null;
  owner_notes: string | null;
  receipt_url: string | null;
  created_at: string;
  products?: { title: string } | null;
};

type LeadRow = {
  id: string;
  product_title: string | null;
  size: string | null;
  quantity: number;
  status: string;
  created_at: string;
};

const TABS = [
  { key: "new", label: "New", statuses: ["pending"] },
  { key: "active", label: "In progress", statuses: ["approved", "processing", "shipped"] },
  { key: "done", label: "Completed", statuses: ["delivered"] },
  { key: "closed", label: "Cancelled", statuses: ["rejected", "cancelled"] },
];

function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: shop } = await supabase
    .from("shops")
    .select("id, name, enable_online_orders")
    .eq("owner_id", user!.id)
    .maybeSingle();

  if (!shop) redirect("/dashboard");

  const [{ data: orders }, { data: leads }] = await Promise.all([
    supabase
      .from("orders")
      .select("*, products(title)")
      .eq("shop_id", shop.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("leads")
      .select("id, product_title, size, quantity, status, created_at")
      .eq("shop_id", shop.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const all = (orders ?? []) as OrderRow[];
  const leadList = (leads ?? []) as LeadRow[];
  const newLeads = leadList.filter((l) => l.status === "new").length;

  const counts = Object.fromEntries(
    TABS.map((t) => [t.key, all.filter((o) => t.statuses.includes(o.status)).length])
  );
  const active =
    TABS.find((t) => t.key === tab) ??
    (counts.new > 0 ? TABS[0] : counts.active > 0 ? TABS[1] : TABS[0]);
  const list = all.filter((o) => active.statuses.includes(o.status));
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.andumpola.lk";

  return (
    <div>
      <h1 className="display text-2xl font-bold mb-6">Orders</h1>

      {/* ---------- Bank-transfer orders ---------- */}
      <section className="mb-10">
        <h2 className="display text-lg font-bold mb-3">🏦 Online orders</h2>
        {!shop.enable_online_orders && (
          <p className="text-sm text-soft mb-4">
            Bank-transfer orders are off. Turn them on in Shop settings if you
            want customers to order and upload a deposit receipt.
          </p>
        )}

        {/* Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 mb-4">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={`/dashboard/orders?tab=${t.key}`}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium border ${
                active.key === t.key
                  ? "bg-ink text-white border-ink"
                  : "bg-white border-line hover:border-berry"
              }`}
            >
              {t.label}
              {counts[t.key] > 0 && (
                <span
                  className={`ml-1.5 rounded-full px-1.5 text-[11px] ${
                    t.key === "new" && active.key !== t.key
                      ? "bg-berry text-white"
                      : "opacity-70"
                  }`}
                >
                  {counts[t.key]}
                </span>
              )}
            </Link>
          ))}
        </div>

        {list.length === 0 ? (
          <div className="rounded-xl bg-white border border-line p-6 text-center">
            <p className="text-soft text-sm">No {active.label.toLowerCase()} orders.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((o) => {
              const info = statusInfo(o.status);
              return (
                <div key={o.id} className="bg-white border border-line rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs bg-sand px-2 py-0.5 rounded">
                          {o.order_ref}
                        </span>
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${info.cls}`}>
                          {info.emoji} {info.label}
                        </span>
                        <span className="text-xs text-soft">{timeAgo(o.created_at)}</span>
                      </div>
                      <p className="font-semibold mt-1.5">{o.products?.title}</p>
                      <p className="text-sm text-soft">
                        Size {o.size} · Qty {o.quantity} ·{" "}
                        <strong className="text-ink">{formatLKR(o.total)}</strong>
                      </p>
                      <div className="text-sm mt-2 space-y-0.5">
                        <p>👤 {o.customer_name}</p>
                        <p>
                          📞{" "}
                          <a href={`tel:${o.customer_phone}`} className="text-berry">
                            {o.customer_phone}
                          </a>
                        </p>
                        <p className="text-soft">📍 {o.customer_address}</p>
                        {o.shop_note && (
                          <p className="text-soft">💬 Told customer: {o.shop_note}</p>
                        )}
                      </div>
                    </div>
                    {o.receipt_url && <ReceiptLink path={o.receipt_url} />}
                  </div>

                  <OrderManager
                    shopName={shop.name}
                    siteUrl={siteUrl}
                    order={{
                      id: o.id,
                      order_ref: o.order_ref,
                      customer_name: o.customer_name,
                      customer_phone: o.customer_phone,
                      status: o.status,
                      shop_note: o.shop_note,
                      owner_notes: o.owner_notes,
                      size: o.size,
                      quantity: o.quantity,
                      total: o.total,
                      product_title: o.products?.title ?? "your item",
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ---------- WhatsApp order clicks ---------- */}
      <section>
        <h2 className="display text-lg font-bold mb-1">
          💬 WhatsApp orders
          {newLeads > 0 && (
            <span className="ml-2 rounded-full bg-berry text-white px-2 py-0.5 text-xs align-middle">
              {newLeads} new
            </span>
          )}
        </h2>
        <p className="text-sm text-soft mb-3">
          Customers who tapped &ldquo;Order on WhatsApp&rdquo;. Reply in WhatsApp, then update the status here.
        </p>
        {leadList.length === 0 ? (
          <div className="rounded-xl bg-white border border-line p-6 text-center">
            <p className="text-soft text-sm">No WhatsApp orders yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leadList.map((l) => (
              <div
                key={l.id}
                className="bg-white border border-line rounded-xl p-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-semibold truncate">{l.product_title || "Product"}</p>
                  <p className="text-sm text-soft">
                    {l.size ? `Size ${l.size} · ` : ""}Qty {l.quantity}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <LeadStatus id={l.id} status={l.status} />
                  <span className="text-xs text-soft">{timeAgo(l.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// Receipts are private — generate a signed URL server-side
async function ReceiptLink({ path }: { path: string }) {
  const supabase = await createClient();
  const { data } = await supabase.storage.from("receipts").createSignedUrl(path, 3600);
  if (!data?.signedUrl) return null;
  return (
    <a
      href={data.signedUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm font-semibold text-berry underline shrink-0"
    >
      View receipt
    </a>
  );
}
