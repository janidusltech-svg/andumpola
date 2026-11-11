"use client";
import { useTransition } from "react";
import { resolveReport } from "@/app/admin/actions";

export default function ResolveReportButton({ id }: { id: string }) {
  const [busy, start] = useTransition();
  return (
    <button
      disabled={busy}
      onClick={() => start(() => resolveReport(id))}
      className="rounded-lg border border-line text-sm px-3 py-1.5 hover:border-leaf disabled:opacity-60"
    >
      {busy ? "…" : "✓ Mark resolved"}
    </button>
  );
}
