// lib/new-orders.ts — counts orders that need the shop owner's attention
import type { SupabaseClient } from "@supabase/supabase-js";

export async function countNewOrders(supabase: SupabaseClient, shopId: string) {
  const [{ count: bank }, { count: wa }] = await Promise.all([
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("shop_id", shopId)
      .eq("status", "pending"),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("shop_id", shopId)
      .eq("status", "new"),
  ]);
  return { bank: bank ?? 0, whatsapp: wa ?? 0, total: (bank ?? 0) + (wa ?? 0) };
}
