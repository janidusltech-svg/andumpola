// app/admin/page.tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatLKR } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const supabase = await createClient();

  const [
    { count: totalShops },
    { count: pendingShops },
    { count: activeShops },
    { count: suspendedShops },
    { count: totalProducts },
    { count: totalOrders },
    { count: totalCustomers },
    { data: pendingSubs },
    { data: approvedSubs },
    { data: recentShops },
  ] = await Promise.all([
    supabase.from("shops").select("*", { count: "exact", head: true }),
    supabase
      .from("shops")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("shops")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("shops")
      .select("*", { count: "exact", head: true })
      .eq("status", "suspended"),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "customer"),
    supabase.from("subscription_payments").select("id").eq("status", "pending"),
    supabase
      .from("subscription_payments")
      .select("amount, plan")
      .eq("status", "approved"),
    supabase
      .from("shops")
      .select("name, slug, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const revenue =
    approvedSubs?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;
  const basicRevenue =
    approvedSubs
      ?.filter((p) => p.plan === "basic")
      .reduce((s, p) => s + Number(p.amount), 0) ?? 0;
  const proRevenue =
    approvedSubs
      ?.filter((p) => p.plan === "pro")
      .reduce((s, p) => s + Number(p.amount), 0) ?? 0;
  const pendingSubCount = pendingSubs?.length ?? 0;

  return (
    <div>
      <h1 className="display text-2xl font-bold mb-6">Dashboard</h1>

      {(pendingShops ?? 0) > 0 || pendingSubCount > 0 ? (
        <div className="mb-6 rounded-xl bg-turmeric/15 border border-turmeric/40 p-4 text-sm space-y-1">
          {(pendingShops ?? 0) > 0 && (
            <p>
              🏪 <strong>{pendingShops}</strong> shop(s) waiting for approval —{" "}
              <Link href="/admin/shops?filter=pending" className="text-berry underline">
                review
              </Link>
            </p>
          )}
          {pendingSubCount > 0 && (
            <p>
              💳 <strong>{pendingSubCount}</strong> payment(s) to verify —{" "}
              <Link href="/admin/subscriptions" className="text-berry underline">
                review
              </Link>
            </p>
          )}
        </div>
      ) : (
        <div className="mb-6 rounded-xl bg-leaf/10 border border-leaf/30 p-4 text-sm">
          ✅ All caught up — nothing pending.
        </div>
      )}

      <SectionTitle>Shops</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Stat label="Total shops" value={String(totalShops ?? 0)} />
        <Stat label="Active" value={String(activeShops ?? 0)} tone="leaf" />
        <Stat
          label="Pending"
          value={String(pendingShops ?? 0)}
          tone={(pendingShops ?? 0) > 0 ? "berry" : undefined}
        />
        <Stat label="Suspended" value={String(suspendedShops ?? 0)} />
      </div>

      <SectionTitle>Activity</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <Stat label="Total products" value={String(totalProducts ?? 0)} />
        <Stat label="Total orders" value={String(totalOrders ?? 0)} />
        <Stat label="Customers" value={String(totalCustomers ?? 0)} />
      </div>

      <SectionTitle>Revenue (approved subscriptions)</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <Stat label="Total earned" value={formatLKR(revenue)} tone="leaf" />
        <Stat label="From Basic" value={formatLKR(basicRevenue)} />
        <Stat label="From Pro" value={formatLKR(proRevenue)} />
      </div>

      <SectionTitle>Newest shops</SectionTitle>
      <div className="bg-white border border-line rounded-xl divide-y divide-line">
        {(recentShops ?? []).map((s) => (
          <Link
            key={s.slug}
            href={`/admin/shops`}
            className="flex items-center justify-between px-4 py-3 hover:bg-sand"
          >
            <span className="font-medium">{s.name}</span>
            <span className="text-xs text-soft">
              {new Date(s.created_at).toLocaleDateString()} · {s.status}
            </span>
          </Link>
        ))}
        {(!recentShops || recentShops.length === 0) && (
          <p className="px-4 py-3 text-soft text-sm">No shops yet.</p>
        )}
      </div>

      <p className="mt-6">
        <Link href="/admin/shops" className="text-berry font-medium text-sm">
          See all shops &amp; per-shop analytics →
        </Link>
      </p>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="display font-bold text-lg mb-3 text-soft">{children}</h2>;
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "leaf" | "berry";
}) {
  const toneClass =
    tone === "leaf"
      ? "border-leaf/40 bg-leaf/5"
      : tone === "berry"
      ? "border-berry bg-berry/5"
      : "border-line bg-white";
  return (
    <div className={`rounded-xl border p-5 ${toneClass}`}>
      <p className="text-sm text-soft">{label}</p>
      <p className="display text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
