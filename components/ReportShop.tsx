"use client";
// components/ReportShop.tsx — lets customers flag fake / scam shops
import { useState } from "react";

const REASONS = [
  "Scam / didn't deliver",
  "Fake or copied products",
  "Wrong prices or info",
  "Offensive content",
  "Other",
];

export default function ReportShop({ shopId }: { shopId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState("");
  const [contact, setContact] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">(
    "idle"
  );

  async function send() {
    setState("sending");
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shop_id: shopId, reason, details, contact }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done")
    return (
      <p className="text-sm text-leaf">
        Thanks — our team will check this shop.
      </p>
    );

  if (!open)
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-soft underline hover:text-berry"
      >
        🚩 Report this shop
      </button>
    );

  return (
    <div className="rounded-xl border border-line bg-white p-4 max-w-md space-y-2">
      <p className="font-semibold text-sm">Report this shop</p>
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full rounded-lg border border-line px-3 py-2 text-sm bg-white"
      >
        {REASONS.map((r) => (
          <option key={r}>{r}</option>
        ))}
      </select>
      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        maxLength={1000}
        rows={3}
        placeholder="What happened? (optional)"
        className="w-full rounded-lg border border-line px-3 py-2 text-sm"
      />
      <input
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        maxLength={100}
        placeholder="Your phone or email (optional, so we can follow up)"
        className="w-full rounded-lg border border-line px-3 py-2 text-sm"
      />
      {state === "error" && (
        <p className="text-xs text-berry">Couldn&apos;t send. Try again.</p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={state === "sending"}
          onClick={send}
          className="rounded-lg bg-berry text-white text-sm font-semibold px-4 py-2 disabled:opacity-60"
        >
          {state === "sending" ? "Sending…" : "Send report"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-line text-sm px-4 py-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
