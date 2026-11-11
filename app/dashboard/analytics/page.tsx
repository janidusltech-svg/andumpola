// app/dashboard/analytics/page.tsx
// Shop analytics: views, WhatsApp orders, 7-day chart, top products.
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ViewRow = { product_id: string | null; created_at: string };
type LeadRow = {
  product_id: string | null;
  product_title: string | null;
  created_at: string;
};

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: shop } = await supabase
    .from("shops")
    .select("id, name, slug")
    .eq("owner_id", user!.id)
    .maybeSingle();

  if (!shop) redirect("/dashboard");

  const since30 = new Date(Date.now() - 30 * 86400000).toISOString();

  const [
    { count: totalViews },
    { count: totalLeads },
    { data: views30 },
    { data: leads30 },
    { data: products },
  ] = await Promise.all([
    supabase
      .from("shop_views")
      .select("*", { count: "exact", head: true })
      .eq("shop_id", shop.id),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("shop_id", shop.id),
    supabase
      .from("shop_views")
      .select("product_id, created_at")
      .eq("shop_id", shop.id)
      .gte("created_at", since30)
      .limit(10000),
    supabase
      .from("leads")
      .select("product_id, product_title, created_at")
      .eq("shop_id", shop.id)
      .gte("created_at", since30)
      .limit(5000),
    supabase.from("products").select("id, title").eq("shop_id", shop.id),
  ]);

  const vlist = (views30 ?? []) as ViewRow[];
  const llist = (leads30 ?? []) as LeadRow[];
  const titleOf = new Map(
    ((products ?? []) as { id: string; title: string }[]).map((p) => [
      p.id,
      p.title,
    ])
  );

  // ---- Last 7 days buckets (oldest → newest) ----
  const dayStarts: number[] = [];
  const labels: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    dayStarts.push(d.getTime());
    labels.push(d.toLocaleDateString("en-GB", { weekday: "short" }));
  }
  const bucket = (iso: string) => {
    const t = new Date(iso).getTime();
    for (let i = 6; i >= 0; i--) {
      if (t >= dayStarts[i]) return i;
    }
    return -1;
  };
  const viewsPerDay = new Array(7).fill(0) as number[];
  const leadsPerDay = new Array(7).fill(0) as number[];
  for (const v of vlist) {
    const b = bucket(v.created_at);
    if (b >= 0) viewsPerDay[b]++;
  }
  for (const l of llist) {
    const b = bucket(l.created_at);
    if (b >= 0) leadsPerDay[b]++;
  }
  const views7 = viewsPerDay.reduce((a, b) => a + b, 0);
  const leads7 = leadsPerDay.reduce((a, b) => a + b, 0);
  const maxV = Math.max(1, ...viewsPerDay);

  // ---- Top products (last 30 days) ----
  const viewCounts = new Map<string, number>();
  for (const v of vlist) {
    if (v.product_id) {
      viewCounts.set(v.product_id, (viewCounts.get(v.product_id) ?? 0) + 1);
    }
  }
  const leadCounts = new Map<string, number>();
  for (const l of llist) {
    if (l.product_id) {
      leadCounts.set(l.product_id, (leadCounts.get(l.product_id) ?? 0) + 1);
    }
  }
  const idSet = new Set<string>();
  viewCounts.forEach((_, id) => idSet.add(id));
  leadCounts.forEach((_, id) => idSet.add(id));
  const top = Array.from(idSet)
    .map((id) => ({
      id,
      title: titleOf.get(id) ?? "Removed product",
      views: viewCounts.get(id) ?? 0,
      orders: leadCounts.get(id) ?? 0,
    }))
    .sort((a, b) => b.orders * 3 + b.views - (a.orders * 3 + a.views))
    .slice(0, 8);

  return (
    <div>
      <h1 className="display text-2xl font-bold mb-1">Analytics</h1>
      <p className="text-sm text-soft mb-6">
        How your shop is doing — views and WhatsApp orders.
      </p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Stat label="Views · 7 days" value={views7} />
        <Stat label="WhatsApp orders · 7 days" value={leads7} highlight={leads7 > 0} />
        <Stat label="Views · all time" value={totalViews ?? 0} />
        <Stat label="Orders · all time" value={totalLeads ?? 0} />
      </div>

      {/* 7-day views chart */}
      <div className="rounded-xl bg-white border border-line p-5 mb-8">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="display font-bold">Views this week</h2>
          <span className="text-sm text-soft">{views7} total</span>
        </div>
        <div className="flex items-end gap-2 h-32">
          {viewsPerDay.map((v, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col items-center justify-end h-full"
            >
              <span className="text-[10px] text-soft mb-0.5">{v || ""}</span>
              <div
                className={`w-full rounded-t ${v ? "bg-berry" : "bg-line"}`}
                style={{
                  height: `${Math.max(v ? 8 : 3, (v / maxV) * 85)}%`,
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-1.5">
          {labels.map((l, i) => (
            <span
              key={i}
              className="flex-1 text-center text-[11px] text-soft"
            >
              {l}
            </span>
          ))}
        </div>
      </div>

      {/* Top products */}
      <div className="rounded-xl bg-white border border-line p-5 mb-8">
        <h2 className="display font-bold mb-4">
          Top products <span className="text-sm font-normal text-soft">last 30 days</span>
        </h2>
        {top.length === 0 ? (
          <p className="text-sm text-soft">
            No product activity yet. Share your shop link to get your first
            views!
          </p>
        ) : (
          <div className="space-y-2">
            {top.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-lg border border-line px-3 py-2.5"
              >
                <span className="text-sm font-bold text-soft w-5 shrink-0">
                  {i + 1}
                </span>
                <span className="font-medium truncate flex-1 min-w-0">
                  {p.title}
                </span>
                <span className="text-xs text-soft shrink-0">
                  👁 {p.views}
                </span>
                <span
                  className={`text-xs shrink-0 ${
                    p.orders > 0 ? "text-leaf font-semibold" : "text-soft"
                  }`}
                >
                  💬 {p.orders}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Helpful nudge */}
      {views7 > 0 && leads7 === 0 && (
        <div className="rounded-xl bg-sand border border-line p-4 text-sm text-soft mb-8">
          💡 People are viewing your shop but haven&apos;t ordered this week.
          Clear photos, prices and sizes on every product help turn views into
          WhatsApp orders.
        </div>
      )}
      {views7 === 0 && (
        <div className="rounded-xl bg-sand border border-line p-4 text-sm mb-8">
          <p className="text-soft">
            💡 No views yet this week. Share your shop link on WhatsApp status
            and Facebook — that&apos;s where your customers are:
          </p>
          <p className="mt-2 font-mono text-xs bg-white border border-line rounded-lg px-3 py-2 break-all">
            andumpola.lk/{shop.slug}
          </p>
        </div>
      )}

      <Link
        href="/dashboard/orders"
        className="text-sm text-berry font-semibold"
      >
        View all orders →
      </Link>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight ? "border-leaf bg-leaf/5" : "border-line bg-white"
      }`}
    >
      <p className="text-xs text-soft">{label}</p>
      <p className="display text-2xl font-bold mt-0.5">{value}</p>
    </div>
  );
}
