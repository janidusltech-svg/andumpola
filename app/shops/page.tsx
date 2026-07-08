// app/shops/page.tsx
import { supabasePublic } from "@/lib/supabase/public";
import { Shop } from "@/lib/types";
import { ShopCard } from "@/components/cards";

export const revalidate = 60;
export const metadata = { title: "All Shops — AndumPola" };

export default async function ShopsPage() {
  const supabase = supabasePublic();
  const { data: shops } = await supabase
    .from("shops")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="display text-2xl sm:text-3xl font-bold mb-6">All shops</h1>
      {shops && shops.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(shops as Shop[]).map((s) => (
            <ShopCard key={s.id} shop={s} />
          ))}
        </div>
      ) : (
        <p className="text-soft">No shops yet — be the first to open one!</p>
      )}
    </div>
  );
}
