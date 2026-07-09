// app/auth/callback/route.ts
// Handles the OAuth redirect from Google (via Supabase).
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/account/login?error=oauth`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/account/login?error=oauth`);
  }

  // Check the user's role. Brand-new Google users are 'pending' and must
  // choose Shop owner vs Customer first.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role === "pending") {
      return NextResponse.redirect(
        `${origin}/choose-account?next=${encodeURIComponent(next)}`
      );
    }

    if (profile.role === "shop_owner") {
      return NextResponse.redirect(`${origin}/dashboard`);
    }
    if (profile.role === "admin") {
      return NextResponse.redirect(`${origin}/admin`);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
