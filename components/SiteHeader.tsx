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
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 sm:h-[68px] flex items-center justify-between gap-2 sm:gap-5">
        {/* Logo */}
        <Link href="/" className="leading-none shrink-0">
          <span className="hidden sm:block text-[10px] tracking-wide text-berry font-semibold">
            ඇඳුම්පොළ
          </span>
          <span className="display text-xl sm:text-2xl font-extrabold text-ink">
            Andum<span className="text-berry">Pola</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1.5 sm:gap-4 text-sm font-medium min-w-0">
          <Link
            href="/shops"
            className="hidden sm:inline hover:text-berry px-1"
          >
            Shops
          </Link>
          <Link
            href="/search"
            className="hover:text-berry p-2 sm:p-0 sm:px-1"
            aria-label="Search"
          >
            {/* icon on mobile, text on desktop */}
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 sm:hidden fill-none stroke-current"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3-3" strokeLinecap="round" />
            </svg>
            <span className="hidden sm:inline">Search</span>
          </Link>

          {!user && (
            <>
              <Link
                href="/account/login"
                className="hover:text-berry px-1 whitespace-nowrap"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="btn btn-primary !py-2 !px-3 sm:!px-4 whitespace-nowrap text-sm"
              >
                <span className="sm:hidden">Sell</span>
                <span className="hidden sm:inline">Sell on AndumPola</span>
              </Link>
            </>
          )}

          {isCustomer && (
            <Link
              href="/account/saved"
              className="btn btn-primary !py-2 !px-3 sm:!px-4 whitespace-nowrap"
            >
              <span className="sm:hidden">♥</span>
              <span className="hidden sm:inline">♥ Saved</span>
            </Link>
          )}

          {(role === "shop_owner" || isAdmin) && (
            <>
              {isAdmin && (
                <Link href="/admin" className="hover:text-berry px-1 hidden sm:inline">
                  Admin
                </Link>
              )}
              <Link
                href="/dashboard"
                className="btn btn-primary !py-2 !px-3 sm:!px-4 whitespace-nowrap"
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
