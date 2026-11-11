// app/dashboard/subscription/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatLKR } from "@/lib/types";
import SubscriptionForm from "@/components/SubscriptionForm";
import { PLANS, PAID_PLANS, planInfo, shopExpiry, fmtDate } from "@/lib/plan";

export default async function SubscriptionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: shop } = await supabase
    .from("shops")
    .select("*")
    .eq("owner_id", user!.id)
    .maybeSingle();
  if (!shop) redirect("/dashboard");

  const [{ data: payments }, { count: productCount }] = await Promise.all([
    supabase
      .from("subscription_payments")
      .select("*")
      .eq("shop_id", shop.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("shop_id", shop.id),
  ]);

  const exp = shopExpiry(shop);
  const current = planInfo(shop.plan);
  const pendingPay = payments?.find((p) => p.status === "pending");

  return (
    <div>
      <h1 className="display text-2xl font-bold mb-6">Subscription</h1>

      {/* Current status */}
      <div
        className={`rounded-xl border p-5 mb-6 ${
          exp.closed || exp.expired
            ? "border-berry bg-berry/5"
            : exp.expiringSoon
            ? "border-turmeric bg-turmeric/10"
            : "border-line bg-white"
        }`}
      >
        <p className="text-sm text-soft">Current plan</p>
        <p className="display text-xl font-bold">
          {current.name} ·{" "}
          {exp.closed
            ? "Shop closed"
            : exp.expired
            ? "Ended"
            : `${exp.daysLeft} day${exp.daysLeft === 1 ? "" : "s"} left`}
        </p>
        <p className="text-sm text-soft mt-1">
          {exp.closed
            ? "Your shop is hidden from customers. Pay below and it opens again as soon as we approve."
            : exp.expired
            ? `Your plan ended on ${fmtDate(exp.endIso)}. Your shop closes in ${exp.graceLeft} day(s) unless you renew.`
            : `Ends on ${fmtDate(exp.endIso)}.`}
          {exp.isTrial && !exp.expired && " You have full Pro access during your trial."}
        </p>
        <p className="text-sm mt-2">
          Products: <strong>{productCount ?? 0}</strong>
          {current.maxProducts !== Infinity && ` / ${current.maxProducts}`}
        </p>
        {pendingPay && (
          <p className="text-sm mt-2 text-turmeric font-medium">
            ⏳ Your payment of {formatLKR(pendingPay.amount)} is waiting for
            approval (usually within 24 hours).
          </p>
        )}
      </div>

      {/* Plans */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {PAID_PLANS.map((k) => (
          <PlanCard
            key={k}
            name={PLANS[k].name}
            price={PLANS[k].price}
            features={PLANS[k].features}
            highlight={k === "pro"}
            current={shop.plan === k}
            tooSmall={
              PLANS[k].maxProducts !== Infinity &&
              (productCount ?? 0) > PLANS[k].maxProducts
            }
          />
        ))}
      </div>

      <SubscriptionForm
        shopId={shop.id}
        defaultPlan={shop.plan === "trial" ? "pro" : (shop.plan as "basic" | "pro" | "ultra")}
      />

      {payments && payments.length > 0 && (
        <div className="mt-8">
          <h2 className="display font-bold mb-3">Payment history</h2>
          <div className="space-y-2">
            {payments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between bg-white border border-line rounded-lg p-3 text-sm"
              >
                <span>
                  {String(p.plan).toUpperCase()} · {p.months} month(s) ·{" "}
                  {formatLKR(p.amount)} · {fmtDate(p.created_at)}
                </span>
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
          </div>
        </div>
      )}
    </div>
  );
}

function PlanCard({
  name,
  price,
  features,
  highlight,
  current,
  tooSmall,
}: {
  name: string;
  price: number;
  features: string[];
  highlight?: boolean;
  current?: boolean;
  tooSmall?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        highlight ? "border-berry bg-berry/5" : "border-line bg-white"
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="display font-bold text-lg">{name}</p>
        {current ? (
          <span className="text-[11px] bg-leaf text-white rounded-full px-2 py-0.5">
            Your plan
          </span>
        ) : highlight ? (
          <span className="text-[11px] bg-berry text-white rounded-full px-2 py-0.5">
            Popular
          </span>
        ) : null}
      </div>
      <p className="mt-1">
        <span className="display text-2xl font-bold">{formatLKR(price)}</span>
        <span className="text-soft text-sm"> / month</span>
      </p>
      <ul className="mt-3 space-y-1.5 text-sm">
        {features.map((ft) => (
          <li key={ft} className="flex gap-2">
            <span className="text-leaf">✓</span>
            {ft}
          </li>
        ))}
      </ul>
      {tooSmall && (
        <p className="mt-3 text-xs text-turmeric">
          You have more products than this plan allows — nothing is deleted,
          but you can&apos;t add more until you&apos;re under the limit.
        </p>
      )}
    </div>
  );
}
