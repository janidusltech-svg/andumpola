"use client";
// components/admin/ShopStatusButtons.tsx
import { useState, useTransition } from "react";
import { setShopStatus } from "@/app/admin/actions";

export default function ShopStatusButtons({
  shopId,
  status,
}: {
  shopId: string;
  status: string;
}) {
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState("");

  function act(next: "active" | "suspended" | "pending") {
    setErr("");
    startTransition(async () => {
      try {
        await setShopStatus(shopId, next);
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        {status !== "active" && (
          <button
            onClick={() => act("active")}
            disabled={pending}
            className="rounded-lg bg-leaf text-white text-sm font-semibold px-4 py-2 disabled:opacity-60"
          >
            {status === "pending" ? "Approve" : "Activate"}
          </button>
        )}
        {status !== "suspended" && (
          <button
            onClick={() => {
              if (confirm("Suspend this shop? It will be hidden from customers."))
                act("suspended");
            }}
            disabled={pending}
            className="rounded-lg border border-berry text-berry text-sm font-semibold px-4 py-2 disabled:opacity-60"
          >
            Suspend
          </button>
        )}
        {status === "suspended" && (
          <button
            onClick={() => act("active")}
            disabled={pending}
            className="rounded-lg bg-leaf text-white text-sm font-semibold px-4 py-2 disabled:opacity-60"
          >
            Un-suspend
          </button>
        )}
      </div>
      {err && <span className="text-xs text-berry">{err}</span>}
    </div>
  );
}
