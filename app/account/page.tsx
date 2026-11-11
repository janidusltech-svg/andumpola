// app/account/page.tsx — "My account" for everyone who is logged in
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatLKR } from "@/lib/types";
import { statusInfo } from "@/lib/order-status";
import SignOutButton from "@/components/SignOutButton";
import AccountForms from "@/components/AccountForms";

export const dynamic = "force-dynamic";
export const metadata = { title: "My account — AndumPola" };

const LEAD_STATUS: Record<string, { label: string; cls: string }> = {
  new: { label: "Sent to shop", cls: "bg-turmeric/20 text-ink" },
  contacted: { label: "Shop replied", cls: "bg-sand border border-line" },
  confirmed: { label: "Confirmed", cls: "bg-leaf/15 text-leaf" },
  delivered: { label: "Delivered", cls: "bg-leaf text-white" },
  cancelled: { label: "Cancelled", cls: "bg-berry/15 text-berry" },
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/account/login?next=/account");

  const [{ data: profile }, { data: orders }, { data: leads }, { count: savedCount }] =
    await Promise.all([
      supabase.from("profiles").select("role, full_name").eq("id", user.id).single(),
      supabase
        .from("orders")
        .select("id, order_ref, status, total, quantity, size, created_at, products(title), shops(name, slug)")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("leads")
        .select("id, product_id, product_title, size, quantity, status, created_at, shops(name, slug)")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("saved_products")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

  const role = profile?.role ?? "customer";
  const name =
    profile?.full_name ||
    (user.user_metadata?.full_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "there";
  const isGoogle = user.app_metadata?.provider === "google";
  const isPhoneLogin = user.email?.endsWith("@owners.andumpola.lk");
  const one = <T,>(x: T | T[] | null | undefined) => (Array.isArray(x) ? x[0] : x);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-14 w-14 rounded-full bg-berry text-white display text-2xl font-bold flex items-center justify-center shrink-0">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h1 className="display text-2xl font-bold truncate">Hi, {name}</h1>
          <p className="text-sm text-soft truncate">
            {isPhoneLogin ? "Logged in with phone number" : user.email}
            {" · "}
            {role === "shop_owner" ? "Shop owner" : role === "admin" ? "Admin" : "Customer"}
          </p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {role === "shop_owner" && <Tile href="/dashboard" icon="🏪" label="My shop" />}
        {role === "admin" && <Tile href="/admin" icon="🛠️" label="Admin" />}
        <Tile href="/cart" icon="🛒" label="Cart" />
        <Tile href="/account/saved" icon="♥" label={`Saved${savedCount ? ` (${savedCount})` : ""}`} />
        <Tile href="/track" icon="📦" label="Track order" />
        {role === "customer" && <Tile href="/search" icon="🔍" label="Browse" />}
      </div>

      {/* WhatsApp orders */}
      <Section title="My WhatsApp orders">
        {!leads || leads.length === 0 ? (
          <Empty text="Orders you send to shops on WhatsApp (while logged in) show here." />
        ) : (
          leads.map((l) => {
            const shop = one(l.shops) as { name?: string; slug?: string } | undefined;
            const st = LEAD_STATUS[l.status as string] ?? LEAD_STATUS.new;
            return (
              <Row
                key={l.id}
                title={l.product_title ?? "Product"}
                href={shop?.slug && l.product_id ? `/${shop.slug}/${l.product_id}` : undefined}
                sub={`${shop?.name ?? ""}${l.size ? ` · Size ${l.size}` : ""} · Qty ${l.quantity} · ${fmt(l.created_at)}`}
                badge={<span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${st.cls}`}>{st.label}</span>}
              />
            );
          })
        )}
      </Section>

      {/* Bank orders */}
      <Section title="My bank-transfer orders">
        {!orders || orders.length === 0 ? (
          <Empty text="Orders you pay by bank transfer show here with their status." />
        ) : (
          orders.map((o) => {
            const shop = one(o.shops) as { name?: string } | undefined;
            const prod = one(o.products) as { title?: string } | undefined;
            const st = statusInfo(o.status);
            return (
              <Row
                key={o.id}
                title={prod?.title ?? "Order"}
                href={`/track?ref=${encodeURIComponent(o.order_ref)}`}
                sub={`${shop?.name ?? ""} · ${formatLKR(o.total)} · #${o.order_ref} · ${fmt(o.created_at)}`}
                badge={<span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${st.cls}`}>{st.label}</span>}
              />
            );
          })
        )}
      </Section>

      {/* Profile & password */}
      <Section title="Account settings">
        <AccountForms
          initialName={name === "there" ? "" : name}
          initialPhone={(user.user_metadata?.phone as string | undefined) ?? ""}
          canChangePassword={!isGoogle}
        />
      </Section>

      <div className="max-w-xs mt-6">
        <SignOutButton />
      </div>
    </div>
  );
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function Tile({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl bg-white border border-line p-4 text-center hover:border-berry transition-colors"
    >
      <span className="text-2xl">{icon}</span>
      <p className="text-sm font-semibold mt-1">{label}</p>
    </Link>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="display text-lg font-bold mb-3">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="text-sm text-soft bg-white border border-line rounded-xl p-4">{text}</p>
  );
}

function Row({
  title,
  sub,
  badge,
  href,
}: {
  title: string;
  sub: string;
  badge: React.ReactNode;
  href?: string;
}) {
  const inner = (
    <div className="flex items-center justify-between gap-3 bg-white border border-line rounded-xl p-3 hover:border-berry">
      <div className="min-w-0">
        <p className="font-medium truncate">{title}</p>
        <p className="text-xs text-soft truncate">{sub}</p>
      </div>
      <div className="shrink-0">{badge}</div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
