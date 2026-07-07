// app/dashboard/products/new/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Category } from "@/lib/types";
import ProductForm from "@/components/ProductForm";

export default async function NewProductPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: shop } = await supabase
    .from("shops")
    .select("id, plan")
    .eq("owner_id", user!.id)
    .maybeSingle();

  if (!shop) redirect("/dashboard");

  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("shop_id", shop.id);

  const limit = shop.plan === "pro" ? Infinity : 150;
  if ((count ?? 0) >= limit) {
    return (
      <div>
        <h1 className="display text-2xl font-bold mb-2">Product limit reached</h1>
        <p className="text-soft mb-4">
          Your plan allows {limit} products. Upgrade to Pro for unlimited.
        </p>
        <Link
          href="/dashboard/subscription"
          className="rounded-lg bg-berry text-white font-semibold px-5 py-2.5"
        >
          View plans
        </Link>
      </div>
    );
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  return (
    <div>
      <h1 className="display text-2xl font-bold mb-6">Add product</h1>
      <ProductForm categories={(categories ?? []) as Category[]} />
    </div>
  );
}
