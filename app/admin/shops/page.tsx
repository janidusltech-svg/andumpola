// app/admin/shops/page.tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ShopStatusButtons from "@/components/admin/ShopStatusButtons";
import { shopExpiry, fmtDate } from "@/lib/plan";

export const dynamic = "force-dynamic";

export default async function AdminShopsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>;
}) {
  const { filter, q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("shops")
    .select("*, products(count), orders(count)")
    .order("created_at", { ascending: false });

  if (filter === "pending") query = query.eq("status", "pending");
  else if (filter === "active") query = query.eq("status", "active");
  else if (filter === "suspended") query = query.eq("status", "suspended");
  else if (filter === "closed") query = query.eq("status", "expired");
  else if (filter === "trial") query = query.eq("plan", "trial");
  else if (filter === "paid") query = query.neq("plan", "trial");
  if (q?.trim()) query = query.ilike("name", `%${q.trim()}%`);

  const { data } = await query;

  let shops = (data ?? []).map((s) => ({ ...s, exp: shopExpiry(s) }));
  if (filter === "expiring") shops = shops.filter((s) => s.exp.expiringSoon);
  if (filter === "expired") shops = shops.filter((s) => s.exp.expired);
  if (filter === "expiring" || filter === "expired")
    shops.sort((a, b) => a.exp.daysLeft - b.exp.daysLeft);

  const tabs = [
    { key: undefined, label: "All" },
    { key: "pending", label: "Pending" },
    { key: "active", label: "Active" },
    { key: "suspended", label: "Suspended" },
    { key: "trial", label: "On trial" },
    { key: "paid", label: "Paid" },
    { key: "expiring", label: "⏳ Ending ≤7 days" },
    { key: "expired", label: "⛔ Expired" },
    { key: "closed", label: "🔒 Closed (unpaid)" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="display text-2xl font-bold">Shops</h1>
        <Link
          href="/admin/shops/new"
          className="rounded-lg bg-berry text-white text-sm font-semibold px-4 py-2"
        >
          + Sign up a shop
        </Link>
      </div>

      <form className="mb-3">
        {filter && <input type="hidden" name="filter" value={filter} />}
        <input
          name="q"
          defaultValue={q}
          placeholder="Search shop name…"
          className="w-full sm:w-72 rounded-lg border border-line bg-white px-3 py-2 text-sm focus:outline-none focus:border-berry"
        />
      </form>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1">
        {tabs.map((t) => (
          <Link
            key={t.label}
            href={t.key ? `/admin/shops?filter=${t.key}` : "/admin/shops"}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm border ${
              filter === t.key
                ? "bg-berry text-white border-berry"
                : "bg-white border-line hover:border-berry"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {shops.length === 0 ? (
        <p className="text-soft">No shops in this view.</p>
      ) : (
        <div className="space-y-3">
          {shops.map((s) => {
            const productCount = Array.isArray(s.products)
              ? s.products[0]?.count ?? 0
              : 0;
            const orderCount = Array.isArray(s.orders)
              ? s.orders[0]?.count ?? 0
              : 0;
            const { exp } = s;
            return (
              <div
                key={s.id}
                className="bg-white border border-line rounded-xl p-4 flex items-start justify-between gap-4 flex-wrap"
              >
                <div className="flex gap-3 min-w-0">
                  <div className="h-12 w-12 rounded-lg bg-line/40 overflow-hidden shrink-0">
                    {s.logo_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.logo_url} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/admin/shops/${s.id}`}
                        className="font-semibold hover:text-berry truncate"
                      >
                        {s.name}
                      </Link>
                      <StatusBadge status={s.status} />
                      <span
                        className={`text-[11px] font-semibold rounded-full px-2 py-0.5 ${
                          exp.expired
                            ? "bg-berry text-white"
                            : exp.expiringSoon
                            ? "bg-turmeric/25 text-ink"
                            : "bg-sand border border-line"
                        }`}
                      >
                        {exp.label} ·{" "}
                        {exp.expired ? "expired" : `${exp.daysLeft}d left`}
                      </span>
                    </div>
                    <p className="text-sm text-soft">
                      {s.city || "—"} · {productCount} products · {orderCount} orders
                    </p>
                    <p className="text-xs text-soft mt-0.5">
                      📞 {s.phone} · {exp.expired ? "ended" : "ends"} {fmtDate(exp.endIso)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Link
                    href={`/admin/shops/${s.id}`}
                    className="rounded-lg bg-ink text-white text-sm font-semibold px-4 py-2"
                  >
                    Manage →
                  </Link>
                  <ShopStatusButtons shopId={s.id} status={s.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-turmeric/20 text-turmeric",
    active: "bg-leaf/15 text-leaf",
    suspended: "bg-berry/15 text-berry",
    expired: "bg-berry text-white",
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
