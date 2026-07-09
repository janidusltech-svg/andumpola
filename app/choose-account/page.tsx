"use client";
// app/choose-account/page.tsx
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function ChooseInner() {
  const supabase = createClient();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const [loading, setLoading] = useState<"shop_owner" | "customer" | null>(null);
  const [error, setError] = useState("");

  async function choose(role: "shop_owner" | "customer") {
    setError("");
    setLoading(role);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/account/login");
      return;
    }
    const { error: e } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", user.id);
    if (e) {
      setError(e.message);
      setLoading(null);
      return;
    }
    // Go to the right place
    if (role === "shop_owner") {
      router.push("/dashboard");
    } else {
      router.push(next && next !== "/" ? next : "/");
    }
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="display text-3xl font-bold text-center">
        Welcome to AndumPola! 👋
      </h1>
      <p className="text-soft text-center mt-2 mb-8">
        How would you like to use AndumPola?
      </p>

      <div className="grid gap-4">
        {/* Shop owner */}
        <button
          onClick={() => choose("shop_owner")}
          disabled={loading !== null}
          className="text-left rounded-2xl border-2 border-line bg-white p-5 hover:border-berry transition-colors disabled:opacity-60"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏪</span>
            <div>
              <p className="font-bold text-lg">
                {loading === "shop_owner" ? "Setting up…" : "I'm a shop owner"}
              </p>
              <p className="text-sm text-soft">
                Sell my clothing products. Get my own shop page to share on
                Facebook &amp; WhatsApp. Free for 3 months.
              </p>
            </div>
          </div>
        </button>

        {/* Customer */}
        <button
          onClick={() => choose("customer")}
          disabled={loading !== null}
          className="text-left rounded-2xl border-2 border-line bg-white p-5 hover:border-berry transition-colors disabled:opacity-60"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">🛍️</span>
            <div>
              <p className="font-bold text-lg">
                {loading === "customer" ? "Setting up…" : "I'm a shopper"}
              </p>
              <p className="text-sm text-soft">
                Browse shops, save favourites, and order clothing from sellers
                across Sri Lanka.
              </p>
            </div>
          </div>
        </button>
      </div>

      {error && (
        <p className="text-sm text-berry text-center mt-4">{error}</p>
      )}
      <p className="text-xs text-soft text-center mt-6">
        You can&apos;t change this later, so pick the one that fits you. Most
        people are shoppers.
      </p>
    </div>
  );
}

export default function ChooseAccountPage() {
  return (
    <Suspense fallback={<div className="h-64" />}>
      <ChooseInner />
    </Suspense>
  );
}
