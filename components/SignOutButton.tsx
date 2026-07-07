"use client";
// components/SignOutButton.tsx
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton({ to = "/" }: { to?: string }) {
  const router = useRouter();
  const supabase = createClient();
  async function signOut() {
    await supabase.auth.signOut();
    router.push(to);
    router.refresh();
  }
  return (
    <button
      onClick={signOut}
      className="w-full rounded-lg border border-line px-3 py-2 text-sm font-medium text-soft hover:text-berry hover:border-berry"
    >
      Sign out
    </button>
  );
}
