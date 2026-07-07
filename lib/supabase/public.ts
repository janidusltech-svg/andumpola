// lib/supabase/public.ts
// Read-only client for public pages (server components).
// Auth-aware client comes later with the dashboard build.
import { createClient } from "@supabase/supabase-js";

export function supabasePublic() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}
