// app/api/orders/status/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { order_ref, phone } = await req.json();
    if (!order_ref?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { error: "Enter your order reference and phone number." },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin();
    const { data: order } = await supabase
      .from("orders")
      .select(
        "order_ref, status, size, quantity, total, shop_note, created_at, products(title), shops(name, whatsapp)"
      )
      .eq("order_ref", order_ref.trim().toUpperCase())
      .single();

    // Verify phone matches (privacy: don't reveal order without matching phone)
    if (!order) {
      return NextResponse.json(
        { error: "No order found with that reference." },
        { status: 404 }
      );
    }

    // fetch phone separately to compare (not returned to client)
    const { data: check } = await supabase
      .from("orders")
      .select("customer_phone")
      .eq("order_ref", order_ref.trim().toUpperCase())
      .single();

    const normalize = (s: string) => s.replace(/[^0-9]/g, "").slice(-9);
    if (
      !check ||
      normalize(check.customer_phone) !== normalize(String(phone))
    ) {
      return NextResponse.json(
        { error: "Phone number does not match this order." },
        { status: 403 }
      );
    }

    const product = Array.isArray(order.products)
      ? order.products[0]
      : order.products;
    const shop = Array.isArray(order.shops) ? order.shops[0] : order.shops;

    return NextResponse.json({
      order: {
        order_ref: order.order_ref,
        status: order.status,
        size: order.size,
        quantity: order.quantity,
        total: order.total,
        shop_note: order.shop_note,
        created_at: order.created_at,
        product_title: product?.title ?? "",
        shop_name: shop?.name ?? "",
        shop_whatsapp: shop?.whatsapp ?? "",
      },
    });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
