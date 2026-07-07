// app/dashboard/products/edit/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Category, Product } from "@/lib/types";
import ProductForm from "@/components/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user!.id)
    .maybeSingle();
  if (!shop) redirect("/dashboard");

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("shop_id", shop.id)
    .single();

  if (!product) notFound();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  return (
    <div>
      <h1 className="display text-2xl font-bold mb-6">Edit product</h1>
      <ProductForm
        categories={(categories ?? []) as Category[]}
        existing={product as Product}
      />
    </div>
  );
}
