// app/dashboard/orders/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatLKR } from "@/lib/types";
import OrderActions from "@/components/OrderActions";

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
  receipt_url: string | null;
  created_at: string;
  products?: { title: string } | null;
};

type LeadRow = {
  id: string;
  product_title: string | null;
  size: string | null;
  quantity: number;
  created_at: string;
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: shop } = await supabase
    .from("shops")
    .select("id, enable_online_orders")
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
      .select("id, product_title, size, quantity, created_at")
      .eq("shop_id", shop.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const list = (orders ?? []) as OrderRow[];
  const leadList = (leads ?? []) as LeadRow[];

  return (
    <div>
      <h1 className="display text-2xl font-bold mb-1">Orders</h1>
      <p className="text-sm text-soft mb-6">
        Customers order you on WhatsApp — these are the people who clicked
        &ldquo;Order on WhatsApp&rdquo; so you can follow up.
      </p>

      {/* WhatsApp order leads */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="display text-lg font-bold">
            💬 WhatsApp orders
            {leadList.length > 0 && (
              <span className="ml-2 text-sm font-normal text-soft">
                {leadList.length}
              </span>
            )}
          </h2>
        </div>
        {leadList.length === 0 ? (
          <div className="rounded-xl bg-white border border-line p-6 text-center">
            <p className="text-soft text-sm">
              No WhatsApp orders yet. When a customer taps &ldquo;Order on
              WhatsApp&rdquo; on one of your products, it shows here and they
              message you directly.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {leadList.map((l) => (
              <div
                key={l.id}
                className="bg-white border border-line rounded-xl p-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-semibold truncate">
                    {l.product_title || "Product"}
                  </p>
                  <p className="text-sm text-soft">
                    {l.size ? `Size ${l.size} · ` : ""}Qty {l.quantity}
                  </p>
                </div>
                <span className="text-xs text-soft shrink-0">
                  {timeAgo(l.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Online (bank transfer) orders */}
      <section>
        <h2 className="display text-lg font-bold mb-3">
          🏦 Bank-transfer orders
        </h2>
        {!shop.enable_online_orders && (
          <p className="text-sm text-soft mb-4">
            Bank-transfer online orders are off. Turn them on in Shop settings
            if you want customers to order and upload a deposit receipt.
          </p>
        )}
        {list.length === 0 ? (
          <div className="rounded-xl bg-white border border-line p-6 text-center">
            <p className="text-soft text-sm">No bank-transfer orders yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((o) => (
              <div
                key={o.id}
                className="bg-white border border-line rounded-xl p-4"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs bg-sand px-2 py-0.5 rounded">
                        {o.order_ref}
                      </span>
                      <StatusBadge status={o.status} />
                    </div>
                    <p className="font-semibold mt-1">{o.products?.title}</p>
                    <p className="text-sm text-soft">
                      Size {o.size} · Qty {o.quantity} ·{" "}
                      <strong className="text-ink">{formatLKR(o.total)}</strong>
                    </p>
                    <div className="text-sm mt-2 space-y-0.5">
                      <p>👤 {o.customer_name}</p>
                      <p>
                        📞{" "}
                        <a
                          href={`tel:${o.customer_phone}`}
                          className="text-berry"
                        >
                          {o.customer_phone}
                        </a>
                      </p>
                      <p className="text-soft">📍 {o.customer_address}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {o.receipt_url && <ReceiptLink path={o.receipt_url} />}
                    {o.status === "pending" && <OrderActions orderId={o.id} />}
                    {o.status === "approved" && (
                      <OrderActions orderId={o.id} approvedMode />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
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

// Receipts are private — generate a signed URL server-side
async function ReceiptLink({ path }: { path: string }) {
  const supabase = await createClient();
  const { data } = await supabase.storage
    .from("receipts")
    .createSignedUrl(path, 3600);
  if (!data?.signedUrl) return null;
  return (
    <a
      href={data.signedUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm font-medium text-berry underline"
    >
      View receipt
    </a>
  );
}
