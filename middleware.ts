// middleware.ts (project root)
// 1) Finishes Google sign-in even if Supabase sends the user back to a page
//    other than /auth/callback (e.g. the homepage with ?code=...).
// 2) Keeps logged-in users logged in on EVERY page by refreshing their
//    session cookie (Supabase tokens expire after ~1 hour).
// 3) Protects /dashboard and /admin.
// Guests (no Supabase cookie) skip the network call, so it stays fast.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // (1) OAuth code landed on the wrong page → send it to the callback
  const code = searchParams.get("code");
  // (/reset-password handles its own code from the password-reset email)
  if (code && pathname !== "/auth/callback" && pathname !== "/reset-password") {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    url.search = "";
    url.searchParams.set("code", code);
    url.searchParams.set("next", pathname === "/" ? "/" : pathname);
    return NextResponse.redirect(url);
  }

  const isProtected =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
  const hasSession = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.includes("auth-token"));

  // Guest on a public page: nothing to refresh
  if (!hasSession && !isProtected) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // (2) refreshes the session cookie if needed
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // (3) protected areas
  if (pathname.startsWith("/dashboard") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (pathname.startsWith("/admin") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // every page except static files, images and API routes
  matcher: [
    "/((?!_next/static|_next/image|api/|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|webmanifest|txt|xml)$).*)",
  ],
};
