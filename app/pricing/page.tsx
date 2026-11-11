// app/pricing/page.tsx — public pricing page (show this to shop owners)
import Link from "next/link";
import BackButton from "@/components/BackButton";
import { PLANS, PAID_PLANS } from "@/lib/plan";
import { formatLKR } from "@/lib/types";

export const metadata = {
  title: "Pricing — AndumPola",
  description:
    "Your own online shop page in minutes. 60 days free, then plans from Rs 500 a month.",
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <div className="mb-4">
        <BackButton label="Back" fallback="/" />
      </div>

      <div className="text-center max-w-2xl mx-auto">
        <h1 className="display text-3xl sm:text-5xl font-extrabold leading-tight">
          Your shop online, <span className="text-berry">without a website.</span>
        </h1>
        <p className="mt-3 text-soft sm:text-lg">
          Get your own shop link like{" "}
          <strong className="text-ink">andumpola.lk/yourshop</strong>, add your
          products, and take orders on WhatsApp.
        </p>
      </div>

      {/* Trial callout */}
      <div className="mt-8 rounded-2xl bg-berry text-white p-6 sm:p-8 text-center">
        <p className="display text-2xl sm:text-3xl font-bold">
          Start with 60 days FREE
        </p>
        <p className="mt-2 text-white/90">
          Full Pro access · up to 150 products · online orders ·{" "}
          {PLANS.trial.aiPhotos} free AI product photos. No payment needed to start.
        </p>
        <Link
          href="/signup"
          className="inline-block mt-5 rounded-lg bg-white text-berry font-bold px-6 py-3"
        >
          Open my shop free →
        </Link>
      </div>

      {/* Plans */}
      <h2 className="display text-xl font-bold mt-12 mb-4 text-center">
        After your free trial
      </h2>
      <div className="grid sm:grid-cols-3 gap-4">
        {PAID_PLANS.map((k) => {
          const p = PLANS[k];
          const hl = k === "pro";
          return (
            <div
              key={k}
              className={`rounded-2xl border p-6 flex flex-col ${
                hl ? "border-berry bg-berry/5 shadow-sm" : "border-line bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="display font-bold text-xl">{p.name}</p>
                {hl && (
                  <span className="text-[11px] bg-berry text-white rounded-full px-2 py-0.5">
                    Most popular
                  </span>
                )}
              </div>
              <p className="mt-2">
                <span className="display text-3xl font-extrabold">
                  {formatLKR(p.price)}
                </span>
                <span className="text-soft text-sm"> / month</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-leaf">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`mt-6 text-center rounded-lg font-semibold px-4 py-2.5 ${
                  hl ? "bg-berry text-white" : "border border-berry text-berry"
                }`}
              >
                Start free
              </Link>
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="mt-12 grid sm:grid-cols-2 gap-4 text-sm">
        <Faq q="Do I need a card to start?">
          No. Your first 60 days are free. Pick a plan only when you want to
          continue.
        </Faq>
        <Faq q="How do I pay?">
          By bank deposit — upload the slip in your dashboard and we activate
          your plan within 24 hours.
        </Faq>
        <Faq q="Does AndumPola take a commission?">
          No. Customers order directly with you on WhatsApp and pay you directly.
        </Faq>
        <Faq q="What if I don't renew?">
          You get a 7-day reminder period. After that your shop is hidden until
          you renew — your products and data are kept safe.
        </Faq>
      </div>
    </div>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <p className="font-semibold">{q}</p>
      <p className="text-soft mt-1">{children}</p>
    </div>
  );
}
