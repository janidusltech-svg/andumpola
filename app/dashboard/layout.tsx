// app/dashboard/layout.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Customers don't belong in the shop dashboard
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role === "customer") redirect("/account/saved");

  const { data: shop } = await supabase
    .from("shops")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  // No shop yet → force create-shop screen (except on the create route itself)
  const nav = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/products", label: "Products" },
    { href: "/dashboard/orders", label: "Orders" },
    { href: "/dashboard/subscription", label: "Subscription" },
    { href: "/dashboard/settings", label: "Shop settings" },
    { href: "/dashboard/guide", label: "Setup guide" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="md:w-56 shrink-0">
          <div className="bg-white border border-line rounded-xl p-4">
            <p className="text-xs text-soft">Shop</p>
            <p className="display font-bold truncate">
              {shop?.name || "Not set up yet"}
            </p>
            {shop && <ShopStatus shop={shop} />}
          </div>

          <nav className="mt-4 flex md:flex-col gap-1 overflow-x-auto">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-white hover:text-berry whitespace-nowrap"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="mt-4">
            <SignOutButton />
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}

function ShopStatus({
  shop,
}: {
  shop: { status: string; plan: string; trial_ends_at: string; subscription_ends_at: string | null };
}) {
  const now = Date.now();
  let label = "";
  let color = "";

  if (shop.status === "pending") {
    label = "Awaiting approval";
    color = "bg-turmeric/20 text-turmeric";
  } else if (shop.status === "suspended") {
    label = "Suspended";
    color = "bg-berry/15 text-berry";
  } else if (shop.plan === "trial") {
    const days = Math.max(
      0,
      Math.ceil((new Date(shop.trial_ends_at).getTime() - now) / 86400000)
    );
    label = `Free trial · ${days} days left`;
    color = "bg-leaf/15 text-leaf";
  } else {
    const end = shop.subscription_ends_at
      ? new Date(shop.subscription_ends_at).getTime()
      : 0;
    const days = Math.max(0, Math.ceil((end - now) / 86400000));
    label = `${shop.plan.toUpperCase()} · ${days} days left`;
    color = days > 0 ? "bg-leaf/15 text-leaf" : "bg-berry/15 text-berry";
  }

  return (
    <span
      className={`inline-block mt-2 rounded-full px-2.5 py-1 text-[11px] font-medium ${color}`}
    >
      {label}
    </span>
  );
}
