"use client";
// components/SubscriptionForm.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { uploadReceipt } from "@/lib/upload";
import { formatLKR } from "@/lib/types";

// YOUR bank details — the platform owner. EDIT THESE.
const ADMIN_BANK = {
  bank: "HATTON NATIONAL BANK",
  branch: "Athurugiriya",
  name: "G J S Priyabhashitha",
  account: "154020031662",
};

const PRICES = { basic: 1000, pro: 2000 };

export default function SubscriptionForm({ shopId }: { shopId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [plan, setPlan] = useState<"basic" | "pro">("basic");
  const [months, setMonths] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const amount = PRICES[plan] * months;

  async function submit() {
    setError("");
    setMsg("");
    if (!file) {
      setError("Please upload your bank deposit receipt.");
      return;
    }
    setLoading(true);
    try {
      const receiptPath = await uploadReceipt(file, `sub/${shopId}`);
      const { error } = await supabase.from("subscription_payments").insert({
        shop_id: shopId,
        plan,
        months,
        amount,
        receipt_url: receiptPath,
        status: "pending",
      });
      if (error) throw error;
      setMsg(
        "Receipt submitted! Your subscription activates once the admin approves it."
      );
      setFile(null);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl bg-white border border-line p-6">
      <h2 className="display font-bold mb-4">Pay & upload receipt</h2>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <label className="block">
          <span className="text-sm font-medium">Plan</span>
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value as "basic" | "pro")}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 bg-white"
          >
            <option value="basic">Basic — {formatLKR(PRICES.basic)}/mo</option>
            <option value="pro">Pro — {formatLKR(PRICES.pro)}/mo</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Months</span>
          <select
            value={months}
            onChange={(e) => setMonths(parseInt(e.target.value))}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 bg-white"
          >
            {[1, 3, 6, 12].map((m) => (
              <option key={m} value={m}>
                {m} month{m > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Bank details to pay */}
      <div className="rounded-lg bg-sand p-4 text-sm mb-4">
        <p className="font-semibold mb-2">
          Deposit {formatLKR(amount)} to:
        </p>
        <dl className="space-y-1 text-soft">
          <Row k="Bank" v={ADMIN_BANK.bank} />
          <Row k="Branch" v={ADMIN_BANK.branch} />
          <Row k="Account name" v={ADMIN_BANK.name} />
          <Row k="Account number" v={ADMIN_BANK.account} />
        </dl>
        <p className="text-xs mt-2">
          After depositing, upload the receipt below. Admin approves within 24
          hours.
        </p>
      </div>

      <label className="block mb-4">
        <span className="text-sm font-medium">Deposit receipt</span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="mt-1 w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-berry file:px-3 file:py-2 file:text-white file:font-medium"
        />
        {file && (
          <span className="text-xs text-leaf mt-1 block">{file.name}</span>
        )}
      </label>

      {error && <p className="text-sm text-berry mb-2">{error}</p>}
      {msg && <p className="text-sm text-leaf mb-2">{msg}</p>}

      <button
        onClick={submit}
        disabled={loading}
        className="rounded-lg bg-berry text-white font-semibold px-6 py-3 hover:bg-berry-dark disabled:opacity-60"
      >
        {loading ? "Submitting…" : `Submit ${formatLKR(amount)} payment`}
      </button>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <dt>{k}</dt>
      <dd className="font-medium text-ink">{v}</dd>
    </div>
  );
}
