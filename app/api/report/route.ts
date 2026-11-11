// app/api/report/route.ts — customer reports a shop
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = await rateLimit(`report:${ip}`, 5, 600);
  if (!rl.success) return NextResponse.json({ ok: false }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const shopId = String(body?.shop_id ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(shopId))
    return NextResponse.json({ ok: false }, { status: 400 });

  const { error } = await supabaseAdmin().from("shop_reports").insert({
    shop_id: shopId,
    reason: String(body?.reason ?? "Other").slice(0, 60),
    details: body?.details ? String(body.details).slice(0, 1000) : null,
    contact: body?.contact ? String(body.contact).slice(0, 100) : null,
  });
  if (error) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: true });
}
