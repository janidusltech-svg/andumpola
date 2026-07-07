// app/admin/shops/page.tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ShopStatusButtons from "@/components/admin/ShopStatusButtons";

export default async function AdminShopsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("shops")
    .select("*, products(count), orders(count)")
    .order("created_at", { ascending: false });

  if (filter === "pending") query = query.eq("status", "pending");
  else if (filter === "active") query = query.eq("status", "active");
  else if (filter === "suspended") query = query.eq("status", "suspended");

  const { data: shops } = await query;

  const tabs = [
    { key: undefined, label: "All" },
    { key: "pending", label: "Pending" },
    { key: "active", label: "Active" },
    { key: "suspended", label: "Suspended" },
  ];

  return (
    <div>
      <h1 className="display text-2xl font-bold mb-4">Shops</h1>

      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <Link
            key={t.label}
            href={t.key ? `/admin/shops?filter=${t.key}` : "/admin/shops"}
            className={`rounded-full px-3 py-1.5 text-sm border ${
              filter === t.key
                ? "bg-berry text-white border-berry"
                : "bg-white border-line hover:border-berry"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {!shops || shops.length === 0 ? (
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
            return (
              <div
                key={s.id}
                className="bg-white border border-line rounded-xl p-4 flex items-start justify-between gap-4 flex-wrap"
              >
                <div className="flex gap-3 min-w-0">
                  <div className="h-12 w-12 rounded-lg bg-line/40 overflow-hidden shrink-0">
                    {s.logo_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.logo_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/${s.slug}`}
                        target="_blank"
                        className="font-semibold hover:text-berry truncate"
                      >
                        {s.name}
                      </Link>
                      <StatusBadge status={s.status} />
                    </div>
                    <p className="text-sm text-soft">
                      {s.city || "—"} · {productCount} products · {orderCount}{" "}
                      orders · {s.plan}
                    </p>
                    <p className="text-xs text-soft mt-0.5">
                      📞 {s.phone} · WA {s.whatsapp}
                    </p>
                  </div>
                </div>
                <ShopStatusButtons shopId={s.id} status={s.status} />
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
