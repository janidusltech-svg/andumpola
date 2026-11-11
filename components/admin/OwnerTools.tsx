"use client";
// components/admin/OwnerTools.tsx — WhatsApp templates, poster, password reset
import { useState, useTransition } from "react";
import { resetOwnerPassword } from "@/app/admin/actions";
import {
  welcomeMsg,
  howToAddProductsMsg,
  shareTipsMsg,
  waLink,
} from "@/lib/wa-templates";

export default function OwnerTools({
  shopId,
  shopName,
  slug,
  phone,
}: {
  shopId: string;
  shopName: string;
  slug: string;
  phone: string;
}) {
  const [busy, start] = useTransition();
  const [login, setLogin] = useState<{ email: string; password: string } | null>(null);
  const [err, setErr] = useState("");

  const btn =
    "rounded-lg border border-line bg-white text-sm font-medium px-3 py-2 text-center hover:border-berry";

  return (
    <div className="rounded-xl border border-line bg-white p-4 space-y-3">
      <p className="font-semibold">📲 Send to owner</p>
      <div className="grid sm:grid-cols-3 gap-2">
        <a className={btn} target="_blank" rel="noopener noreferrer"
           href={waLink(phone, welcomeMsg({ shopName, slug }))}>
          👋 Welcome
        </a>
        <a className={btn} target="_blank" rel="noopener noreferrer"
           href={waLink(phone, howToAddProductsMsg(shopName))}>
          ➕ How to add products
        </a>
        <a className={btn} target="_blank" rel="noopener noreferrer"
           href={waLink(phone, shareTipsMsg(shopName, slug))}>
          📣 Get more orders
        </a>
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        <a className={btn} target="_blank" href={`/print/${slug}`}>
          🖨️ Counter poster (QR)
        </a>
        <button
          type="button"
          disabled={busy}
          className={btn}
          onClick={() => {
            if (!confirm("Make a new password for this owner? Their old one stops working.")) return;
            setErr("");
            start(async () => {
              try {
                setLogin(await resetOwnerPassword(shopId));
              } catch (e) {
                setErr(e instanceof Error ? e.message : "Failed");
              }
            });
          }}
        >
          🔑 Reset owner password
        </button>
      </div>
      {err && <p className="text-sm text-berry">{err}</p>}
      {login && (
        <div className="rounded-lg bg-sand border border-line p-3 text-sm space-y-1">
          <p>Email: <strong>{login.email}</strong></p>
          <p>New password: <strong className="font-mono">{login.password}</strong></p>
          <a
            className="inline-block mt-1 rounded-lg bg-[#25D366] text-white font-semibold px-3 py-1.5"
            target="_blank"
            rel="noopener noreferrer"
            href={waLink(
              phone,
              `Hi ${shopName}, your new AndumPola login:\nhttps://www.andumpola.lk/login\n${
                login.email.endsWith("@owners.andumpola.lk")
                  ? `Phone number: 0${login.email.split("@")[0].replace(/^94/, "")}`
                  : `Email: ${login.email}`
              }\nPassword: ${login.password}`
            )}
          >
            Send on WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
