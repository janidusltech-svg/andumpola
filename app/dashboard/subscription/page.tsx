// app/dashboard/subscription/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatLKR } from "@/lib/types";
import SubscriptionForm from "@/components/SubscriptionForm";

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

  const { data: payments } = await supabase
    .from("subscription_payments")
    .select("*")
    .eq("shop_id", shop.id)
    .order("created_at", { ascending: false });

  const now = Date.now();
  const trialLeft = Math.max(
    0,
    Math.ceil((new Date(shop.trial_ends_at).getTime() - now) / 86400000)
  );

  return (
    <div>
      <h1 className="display text-2xl font-bold mb-6">Subscription</h1>

      {/* Current status */}
      <div className="rounded-xl bg-white border border-line p-5 mb-6">
        <p className="text-sm text-soft">Current plan</p>
        <p className="display text-xl font-bold capitalize">
          {shop.plan}
          {shop.plan === "trial" && ` · ${trialLeft} days left`}
        </p>
        {shop.plan === "trial" && (
          <p className="text-sm text-soft mt-1">
            Enjoy your free trial. Upgrade any time to keep your shop live
            after it ends.
          </p>
        )}
      </div>

      {/* Plans */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <PlanCard
          name="Basic"
          price={1000}
          features={["Up to 150 products", "Your own shop page", "WhatsApp & call orders", "Global search listing"]}
        />
        <PlanCard
          name="Pro"
          price={2000}
          highlight
          features={["Unlimited products", "Everything in Basic", "Priority in search", "Online order system"]}
        />
      </div>

      {/* Payment instructions + upload */}
      <SubscriptionForm shopId={shop.id} />

      {/* History */}
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
                  {p.plan.toUpperCase()} · {p.months} month(s) ·{" "}
                  {formatLKR(p.amount)}
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
}: {
  name: string;
  price: number;
  features: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        highlight ? "border-berry bg-berry/5" : "border-line bg-white"
      }`}
    >
      <div className="flex items-baseline justify-between">
        <p className="display font-bold text-lg">{name}</p>
        {highlight && (
          <span className="text-[11px] bg-berry text-white rounded-full px-2 py-0.5">
            Popular
          </span>
        )}
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
    </div>
  );
}
