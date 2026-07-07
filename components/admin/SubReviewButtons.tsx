"use client";
// components/admin/SubReviewButtons.tsx
import { useState, useTransition } from "react";
import { reviewSubscription } from "@/app/admin/actions";

export default function SubReviewButtons({
  paymentId,
}: {
  paymentId: string;
}) {
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState("");

  function act(decision: "approved" | "rejected") {
    setErr("");
    let note: string | undefined;
    if (decision === "rejected") {
      note = prompt("Reason for rejection (optional):") ?? "";
    } else {
      if (!confirm("Approve this payment? The shop's subscription will extend automatically."))
        return;
    }
    startTransition(async () => {
      try {
        await reviewSubscription(paymentId, decision, note);
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <button
          onClick={() => act("approved")}
          disabled={pending}
          className="rounded-lg bg-leaf text-white text-sm font-semibold px-4 py-2 disabled:opacity-60"
        >
          {pending ? "…" : "Approve"}
        </button>
        <button
          onClick={() => act("rejected")}
          disabled={pending}
          className="rounded-lg border border-berry text-berry text-sm font-semibold px-4 py-2 disabled:opacity-60"
        >
          Reject
        </button>
      </div>
      {err && <span className="text-xs text-berry">{err}</span>}
    </div>
  );
}
