// app/dashboard/page.tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CreateShopForm from "@/components/CreateShopForm";
import { formatLKR } from "@/lib/types";

export default async function DashboardHome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: shop } = await supabase
    .from("shops")
    .select("*")
    .eq("owner_id", user!.id)
    .maybeSingle();

  // First time — no shop yet
  if (!shop) {
    return (
      <div>
        <h1 className="display text-2xl font-bold mb-1">
          Welcome to AndumPola 🎉
        </h1>
        <p className="text-soft mb-6">
          Let&apos;s set up your shop. Takes 2 minutes.
        </p>
        <CreateShopForm />
      </div>
    );
  }

  // Has shop — show stats
  const [{ count: productCount }, { data: pendingOrders }] = await Promise.all([
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("shop_id", shop.id),
    supabase
      .from("orders")
      .select("id, total")
      .eq("shop_id", shop.id)
      .eq("status", "pending"),
  ]);

  const pendingCount = pendingOrders?.length ?? 0;

  return (
    <div>
      <h1 className="display text-2xl font-bold mb-6">Overview</h1>

      {shop.status === "pending" && (
        <div className="mb-6 rounded-xl bg-turmeric/15 border border-turmeric/40 p-4 text-sm">
          Your shop is <strong>awaiting admin approval</strong>. Once approved,
          it becomes visible to customers. You can add products in the
          meantime.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Stat label="Products" value={String(productCount ?? 0)} />
        <Stat label="Pending orders" value={String(pendingCount)} highlight={pendingCount > 0} />
        <Stat
          label="Your shop page"
          value="View →"
          href={`/${shop.slug}`}
        />
      </div>

      <div className="mt-8 flex gap-3 flex-wrap">
        <Link
          href="/dashboard/products/new"
          className="rounded-lg bg-berry text-white font-semibold px-5 py-2.5 hover:bg-berry-dark"
        >
          + Add product
        </Link>
        <Link
          href="/dashboard/orders"
          className="rounded-lg border border-line font-semibold px-5 py-2.5 hover:border-berry hover:text-berry"
        >
          View orders
        </Link>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  href,
  highlight,
}: {
  label: string;
  value: string;
  href?: string;
  highlight?: boolean;
}) {
  const inner = (
    <div
      className={`rounded-xl border p-5 ${
        highlight ? "border-berry bg-berry/5" : "border-line bg-white"
      }`}
    >
      <p className="text-sm text-soft">{label}</p>
      <p className="display text-2xl font-bold mt-1">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
