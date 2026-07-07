// app/api/search/route.ts
import { NextResponse } from "next/server";
import { supabasePublic } from "@/lib/supabase/public";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  if (q.length < 2) {
    return NextResponse.json({ products: [], shops: [] });
  }

  const supabase = supabasePublic();

  const [{ data: products }, { data: shops }] = await Promise.all([
    supabase
      .from("products")
      .select("id, title, price, images, shops(name, slug)")
      .ilike("title", `%${q}%`)
      .eq("is_available", true)
      .limit(6),
    supabase
      .from("shops")
      .select("name, slug, logo_url, city, district")
      .eq("status", "active")
      .ilike("name", `%${q}%`)
      .limit(4),
  ]);

  const productResults =
    products?.map((p) => {
      const shop = Array.isArray(p.shops) ? p.shops[0] : p.shops;
      return {
        id: p.id,
        title: p.title,
        price: p.price,
        image: p.images?.[0] ?? null,
        shopName: shop?.name ?? "",
        shopSlug: shop?.slug ?? "",
      };
    }) ?? [];

  return NextResponse.json({
    products: productResults,
    shops: shops ?? [],
  });
}
