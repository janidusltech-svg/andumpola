// app/admin/subscriptions/page.tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatLKR } from "@/lib/types";
import SubReviewButtons from "@/components/admin/SubReviewButtons";

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter = "pending" } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("subscription_payments")
    .select("*, shops(name, slug)")
    .order("created_at", { ascending: false });

  if (filter !== "all") query = query.eq("status", filter);

  const { data: payments } = await query;

  // pre-generate signed URLs for receipts
  const withUrls = await Promise.all(
    (payments ?? []).map(async (p) => {
      let url: string | null = null;
      if (p.receipt_url) {
        const { data } = await supabase.storage
          .from("receipts")
          .createSignedUrl(p.receipt_url, 3600);
        url = data?.signedUrl ?? null;
      }
      return { ...p, signedReceipt: url };
    })
  );

  const tabs = ["pending", "approved", "rejected", "all"];

  return (
    <div>
      <h1 className="display text-2xl font-bold mb-4">Subscription payments</h1>

      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <Link
            key={t}
            href={`/admin/subscriptions?filter=${t}`}
            className={`rounded-full px-3 py-1.5 text-sm border capitalize ${
              filter === t
                ? "bg-berry text-white border-berry"
                : "bg-white border-line hover:border-berry"
            }`}
          >
            {t}
          </Link>
        ))}
      </div>

      {withUrls.length === 0 ? (
        <p className="text-soft">Nothing here.</p>
      ) : (
        <div className="space-y-3">
          {withUrls.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-line rounded-xl p-4 flex items-start justify-between gap-4 flex-wrap"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/${p.shops?.slug}`}
                    target="_blank"
                    className="font-semibold hover:text-berry"
                  >
                    {p.shops?.name}
                  </Link>
                  <StatusBadge status={p.status} />
                </div>
                <p className="text-sm text-soft mt-1">
                  {p.plan.toUpperCase()} · {p.months} month(s) ·{" "}
                  <strong className="text-ink">{formatLKR(p.amount)}</strong>
                </p>
                <p className="text-xs text-soft">
                  {new Date(p.created_at).toLocaleString()}
                </p>
                {p.signedReceipt && (
                  <a
                    href={p.signedReceipt}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-berry underline mt-2 inline-block"
                  >
                    View deposit receipt →
                  </a>
                )}
                {p.admin_note && (
                  <p className="text-xs text-soft mt-1">Note: {p.admin_note}</p>
                )}
              </div>
              {p.status === "pending" && <SubReviewButtons paymentId={p.id} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-turmeric/20 text-turmeric",
    approved: "bg-leaf/15 text-leaf",
    rejected: "bg-berry/15 text-berry",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
        map[status] || "bg-line"
      }`}
    >
      {status}
    </span>
  );
}
