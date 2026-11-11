// app/api/views/route.ts
// Logs an anonymous page view (shop page or product page) for analytics.
// No cookies, no personal data — just "this shop/product was viewed".
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    const rl = await rateLimit(`views:${ip}`, 60, 60);
    if (!rl.success) {
      return NextResponse.json({ ok: false }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const { shop_id, product_id } = body ?? {};
    if (!shop_id && !product_id) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const supabase = supabaseAdmin();

    if (product_id) {
      // Resolve the shop server-side from the product (don't trust client)
      const { data: product } = await supabase
        .from("products")
        .select("id, shop_id")
        .eq("id", product_id)
        .single();
      if (!product) {
        return NextResponse.json({ ok: false }, { status: 404 });
      }
      await supabase.from("shop_views").insert({
        shop_id: product.shop_id,
        product_id: product.id,
      });
    } else {
      const { data: shop } = await supabase
        .from("shops")
        .select("id")
        .eq("id", shop_id)
        .single();
      if (!shop) {
        return NextResponse.json({ ok: false }, { status: 404 });
      }
      await supabase.from("shop_views").insert({
        shop_id: shop.id,
        product_id: null,
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    // Analytics must never break the page
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
