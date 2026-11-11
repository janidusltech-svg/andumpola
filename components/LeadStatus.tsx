"use client";
// components/LeadStatus.tsx — owner sets a WhatsApp order's status
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const OPTIONS = [
  { v: "new", label: "New", cls: "bg-turmeric/20 text-ink" },
  { v: "contacted", label: "Contacted", cls: "bg-sand text-ink" },
  { v: "confirmed", label: "Confirmed", cls: "bg-leaf/15 text-leaf" },
  { v: "delivered", label: "Delivered", cls: "bg-ink/10 text-ink" },
  { v: "cancelled", label: "Cancelled", cls: "bg-berry/15 text-berry" },
];

export default function LeadStatus({ id, status }: { id: string; status: string }) {
  const [value, setValue] = useState(status || "new");
  const [busy, setBusy] = useState(false);
  const cls = OPTIONS.find((o) => o.v === value)?.cls ?? "bg-sand";

  async function change(v: string) {
    const prev = value;
    setValue(v);
    setBusy(true);
    const { error } = await createClient().from("leads").update({ status: v }).eq("id", id);
    if (error) setValue(prev);
    setBusy(false);
  }

  return (
    <select
      value={value}
      disabled={busy}
      onChange={(e) => change(e.target.value)}
      className={`rounded-full px-3 py-1 text-xs font-semibold border border-line ${cls}`}
    >
      {OPTIONS.map((o) => (
        <option key={o.v} value={o.v}>{o.label}</option>
      ))}
    </select>
  );
}
