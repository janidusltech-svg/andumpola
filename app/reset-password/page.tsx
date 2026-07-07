"use client";
// app/reset-password/page.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Supabase puts the recovery session in the URL; the client picks it up.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setReady(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN")
        setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  async function submit() {
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    // Find where to send them based on role
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role === "customer") {
        router.push("/account/saved");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } else {
      router.push("/account/login");
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="display text-3xl font-bold">Set a new password</h1>
      <p className="text-soft mt-1 mb-6">Choose a new password for your account.</p>

      <div className="space-y-3 bg-white border border-line rounded-xl p-6">
        {!ready ? (
          <p className="text-sm text-soft text-center py-4">
            Checking your reset link… If this doesn&apos;t change, the link may
            have expired — request a new one from the forgot-password page.
          </p>
        ) : (
          <>
            <label className="block">
              <span className="text-sm font-medium">New password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:ring-2 focus:ring-berry/40"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Confirm password</span>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:ring-2 focus:ring-berry/40"
              />
            </label>
            {error && <p className="text-sm text-berry">{error}</p>}
            <button
              onClick={submit}
              disabled={loading}
              className="w-full rounded-lg bg-berry text-white font-semibold py-3 hover:bg-berry-dark disabled:opacity-60"
            >
              {loading ? "Saving…" : "Set new password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
