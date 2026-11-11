// app/join/page.tsx — show this on your phone when you visit a shop
import Link from "next/link";
import { supabasePublic } from "@/lib/supabase/public";
import { ShopCard } from "@/components/cards";
import { PLANS, PAID_PLANS } from "@/lib/plan";
import { formatLKR, Shop } from "@/lib/types";
import { T } from "@/lib/i18n";

export const revalidate = 300;

export const metadata = {
  title: "Put your shop online for free — AndumPola",
  description:
    "Your own shop website in 2 minutes. Customers order on WhatsApp. 60 days free, then from Rs 500 a month.",
};

const SUPPORT_WA = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "94772453769";

export default async function JoinPage() {
  const { data: shops } = await supabasePublic()
    .from("shops")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(3);

  const wa = `https://wa.me/${SUPPORT_WA}?text=${encodeURIComponent(
    "Hi! I want to put my shop on AndumPola."
  )}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center">
        <p className="inline-block rounded-full bg-berry/10 text-berry text-sm font-semibold px-3 py-1">
          <T k="joinBadge" />
        </p>
        <h1 className="display text-3xl sm:text-5xl font-extrabold leading-tight mt-4">
          <T k="joinTitleA" /> <span className="text-berry"><T k="joinTitleB" /></span>
        </h1>
        <p className="mt-3 text-soft sm:text-lg">
          <T k="joinSub" />
        </p>
      </div>

      {/* How it works */}
      <div className="mt-10 grid sm:grid-cols-3 gap-3">
        {(
          [
            ["1", "joinStep1"],
            ["2", "joinStep2"],
            ["3", "joinStep3"],
          ] as const
        ).map(([n, k]) => (
          <div key={n} className="rounded-2xl bg-white border border-line p-5">
            <span className="h-8 w-8 rounded-full bg-berry text-white font-bold flex items-center justify-center">
              {n}
            </span>
            <p className="font-semibold mt-3"><T k={k} /></p>
          </div>
        ))}
      </div>

      {/* What you get */}
      <div className="mt-8 rounded-2xl bg-white border border-line p-6">
        <h2 className="display text-xl font-bold mb-3">What you get</h2>
        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {[
            "Your own link: andumpola.lk/yourshop",
            "Products with photos, sizes, prices & stock",
            "“Order on WhatsApp” button on every product",
            "Found by customers searching across Sri Lanka",
            "See views & orders in your dashboard",
            "QR poster for your counter",
            "Delivery & cash-on-delivery info shown",
            "Free AI product photos (coming soon)",
          ].map((x) => (
            <li key={x} className="flex gap-2">
              <span className="text-leaf">✓</span>
              {x}
            </li>
          ))}
        </ul>
      </div>

      {/* Real shops */}
      {shops && shops.length > 0 && (
        <div className="mt-8">
          <h2 className="display text-xl font-bold mb-3">
            Shops already on AndumPola
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(shops as Shop[]).map((s) => (
              <ShopCard key={s.id} shop={s} />
            ))}
          </div>
        </div>
      )}

      {/* Price */}
      <div className="mt-8 rounded-2xl bg-berry text-white p-6 text-center">
        <p className="display text-2xl font-bold">60 days FREE · then from {formatLKR(PLANS.basic.price)}/month</p>
        <p className="text-white/85 text-sm mt-1">
          {PAID_PLANS.map((k) => `${PLANS[k].name} ${formatLKR(PLANS[k].price)}`).join(" · ")}
          {" · "}
          <Link href="/pricing" className="underline">See plans</Link>
        </p>
        <div className="mt-5 grid sm:grid-cols-2 gap-3 max-w-md mx-auto">
          <Link
            href="/signup"
            className="rounded-lg bg-white text-berry font-bold px-5 py-3"
          >
            Start free now
          </Link>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-[#25D366] text-white font-bold px-5 py-3"
          >
            💬 Help me set it up
          </a>
        </div>
      </div>
    </div>
  );
}
