// components/SiteHeader.tsx
import Link from "next/link";
import { LanguageSwitcher, T } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";
import { countNewOrders } from "@/lib/new-orders";
import CartIcon from "@/components/CartIcon";

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

  // New-order badge for shop owners
  let newOrders = 0;
  if (user && role === "shop_owner") {
    const { data: shop } = await supabase
      .from("shops")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();
    if (shop) newOrders = (await countNewOrders(supabase, shop.id)).total;
  }
  const isCustomer = role === "customer";

  return (
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur border-b border-line">
      <div className="mx-auto max-w-6xl px-3 sm:px-6 h-16 sm:h-[68px] flex items-center justify-between gap-1.5 sm:gap-5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 leading-none shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-mark.png"
            alt=""
            className="h-7 w-7 min-[390px]:h-8 min-[390px]:w-8 sm:h-9 sm:w-9 rounded-lg shrink-0"
          />
          <span>
            <span className="hidden sm:block text-[10px] tracking-wide text-berry font-semibold">
              ඇඳුම්පොළ
            </span>
            <span className="display text-[17px] min-[390px]:text-xl sm:text-2xl font-extrabold text-ink">
              Andum<span className="text-berry">Pola</span>
            </span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-0.5 sm:gap-4 text-sm font-medium min-w-0">
          <Link
            href="/shops"
            className="hidden sm:inline hover:text-berry px-1"
          >
            Shops
          </Link>
          <Link
            href="/furniture"
            className="hidden md:inline hover:text-berry px-1"
          >
            Furniture
          </Link>
          <Link
            href="/electronics"
            className="hidden md:inline hover:text-berry px-1"
          >
            Electronics
          </Link>
          <LanguageSwitcher />
          <Link
            href="/search"
            className="hover:text-berry p-1.5 sm:p-0 sm:px-1"
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
            <span className="hidden sm:inline"><T k="search" /></span>
          </Link>

          <CartIcon />

          {user && (
            <Link
              href="/account"
              aria-label="My account"
              title="My account"
              className="h-8 w-8 rounded-full bg-berry/10 text-berry font-bold flex items-center justify-center hover:bg-berry hover:text-white shrink-0"
            >
              {(
                (user.user_metadata?.full_name as string | undefined) ||
                user.email ||
                "?"
              )
                .charAt(0)
                .toUpperCase()}
            </Link>
          )}

          {!user && (
            <>
              <Link
                href="/account/login"
                aria-label="Log in"
                className="hover:text-berry p-1.5 sm:px-1 whitespace-nowrap"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 sm:hidden fill-none stroke-current" strokeWidth="2">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21a8 8 0 0 1 16 0" strokeLinecap="round" />
                </svg>
                <span className="hidden sm:inline"><T k="login" /></span>
              </Link>
              <Link
                href="/signup"
                className="btn btn-primary !py-2 !px-2.5 sm:!px-4 whitespace-nowrap text-sm"
              >
                <span className="sm:hidden"><T k="sell" /></span>
                <span className="hidden sm:inline"><T k="sellOn" /></span>
              </Link>
            </>
          )}

          {isCustomer && (
            <Link
              href="/account/saved"
              aria-label="Saved"
              className="hidden sm:inline hover:text-berry px-1 whitespace-nowrap"
            >
              ♥ Saved
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
                className="btn btn-primary !py-2 !px-3 sm:!px-4 whitespace-nowrap relative"
              >
                My shop
                {newOrders > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 rounded-full bg-turmeric text-ink text-[11px] font-bold min-w-[1.25rem] h-5 px-1 flex items-center justify-center ring-2 ring-paper">
                    {newOrders}
                  </span>
                )}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
