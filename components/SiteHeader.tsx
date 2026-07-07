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
    <header className="sticky top-0 z-40 bg-sand/95 backdrop-blur border-b border-line">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="leading-none">
          <span className="block text-[11px] tracking-wide text-berry">
            ඇඳුම්පොළ
          </span>
          <span className="display text-2xl font-bold text-ink">
            Andum<span className="text-berry">Pola</span>
          </span>
        </Link>

        <nav className="flex items-center gap-3 sm:gap-4 text-sm font-medium">
          <Link href="/shops" className="hover:text-berry">
            Shops
          </Link>
          <Link href="/search" className="hover:text-berry">
            Search
          </Link>

          {!user && (
            <>
              <Link href="/account/login" className="hover:text-berry">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-berry px-3 py-2 text-white hover:bg-berry-dark"
              >
                <span className="sm:hidden">Sell</span>
                <span className="hidden sm:inline">Sell on AndumPola</span>
              </Link>
            </>
          )}

          {isCustomer && (
            <Link
              href="/account/saved"
              className="rounded-md bg-berry px-3 py-2 text-white hover:bg-berry-dark"
            >
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
              <Link
                href="/dashboard"
                className="rounded-md bg-berry px-3 py-2 text-white hover:bg-berry-dark"
              >
                My shop
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
