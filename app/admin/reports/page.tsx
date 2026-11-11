// app/admin/reports/page.tsx — shops reported by customers
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ResolveReportButton from "@/components/admin/ResolveReportButton";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ show?: string }>;
}) {
  const { show } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (me?.role !== "admin") redirect("/");

  let q = supabaseAdmin()
    .from("shop_reports")
    .select("*, shops(id, name, slug)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (show !== "all") q = q.eq("resolved", false);
  const { data: reports } = await q;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="display text-2xl font-bold">Reports</h1>
        <Link
          href={show === "all" ? "/admin/reports" : "/admin/reports?show=all"}
          className="text-sm text-berry font-medium"
        >
          {show === "all" ? "Show open only" : "Show all"}
        </Link>
      </div>
      {!reports || reports.length === 0 ? (
        <p className="text-soft">No reports. 🎉</p>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div
              key={r.id}
              className={`bg-white border rounded-xl p-4 ${
                r.resolved ? "border-line opacity-60" : "border-berry/40"
              }`}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <Link
                    href={`/admin/shops/${r.shops?.id}`}
                    className="font-semibold hover:text-berry"
                  >
                    {r.shops?.name ?? "Deleted shop"}
                  </Link>
                  <p className="text-sm font-medium text-berry">{r.reason}</p>
                  {r.details && <p className="text-sm mt-1">{r.details}</p>}
                  <p className="text-xs text-soft mt-1">
                    {new Date(r.created_at).toLocaleString("en-GB")}
                    {r.contact ? ` · contact: ${r.contact}` : ""}
                  </p>
                </div>
                {!r.resolved && <ResolveReportButton id={r.id} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
