// app/admin/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") throw new Error("Not authorized");
  return supabase;
}

export async function setShopStatus(
  shopId: string,
  status: "active" | "suspended" | "pending"
) {
  const supabase = await assertAdmin();
  const { error } = await supabase
    .from("shops")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", shopId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/shops");
  revalidatePath("/admin");
}

export async function reviewSubscription(
  paymentId: string,
  decision: "approved" | "rejected",
  note?: string
) {
  const supabase = await assertAdmin();
  // The DB trigger extends the shop subscription automatically on approve.
  const { error } = await supabase
    .from("subscription_payments")
    .update({
      status: decision,
      admin_note: note || null,
    })
    .eq("id", paymentId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin");
}

export async function addCategory(name: string) {
  const supabase = await assertAdmin();
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  const { error } = await supabase
    .from("categories")
    .insert({ name: name.trim(), slug, sort_order: 500 });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
}

export async function deleteCategory(id: string) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
}
