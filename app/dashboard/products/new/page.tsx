// app/dashboard/products/new/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Category } from "@/lib/types";
import ProductForm from "@/components/ProductForm";
import { planInfo } from "@/lib/plan";

export default async function NewProductPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: shop } = await supabase
    .from("shops")
    .select("id, plan, status, vertical")
    .eq("owner_id", user!.id)
    .maybeSingle();

  if (!shop) redirect("/dashboard");

  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("shop_id", shop.id);

  const plan = planInfo(shop.plan);
  if (shop.status === "expired") {
    return (
      <LimitBox
        title="Your plan has ended"
        text="Your shop is closed. Renew your plan to open it again and add products."
      />
    );
  }
  const limit = plan.maxProducts;
  if ((count ?? 0) >= limit) {
    return (
      <LimitBox
        title="Product limit reached"
        text={`Your ${plan.name} plan allows ${limit} products. Upgrade for more — nothing you've added is removed.`}
      />
    );
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("vertical", (shop as { vertical?: string }).vertical ?? "clothing")
    .order("sort_order");

  return (
    <div>
      <h1 className="display text-2xl font-bold mb-6">Add product</h1>
      <ProductForm
        categories={(categories ?? []) as Category[]}
        photoLimit={plan.photosPerProduct}
        vertical={(shop as { vertical?: string }).vertical ?? "clothing"}
      />
    </div>
  );
}

function LimitBox({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h1 className="display text-2xl font-bold mb-2">{title}</h1>
      <p className="text-soft mb-4">{text}</p>
      <Link
        href="/dashboard/subscription"
        className="rounded-lg bg-berry text-white font-semibold px-5 py-2.5"
      >
        View plans
      </Link>
    </div>
  );
}
