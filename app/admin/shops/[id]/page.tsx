// app/admin/shops/[id]/page.tsx — one shop: owner, plan, trial, payments, tools
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatLKR } from "@/lib/types";
import { shopExpiry, fmtDate, planInfo } from "@/lib/plan";
import PlanControls from "@/components/admin/PlanControls";
import ShopStatusButtons from "@/components/admin/ShopStatusButtons";
import OwnerTools from "@/components/admin/OwnerTools";

export const dynamic = "force-dynamic";

export default async function AdminShopDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Admin check (the layout checks too; this guards the service-role reads)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (me?.role !== "admin") redirect("/");

  const db = supabaseAdmin();
  const { data: shop } = await db.from("shops").select("*").eq("id", id).maybeSingle();
  if (!shop) notFound();

  const since30 = new Date(Date.now() - 30 * 86400000).toISOString();
  const [owner, products, orders, leads, views, { data: payments }] =
    await Promise.all([
      db.auth.admin.getUserById(shop.owner_id),
      db.from("products").select("*", { count: "exact", head: true }).eq("shop_id", id),
      db.from("orders").select("*", { count: "exact", head: true }).eq("shop_id", id),
      db.from("leads").select("*", { count: "exact", head: true }).eq("shop_id", id).gte("created_at", since30),
      db.from("shop_views").select("*", { count: "exact", head: true }).eq("shop_id", id).gte("created_at", since30),
      db
        .from("subscription_payments")
        .select("*")
        .eq("shop_id", id)
        .order("created_at", { ascending: false }),
    ]);

  const ownerEmail = owner.data?.user?.email ?? "—";
  const exp = shopExpiry(shop);
  const totalPaid =
    payments
      ?.filter((p) => p.status === "approved")
      .reduce((s, p) => s + Number(p.amount), 0) ?? 0;
  const wa = String(shop.whatsapp || shop.phone || "").replace(/\D/g, "");
  const waNum = wa.startsWith("0") ? `94${wa.slice(1)}` : wa;
  const price = planInfo(shop.plan === "trial" ? "pro" : shop.plan).price;
  const reminder = encodeURIComponent(
    exp.closed
      ? `Hi ${shop.name} 👋 Your AndumPola shop is closed because your plan ended. Renew from your dashboard (Subscription) and it opens again right away: https://www.andumpola.lk/dashboard/subscription`
      : exp.expired
      ? `Hi ${shop.name} 👋 Your AndumPola ${exp.label} plan has ended. Your shop will close in ${exp.graceLeft} day(s) unless you renew. Plans start from Rs 500/month: https://www.andumpola.lk/dashboard/subscription`
      : `Hi ${shop.name} 👋 Your AndumPola ${exp.label} plan ends on ${fmtDate(exp.endIso)} (${exp.daysLeft} day(s) left). Renew to keep your shop online — Rs ${price.toLocaleString()}/month: https://www.andumpola.lk/dashboard/subscription`
  );

  return (
    <div className="max-w-3xl">
      <Link href="/admin/shops" className="text-sm text-soft hover:text-berry">
        ← All shops
      </Link>

      {/* Header */}
      <div className="mt-3 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex gap-3 min-w-0">
          <div className="h-14 w-14 rounded-xl bg-line/40 overflow-hidden shrink-0">
            {shop.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={shop.logo_url} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <div className="min-w-0">
            <h1 className="display text-2xl font-bold truncate">{shop.name}</h1>
            <p className="text-sm text-soft">
              {shop.city || "—"} · joined {fmtDate(shop.created_at)} · {shop.status}
            </p>
            <Link
              href={`/${shop.slug}`}
              target="_blank"
              className="text-sm text-berry font-medium"
            >
              andumpola.lk/{shop.slug} ↗
            </Link>
          </div>
        </div>
        <ShopStatusButtons shopId={shop.id} status={shop.status} />
      </div>

      {/* Plan status */}
      <div
        className={`mt-6 rounded-xl border p-5 ${
          exp.expired
            ? "border-berry bg-berry/5"
            : exp.expiringSoon
            ? "border-turmeric bg-turmeric/10"
            : "border-leaf/40 bg-leaf/5"
        }`}
      >
        <p className="text-sm text-soft">Current plan</p>
        <p className="display text-2xl font-bold">
          {exp.label} ·{" "}
          {exp.expired
            ? "Expired"
            : `${exp.daysLeft} day${exp.daysLeft === 1 ? "" : "s"} left`}
        </p>
        <p className="text-sm text-soft mt-1">
          {exp.expired ? "Ended" : "Ends"} {fmtDate(exp.endIso)}
          {exp.closed
            ? " — shop is CLOSED to customers until renewed."
            : exp.expired
            ? ` — shop closes in ${exp.graceLeft} day(s) unless renewed.`
            : ""}
        </p>
        {waNum && (
          <a
            href={`https://wa.me/${waNum}?text=${reminder}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 rounded-lg bg-[#25D366] text-white text-sm font-semibold px-3 py-1.5"
          >
            📩 Send renewal reminder on WhatsApp
          </a>
        )}
      </div>

      {/* Owner + numbers */}
      <div className="mt-4 grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-line bg-white p-4 text-sm space-y-1.5">
          <p className="font-semibold mb-1">Owner</p>
          <p>✉️ {ownerEmail}</p>
          <p>📞 {shop.phone || "—"}</p>
          <p>💬 WhatsApp {shop.whatsapp || "—"}</p>
          {waNum && (
            <a
              href={`https://wa.me/${waNum}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 rounded-lg bg-[#25D366] text-white font-semibold px-3 py-1.5"
            >
              Message owner on WhatsApp
            </a>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Mini label="Products" value={products.count ?? 0} />
          <Mini label="Bank orders" value={orders.count ?? 0} />
          <Mini label="Views (30d)" value={views.count ?? 0} />
          <Mini label="WhatsApp orders (30d)" value={leads.count ?? 0} />
        </div>
      </div>

      <div className="mt-4">
        <OwnerTools
          shopId={shop.id}
          shopName={shop.name}
          slug={shop.slug}
          phone={String(shop.whatsapp || shop.phone || "")}
        />
      </div>

      {/* Tools */}
      <h2 className="display font-bold text-lg mt-8 mb-3">Manage plan</h2>
      <PlanControls shopId={shop.id} plan={shop.plan} endIso={exp.endIso} />

      {/* Payments */}
      <h2 className="display font-bold text-lg mt-8 mb-3">
        Payments · {formatLKR(totalPaid)} paid
      </h2>
      {!payments || payments.length === 0 ? (
        <p className="text-sm text-soft">No payments yet.</p>
      ) : (
        <div className="space-y-2">
          {payments.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 bg-white border border-line rounded-lg p-3 text-sm"
            >
              <div>
                <p>
                  {String(p.plan).toUpperCase()} · {p.months} month(s) ·{" "}
                  <strong>{formatLKR(p.amount)}</strong>
                  {p.method === "manual" && (
                    <span className="ml-2 text-[11px] rounded-full bg-sand border border-line px-2 py-0.5">
                      cash
                    </span>
                  )}
                </p>
                <p className="text-xs text-soft">
                  {fmtDate(p.created_at)}
                  {p.admin_note ? ` · ${p.admin_note}` : ""}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                  p.status === "approved"
                    ? "bg-leaf/15 text-leaf"
                    : p.status === "rejected"
                    ? "bg-berry/15 text-berry"
                    : "bg-turmeric/20 text-turmeric"
                }`}
              >
                {p.status}
              </span>
            </div>
          ))}
          {payments.some((p) => p.status === "pending") && (
            <Link href="/admin/subscriptions" className="text-sm text-berry font-medium">
              Review pending payments →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-line bg-white p-3">
      <p className="text-xs text-soft">{label}</p>
      <p className="display text-xl font-bold">{value}</p>
    </div>
  );
}
