// app/api/orders/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      product_id,
      customer_name,
      customer_phone,
      customer_address,
      size,
      quantity,
      receipt_path,
    } = body ?? {};

    // Basic validation
    if (
      !product_id ||
      !customer_name?.trim() ||
      !customer_phone?.trim() ||
      !customer_address?.trim() ||
      !size?.trim()
    ) {
      return NextResponse.json(
        { error: "Please fill in all fields." },
        { status: 400 }
      );
    }
    const qty = Math.max(1, parseInt(String(quantity)) || 1);

    const supabase = supabaseAdmin();

    // Load product + shop, compute price SERVER-SIDE (never trust client)
    const { data: product, error: pErr } = await supabase
      .from("products")
      .select(
        "id, title, price, sizes, is_available, shop_id, shops(status, plan, trial_ends_at, subscription_ends_at, enable_online_orders)"
      )
      .eq("id", product_id)
      .single();

    if (pErr || !product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    // shops comes back as an object (single relation)
    const shop = Array.isArray(product.shops)
      ? product.shops[0]
      : product.shops;

    if (!product.is_available) {
      return NextResponse.json(
        { error: "This product is no longer available." },
        { status: 400 }
      );
    }
    if (!shop?.enable_online_orders) {
      return NextResponse.json(
        { error: "This shop does not accept online orders." },
        { status: 400 }
      );
    }

    // shop must be live
    const now = Date.now();
    const live =
      shop.status === "active" &&
      ((shop.plan === "trial" &&
        new Date(shop.trial_ends_at).getTime() > now) ||
        (["basic", "pro"].includes(shop.plan) &&
          shop.subscription_ends_at &&
          new Date(shop.subscription_ends_at).getTime() > now));
    if (!live) {
      return NextResponse.json(
        { error: "This shop is currently unavailable." },
        { status: 400 }
      );
    }

    // validate size exists
    const sizes = (product.sizes ?? {}) as Record<string, number>;
    if (!(size in sizes)) {
      return NextResponse.json(
        { error: "Selected size is not available." },
        { status: 400 }
      );
    }

    const total = Number(product.price) * qty;

    const { data: order, error: oErr } = await supabase
      .from("orders")
      .insert({
        shop_id: product.shop_id,
        product_id: product.id,
        customer_name: customer_name.trim(),
        customer_phone: customer_phone.trim(),
        customer_address: customer_address.trim(),
        size: size.trim(),
        quantity: qty,
        total,
        receipt_url: receipt_path || null,
        status: "pending",
      })
      .select("order_ref")
      .single();

    if (oErr) {
      return NextResponse.json({ error: oErr.message }, { status: 500 });
    }

    return NextResponse.json({ order_ref: order.order_ref });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
