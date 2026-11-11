// app/api/leads/route.ts
// Logs a "WhatsApp order" click so shop owners can see demand/leads.
// No payment, no personal data — just product + size + qty + shop.
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    const rl = await rateLimit(`leads:${ip}`, 30, 60);
    if (!rl.success) {
      return NextResponse.json({ ok: false }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const { product_id, size, quantity } = body ?? {};
    if (!product_id) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const qty = Math.max(1, Math.min(999, parseInt(String(quantity)) || 1));
    const supabase = supabaseAdmin();

    // Resolve shop + title server-side (don't trust the client)
    const { data: product } = await supabase
      .from("products")
      .select("id, title, shop_id")
      .eq("id", product_id)
      .single();

    if (!product) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    // link to the customer's account if they're logged in ("My orders")
    let customerId: string | null = null;
    try {
      const {
        data: { user },
      } = await (await createClient()).auth.getUser();
      customerId = user?.id ?? null;
    } catch {}

    const leadRow = {
      shop_id: product.shop_id,
      product_id: product.id,
      product_title: product.title,
      size: size ? String(size).slice(0, 50) : null,
      quantity: qty,
      channel: "whatsapp",
    };
    const { error: lErr } = await supabase
      .from("leads")
      .insert({ ...leadRow, customer_id: customerId });
    if (lErr && lErr.message.includes("customer_id")) {
      await supabase.from("leads").insert(leadRow); // DB not migrated yet
    }

    return NextResponse.json({ ok: true });
  } catch {
    // Never block the customer's WhatsApp open on a logging failure
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
