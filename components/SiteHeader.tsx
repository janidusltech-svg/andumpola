// components/SiteHeader.tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role ?? null;
  }
  const isAdmin = role === "admin";
  const isCustomer = role === "customer";

  return (
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur border-b border-line">
      <div className="mx-auto max-w-6xl px-6 h-[68px] flex items-center justify-between gap-5">
        <Link href="/" className="leading-none">
          <span className="block text-[10px] tracking-wide text-berry font-semibold">
            ඇඳුම්පොළ
          </span>
          <span className="display text-2xl font-extrabold text-ink">
            Andum<span className="text-berry">Pola</span>
          </span>
        </Link>

        <nav className="flex items-center gap-3 sm:gap-5 text-sm font-medium">
          <Link href="/shops" className="hover:text-berry">
            Shops
          </Link>
          <Link href="/search" className="hover:text-berry">
            Search
          </Link>

          {!user && (
            <>
              <Link href="/account/login" className="btn btn-ghost !py-2 !px-4 hidden sm:inline-flex">
                Log in
              </Link>
              <Link href="/signup" className="btn btn-primary !py-2 !px-4">
                <span className="sm:hidden">Sell</span>
                <span className="hidden sm:inline">Sell on AndumPola</span>
              </Link>
            </>
          )}

          {isCustomer && (
            <Link href="/account/saved" className="btn btn-primary !py-2 !px-4">
              ♥ Saved
            </Link>
          )}

          {(role === "shop_owner" || isAdmin) && (
            <>
              {isAdmin && (
                <Link href="/admin" className="hover:text-berry">
                  Admin
                </Link>
              )}
              <Link href="/dashboard" className="btn btn-primary !py-2 !px-4">
                My shop
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
