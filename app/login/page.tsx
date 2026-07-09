"use client";
// app/login/page.tsx
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import GoogleButton from "@/components/GoogleButton";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(params.get("next") || "/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="display text-3xl font-bold">Log in</h1>
      <p className="text-soft mt-1 mb-6">Welcome back to your shop.</p>

      <div className="space-y-3 bg-white border border-line rounded-xl p-6">
        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
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
        <GoogleButton
          accountType="shop_owner"
          next={params.get("next") || "/dashboard"}
        />

        <p className="text-sm text-center">
          <Link href="/forgot-password" className="text-soft hover:text-berry">
            Forgot password?
          </Link>
        </p>
        <p className="text-sm text-soft text-center">
          New here?{" "}
          <Link href="/signup" className="text-berry font-medium">
            Open your shop
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
