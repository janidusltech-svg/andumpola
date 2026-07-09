"use client";
// app/signup/page.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GoogleButton from "@/components/GoogleButton";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: { full_name: form.full_name.trim(), phone: form.phone.trim() },
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="display text-3xl font-bold">Open your shop</h1>
      <p className="text-soft mt-1 mb-6">
        Free for 3 months. Sell to customers across Sri Lanka.
      </p>

      <div className="space-y-3 bg-white border border-line rounded-xl p-6">
        <Field
          label="Your name"
          value={form.full_name}
          onChange={(v) => setForm({ ...form, full_name: v })}
          placeholder="Kamal Perera"
        />
        <Field
          label="Phone"
          value={form.phone}
          onChange={(v) => setForm({ ...form, phone: v })}
          placeholder="0771234567"
        />
        <Field
          label="Email"
          type="email"
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
          placeholder="you@email.com"
        />
        <Field
          label="Password"
          type="password"
          value={form.password}
          onChange={(v) => setForm({ ...form, password: v })}
          placeholder="At least 6 characters"
        />

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
        <GoogleButton label="Sign up with Google" />

        <p className="text-sm text-soft text-center">
          Already have a shop?{" "}
          <Link href="/login" className="text-berry font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:ring-2 focus:ring-berry/40"
      />
    </label>
  );
}
