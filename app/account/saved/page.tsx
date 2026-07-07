// app/account/saved/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Product } from "@/lib/types";
import { ProductCard } from "@/components/cards";
import SignOutButton from "@/components/SignOutButton";

export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/account/login?next=/account/saved");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  // Shop owners shouldn't be here
  if (profile?.role === "shop_owner" || profile?.role === "admin") {
    redirect("/dashboard");
  }

  const { data: saved } = await supabase
    .from("saved_products")
    .select("product_id, products(*, shops(name, slug, city))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const products = (saved ?? [])
    .map((s) => s.products)
    .filter(Boolean) as unknown as Product[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="display text-3xl font-bold">Saved products</h1>
          <p className="text-soft text-sm">
            Hi {profile?.full_name || "there"} — here&apos;s what you saved.
          </p>
        </div>
        <div className="w-32">
          <SignOutButton />
        </div>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl bg-white border border-line p-10 text-center">
          <div className="text-4xl mb-3">🤍</div>
          <p className="display text-lg font-semibold">Nothing saved yet</p>
          <p className="text-soft text-sm mt-1 mb-4">
            Tap the heart on any product to save it here.
          </p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-berry text-white font-semibold px-5 py-2.5"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
