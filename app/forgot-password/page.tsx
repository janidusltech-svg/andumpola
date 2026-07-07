"use client";
// app/forgot-password/page.tsx
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError("");
    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="display text-3xl font-bold">Reset your password</h1>
      <p className="text-soft mt-1 mb-6">
        We&apos;ll email you a link to set a new password.
      </p>

      <div className="space-y-3 bg-white border border-line rounded-xl p-6">
        {sent ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">📧</div>
            <p className="font-semibold">Check your email</p>
            <p className="text-sm text-soft mt-1">
              If an account exists for <strong>{email}</strong>, a reset link
              is on its way. Check spam too.
            </p>
          </div>
        ) : (
          <>
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
            {error && <p className="text-sm text-berry">{error}</p>}
            <button
              onClick={submit}
              disabled={loading}
              className="w-full rounded-lg bg-berry text-white font-semibold py-3 hover:bg-berry-dark disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </>
        )}
        <p className="text-sm text-soft text-center">
          <Link href="/account/login" className="text-berry font-medium">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
