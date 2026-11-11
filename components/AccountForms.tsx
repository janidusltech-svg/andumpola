"use client";
// components/AccountForms.tsx — edit name/phone, change password
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AccountForms({
  initialName,
  initialPhone,
  canChangePassword,
}: {
  initialName: string;
  initialPhone: string;
  canChangePassword: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const input =
    "mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-berry/40";

  async function saveProfile() {
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const [a, b] = await Promise.all([
      supabase.auth.updateUser({ data: { full_name: name.trim(), phone: phone.trim() } }),
      user
        ? supabase.from("profiles").update({ full_name: name.trim() }).eq("id", user.id)
        : Promise.resolve({ error: null }),
    ]);
    setBusy(false);
    const err = a.error || b.error;
    setMsg(err ? { ok: false, text: err.message } : { ok: true, text: "Saved" });
    if (!err) router.refresh();
  }

  async function changePassword() {
    if (pw.length < 6) return setMsg({ ok: false, text: "Password must be at least 6 characters" });
    if (pw !== pw2) return setMsg({ ok: false, text: "Passwords don't match" });
    setBusy(true);
    setMsg(null);
    const { error } = await createClient().auth.updateUser({ password: pw });
    setBusy(false);
    setPw("");
    setPw2("");
    setMsg(error ? { ok: false, text: error.message } : { ok: true, text: "Password changed" });
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="rounded-xl bg-white border border-line p-4 space-y-3">
        <p className="font-semibold text-sm">Your details</p>
        <label className="block text-sm">
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className={input} />
        </label>
        <label className="block text-sm">
          Phone
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" maxLength={20} placeholder="07X XXX XXXX" className={input} />
        </label>
        <button
          type="button"
          disabled={busy}
          onClick={saveProfile}
          className="rounded-lg bg-berry text-white text-sm font-semibold px-4 py-2 disabled:opacity-60"
        >
          Save
        </button>
      </div>

      {canChangePassword ? (
        <div className="rounded-xl bg-white border border-line p-4 space-y-3">
          <p className="font-semibold text-sm">Change password</p>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password" autoComplete="new-password" className={input} />
          <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Repeat new password" autoComplete="new-password" className={input} />
          <button
            type="button"
            disabled={busy || !pw}
            onClick={changePassword}
            className="rounded-lg bg-ink text-white text-sm font-semibold px-4 py-2 disabled:opacity-60"
          >
            Change password
          </button>
        </div>
      ) : (
        <div className="rounded-xl bg-white border border-line p-4 text-sm text-soft">
          You sign in with Google, so there&apos;s no AndumPola password to change.
        </div>
      )}

      {msg && (
        <p className={`sm:col-span-2 text-sm ${msg.ok ? "text-leaf" : "text-berry"}`}>
          {msg.ok ? "✅ " : "⚠️ "}
          {msg.text}
        </p>
      )}
    </div>
  );
}
