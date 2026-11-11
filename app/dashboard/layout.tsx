// app/dashboard/layout.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";
import { countNewOrders } from "@/lib/new-orders";
import { shopExpiry, fmtDate } from "@/lib/plan";

// AndumPola support WhatsApp (change here if the number changes)
const SUPPORT_WA = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "94772453769";

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

  const newOrders = shop ? (await countNewOrders(supabase, shop.id)).total : 0;

  // No shop yet → force create-shop screen (except on the create route itself)
  const nav = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/products", label: "Products" },
    { href: "/dashboard/orders", label: "Orders" },
    { href: "/dashboard/analytics", label: "Analytics" },
    { href: "/dashboard/subscription", label: "Subscription" },
    { href: "/dashboard/settings", label: "Shop settings" },
    { href: "/dashboard/guide", label: "Setup guide" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 md:py-8">
      <div className="flex flex-col md:flex-row gap-5 md:gap-8">
        {/* Sidebar */}
        <aside className="md:w-56 shrink-0">
          <div className="bg-white border border-line rounded-xl px-4 py-3 md:p-4 flex items-center justify-between gap-3 md:block">
            <p className="text-xs text-soft hidden md:block">Shop</p>
            <p className="display font-bold truncate min-w-0">
              {shop?.name || "Not set up yet"}
            </p>
            {shop && <ShopStatus shop={shop} />}
          </div>

          <nav className="mt-3 md:mt-4 flex md:flex-col gap-1.5 md:gap-1 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 pb-1 [scrollbar-width:none]">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="shrink-0 rounded-full md:rounded-lg border border-line bg-white md:border-0 md:bg-transparent px-3.5 md:px-3 py-1.5 md:py-2 text-sm font-medium hover:bg-white hover:text-berry whitespace-nowrap inline-flex items-center gap-1.5"
              >
                {n.label}
                {n.href === "/dashboard/orders" && newOrders > 0 && (
                  <span className="rounded-full bg-berry text-white text-[11px] font-bold px-1.5 min-w-[1.25rem] text-center">
                    {newOrders}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <a
            href={`https://wa.me/${SUPPORT_WA}?text=${encodeURIComponent(
              `Hi AndumPola team! I need help with my shop${
                shop?.name ? ` "${shop.name}"` : ""
              }.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 md:mt-4 flex items-center justify-center gap-2 rounded-lg bg-leaf text-white text-sm font-semibold px-3 py-2 md:py-2.5 hover:opacity-90"
          >
            💬 Need help? WhatsApp us
          </a>

          {/* on phones, sign out lives in the Account page (top-right icon) */}
          <div className="mt-4 hidden md:block">
            <SignOutButton />
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {shop && shop.status !== "pending" && shop.status !== "suspended" && (
            <PlanBanner shop={shop} />
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

type PlanShop = {
  status: string;
  plan: string;
  trial_ends_at: string | null;
  subscription_ends_at: string | null;
};

function ShopStatus({ shop }: { shop: PlanShop }) {
  let label = "";
  let color = "";
  const exp = shopExpiry(shop);

  if (shop.status === "pending") {
    label = "Awaiting approval";
    color = "bg-turmeric/20 text-turmeric";
  } else if (shop.status === "suspended") {
    label = "Suspended";
    color = "bg-berry/15 text-berry";
  } else if (exp.closed) {
    label = "Closed · renew plan";
    color = "bg-berry text-white";
  } else if (exp.expired) {
    label = `${exp.label} ended`;
    color = "bg-berry/15 text-berry";
  } else {
    label = `${exp.isTrial ? "Free trial" : exp.label} · ${exp.daysLeft} days left`;
    color = exp.expiringSoon
      ? "bg-turmeric/20 text-turmeric"
      : "bg-leaf/15 text-leaf";
  }

  return (
    <span
      className={`inline-block shrink-0 md:mt-2 rounded-full px-2.5 py-1 text-[11px] font-medium ${color}`}
    >
      {label}
    </span>
  );
}

/** Renewal reminder shown on every dashboard page when it matters */
function PlanBanner({ shop }: { shop: PlanShop }) {
  const exp = shopExpiry(shop);
  if (!exp.closed && !exp.expired && !exp.expiringSoon) return null;

  const text = exp.closed
    ? "🔒 Your shop is closed to customers because your plan ended. Renew now and it opens again as soon as we approve your payment."
    : exp.expired
    ? `⚠️ Your ${exp.isTrial ? "free trial" : exp.label + " plan"} ended on ${fmtDate(exp.endIso)}. Your shop will close in ${exp.graceLeft} day${exp.graceLeft === 1 ? "" : "s"} unless you renew.`
    : `⏳ Your ${exp.isTrial ? "free trial" : exp.label + " plan"} ends in ${exp.daysLeft} day${exp.daysLeft === 1 ? "" : "s"} (${fmtDate(exp.endIso)}). Choose a plan to keep your shop online — from Rs 500/month.`;

  return (
    <div
      className={`mb-5 rounded-xl border p-4 text-sm flex flex-col sm:flex-row sm:items-center gap-3 justify-between ${
        exp.closed || exp.expired
          ? "bg-berry/5 border-berry"
          : "bg-turmeric/10 border-turmeric/50"
      }`}
    >
      <p>{text}</p>
      <Link
        href="/dashboard/subscription"
        className="shrink-0 rounded-lg bg-berry text-white font-semibold px-4 py-2 text-center"
      >
        {exp.isTrial ? "Choose a plan" : "Renew now"}
      </Link>
    </div>
  );
}
