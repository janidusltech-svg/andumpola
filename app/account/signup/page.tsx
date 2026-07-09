"use client";
// app/account/signup/page.tsx
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import GoogleButton from "@/components/GoogleButton";
import { createClient } from "@/lib/supabase/client";

function SignupInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account/saved";
  const supabase = createClient();
  const [f, setF] = useState({ full_name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError("");
    if (f.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: f.email.trim(),
      password: f.password,
      options: {
        data: { full_name: f.full_name.trim(), account_type: "customer" },
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="display text-3xl font-bold">Create your account</h1>
      <p className="text-soft mt-1 mb-6">
        Save your favourite products and find them anytime.
      </p>

      <div className="space-y-3 bg-white border border-line rounded-xl p-6">
        <label className="block">
          <span className="text-sm font-medium">Your name</span>
          <input
            value={f.full_name}
            onChange={(e) => setF({ ...f, full_name: e.target.value })}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:ring-2 focus:ring-berry/40"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            value={f.email}
            onChange={(e) => setF({ ...f, email: e.target.value })}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:ring-2 focus:ring-berry/40"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Password</span>
          <input
            type="password"
            value={f.password}
            onChange={(e) => setF({ ...f, password: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="At least 6 characters"
            className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:ring-2 focus:ring-berry/40"
          />
        </label>

        {error && <p className="text-sm text-berry">{error}</p>}

        <button
          onClick={submit}
          disabled={loading}
          className="w-full rounded-lg bg-berry text-white font-semibold py-3 hover:bg-berry-dark disabled:opacity-60"
        >
          {loading ? "Creating…" : "Create account"}
        </button>

        <div className="flex items-center gap-3 py-1">
          <span className="h-px bg-line flex-1" />
          <span className="text-xs text-soft">or</span>
          <span className="h-px bg-line flex-1" />
        </div>
        <GoogleButton
          next={next || "/"}
          label="Sign up with Google"
        />

        <p className="text-sm text-soft text-center">
          Already have an account?{" "}
          <Link
            href={`/account/login${next ? `?next=${next}` : ""}`}
            className="text-berry font-medium"
          >
            Log in
          </Link>
        </p>
        <p className="text-xs text-soft text-center border-t border-line pt-3">
          Are you a shop owner?{" "}
          <Link href="/signup" className="text-berry font-medium">
            Open a shop instead
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function CustomerSignupPage() {
  return (
    <Suspense>
      <SignupInner />
    </Suspense>
  );
}
