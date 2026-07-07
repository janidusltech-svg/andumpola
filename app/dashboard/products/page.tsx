// app/dashboard/products/page.tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatLKR, Product } from "@/lib/types";
import DeleteProductButton from "@/components/DeleteProductButton";

export default async function ProductsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: shop } = await supabase
    .from("shops")
    .select("id, plan")
    .eq("owner_id", user!.id)
    .maybeSingle();

  if (!shop) {
    return (
      <p className="text-soft">
        Set up your shop first from the{" "}
        <Link href="/dashboard" className="text-berry">
          Overview
        </Link>{" "}
        page.
      </p>
    );
  }

  const { data: products } = await supabase
    .from("products")
    .select("*, categories(name)")
    .eq("shop_id", shop.id)
    .order("created_at", { ascending: false });

  const list = (products ?? []) as (Product & { categories?: { name: string } })[];
  const limit = shop.plan === "pro" ? Infinity : 150;
  const atLimit = list.length >= limit;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="display text-2xl font-bold">Products</h1>
          <p className="text-sm text-soft">
            {list.length}
            {limit !== Infinity ? ` / ${limit}` : ""} products
          </p>
        </div>
        <Link
          href="/dashboard/products/new"
          className={`rounded-lg font-semibold px-5 py-2.5 ${
            atLimit
              ? "bg-line text-soft pointer-events-none"
              : "bg-berry text-white hover:bg-berry-dark"
          }`}
        >
          + Add product
        </Link>
      </div>

      {atLimit && (
        <div className="mb-4 rounded-lg bg-turmeric/15 border border-turmeric/40 p-3 text-sm">
          You&apos;ve reached your {limit}-product limit. Upgrade to{" "}
          <strong>Pro</strong> for unlimited products in{" "}
          <Link href="/dashboard/subscription" className="text-berry underline">
            Subscription
          </Link>
          .
        </div>
      )}

      {list.length === 0 ? (
        <div className="rounded-xl bg-white border border-line p-10 text-center">
          <p className="display text-lg font-semibold">No products yet</p>
          <p className="text-soft text-sm mt-1 mb-4">
            Add your first product so customers can find it.
          </p>
          <Link
            href="/dashboard/products/new"
            className="inline-block rounded-lg bg-berry text-white font-semibold px-5 py-2.5"
          >
            + Add product
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((p) => {
            const stock = Object.values(p.sizes ?? {}).reduce(
              (a, b) => a + Number(b),
              0
            );
            return (
              <div
                key={p.id}
                className="flex items-center gap-4 bg-white border border-line rounded-xl p-3"
              >
                <div className="h-16 w-16 rounded-lg bg-line/40 overflow-hidden shrink-0">
                  {p.images?.[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.images[0]}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{p.title}</p>
                  <p className="text-sm text-soft">
                    {formatLKR(p.price)} · {p.categories?.name} · {stock} in
                    stock
                    {!p.is_available && " · hidden"}
                  </p>
                </div>
                <Link
                  href={`/dashboard/products/edit/${p.id}`}
                  className="text-sm font-medium text-berry hover:underline"
                >
                  Edit
                </Link>
                <DeleteProductButton id={p.id} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
