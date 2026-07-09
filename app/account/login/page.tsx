"use client";
// app/account/login/page.tsx
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import GoogleButton from "@/components/GoogleButton";
import { createClient } from "@/lib/supabase/client";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account/saved";
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError("");
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }
    // Make sure this is a customer account, not a shop owner
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user!.id)
      .single();

    if (profile?.role === "shop_owner" || profile?.role === "admin") {
      // Shop owner used the wrong login — send them to their dashboard
      router.push("/dashboard");
      router.refresh();
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="display text-3xl font-bold">Log in</h1>
      <p className="text-soft mt-1 mb-6">Welcome back to AndumPola.</p>

      <div className="space-y-3 bg-white border border-line rounded-xl p-6">
        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:ring-2 focus:ring-berry/40"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {loading ? "Logging in…" : "Log in"}
        </button>

        <div className="flex items-center gap-3 py-1">
          <span className="h-px bg-line flex-1" />
          <span className="text-xs text-soft">or</span>
          <span className="h-px bg-line flex-1" />
        </div>
        <GoogleButton next={next} />

        <p className="text-sm text-center">
          <Link href="/forgot-password" className="text-soft hover:text-berry">
            Forgot password?
          </Link>
        </p>
        <p className="text-sm text-soft text-center">
          New here?{" "}
          <Link
            href={`/account/signup${next ? `?next=${next}` : ""}`}
            className="text-berry font-medium"
          >
            Create an account
          </Link>
        </p>
        <p className="text-xs text-soft text-center border-t border-line pt-3">
          Are you a shop owner?{" "}
          <Link href="/login" className="text-berry font-medium">
            Shop owner login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
