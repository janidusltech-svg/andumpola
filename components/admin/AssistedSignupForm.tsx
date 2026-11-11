"use client";
// components/admin/AssistedSignupForm.tsx
import { useState, useTransition } from "react";
import Link from "next/link";
import { createShopForOwner, type AssistedResult } from "@/app/admin/actions";
import { welcomeMsg, waLink } from "@/lib/wa-templates";

const SITE = "https://www.andumpola.lk";

export default function AssistedSignupForm() {
  const [busy, start] = useTransition();
  const [err, setErr] = useState("");
  const [done, setDone] = useState<(AssistedResult & { phone: string; name: string }) | null>(null);
  const [copied, setCopied] = useState(false);
  const [f, setF] = useState({
    shopName: "",
    ownerName: "",
    phone: "",
    whatsapp: "",
    email: "",
    city: "",
    vertical: "clothing" as "clothing" | "furniture" | "electronics",
  });

  const input =
    "mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-berry/40";

  function submit() {
    setErr("");
    start(async () => {
      try {
        const r = await createShopForOwner(f);
        setDone({ ...r, phone: f.whatsapp || f.phone, name: f.shopName });
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  }

  if (done) {
    const msg = welcomeMsg({
      shopName: done.name,
      slug: done.slug,
      email: done.email,
      password: done.password,
    });
    return (
      <div className="rounded-xl border border-leaf/40 bg-leaf/5 p-5 space-y-4">
        <p className="display text-xl font-bold">✅ {done.name} is live!</p>
        <div className="rounded-lg bg-white border border-line p-4 text-sm space-y-1">
          <p>
            Shop page:{" "}
            <a href={`/${done.slug}`} target="_blank" className="text-berry font-medium">
              {SITE.replace("https://", "")}/{done.slug}
            </a>
          </p>
          <p>
            Login:{" "}
            <strong>
              {done.email.endsWith("@owners.andumpola.lk")
                ? `phone number 0${done.email.split("@")[0].replace(/^94/, "")}`
                : done.email}
            </strong>
          </p>
          <p>Password: <strong className="font-mono">{done.password}</strong></p>
          <p className="text-xs text-turmeric pt-1">
            ⚠️ The password is shown only now. Send it to the owner before you
            leave this page.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          <a
            href={waLink(done.phone, msg)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-[#25D366] text-white font-semibold px-4 py-2.5 text-center"
          >
            📩 Send welcome + login on WhatsApp
          </a>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(msg).then(() => setCopied(true));
            }}
            className="rounded-lg border border-line bg-white font-semibold px-4 py-2.5"
          >
            {copied ? "Copied ✓" : "Copy message"}
          </button>
          <a
            href={`/print/${done.slug}`}
            target="_blank"
            className="rounded-lg border border-line bg-white font-semibold px-4 py-2.5 text-center"
          >
            🖨️ Counter poster
          </a>
          <Link
            href={`/admin/shops/${done.shopId}`}
            className="rounded-lg bg-ink text-white font-semibold px-4 py-2.5 text-center"
          >
            Manage shop →
          </Link>
        </div>
        <button
          type="button"
          onClick={() => {
            setDone(null);
            setCopied(false);
            setF({ ...f, shopName: "", ownerName: "", phone: "", whatsapp: "", email: "" });
          }}
          className="text-sm text-berry underline"
        >
          + Sign up another shop
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-white p-5 space-y-3">
      <label className="block text-sm font-medium">
        Shop name *
        <input value={f.shopName} onChange={(e) => setF({ ...f, shopName: e.target.value })} placeholder="Nimal Fashion" className={input} />
      </label>
      <div>
        <span className="text-sm font-medium">Sells *</span>
        <div className="grid grid-cols-3 gap-2 mt-1">
          {(["clothing", "furniture", "electronics"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setF({ ...f, vertical: v })}
              className={`rounded-lg border px-2 py-2 text-sm capitalize ${
                f.vertical === v ? "bg-berry text-white border-berry" : "border-line"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <label className="block text-sm font-medium">
        Owner name
        <input value={f.ownerName} onChange={(e) => setF({ ...f, ownerName: e.target.value })} placeholder="Nimal Perera" className={input} />
      </label>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block text-sm font-medium">
          Phone *
          <input value={f.phone} inputMode="tel" onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="0771234567" className={input} />
        </label>
        <label className="block text-sm font-medium">
          WhatsApp (if different)
          <input value={f.whatsapp} inputMode="tel" onChange={(e) => setF({ ...f, whatsapp: e.target.value })} placeholder="same as phone" className={input} />
        </label>
      </div>
      <label className="block text-sm font-medium">
        Owner email (optional)
        <input value={f.email} type="email" onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="leave empty if they don't use email" className={input} />
        <span className="text-[11px] text-soft font-normal">
          No email? They log in with their <strong>phone number</strong> and
          the password we create. You can reset it any time from admin.
        </span>
      </label>
      <label className="block text-sm font-medium">
        Town
        <input value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} placeholder="Maharagama" className={input} />
      </label>
      {err && <p className="text-sm text-berry">{err}</p>}
      <button
        type="button"
        disabled={busy || !f.shopName || !f.phone}
        onClick={submit}
        className="w-full rounded-lg bg-berry text-white font-semibold py-3 disabled:opacity-60"
      >
        {busy ? "Creating…" : "Create shop & login"}
      </button>
      <p className="text-[11px] text-soft">
        The owner adds logo, products, location and bank details later from
        their dashboard (or you help them right there).
      </p>
    </div>
  );
}
