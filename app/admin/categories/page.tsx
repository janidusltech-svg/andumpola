// app/admin/categories/page.tsx
import { createClient } from "@/lib/supabase/server";
import CategoryManager from "@/components/admin/CategoryManager";
import { Category } from "@/lib/types";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  return (
    <div>
      <h1 className="display text-2xl font-bold mb-2">Categories</h1>
      <p className="text-soft text-sm mb-6">
        These appear in the product dropdown for shops and as filters on the
        site.
      </p>
      <CategoryManager categories={(categories ?? []) as Category[]} />
    </div>
  );
}
