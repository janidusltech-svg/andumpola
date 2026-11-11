// app/admin/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

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
  await assertAdmin();
  const db = supabaseAdmin();
  const { data: pay } = await db
    .from("subscription_payments")
    .select("id, shop_id, plan, months, status")
    .eq("id", paymentId)
    .single();
  if (!pay) throw new Error("Payment not found");
  if (pay.status !== "pending") throw new Error("Already reviewed");

  // snapshot BEFORE approving, so the new end date is exact
  const shop = decision === "approved" ? await loadShop(pay.shop_id) : null;

  const { error } = await db
    .from("subscription_payments")
    .update({ status: decision, admin_note: note || null })
    .eq("id", paymentId);
  if (error) throw new Error(error.message);

  if (shop) await applyPaidMonths(shop, pay.plan as PaidPlan, pay.months);
  revalidateShop(pay.shop_id);
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

// ============================================================
// Plan & trial management (admin only). Writes use the service
// role after assertAdmin(), so RLS can't block them.
// ============================================================
const DAY = 86400000;
type Plan = "trial" | "basic" | "pro" | "ultra";
type PaidPlan = "basic" | "pro" | "ultra";
const PLAN_KEYS: Plan[] = ["trial", "basic", "pro", "ultra"];

function revalidateShop(shopId: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/shops");
  revalidatePath(`/admin/shops/${shopId}`);
  revalidatePath("/admin/subscriptions");
}

async function loadShop(shopId: string) {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("shops")
    .select("id, plan, status, trial_ends_at, subscription_ends_at")
    .eq("id", shopId)
    .single();
  if (error || !data) throw new Error("Shop not found");
  return data as {
    id: string;
    plan: Plan;
    status: string;
    trial_ends_at: string | null;
    subscription_ends_at: string | null;
  };
}

/** Add free days to whatever the shop is on now (trial or paid plan). */
export async function addFreeDays(shopId: string, days: number) {
  await assertAdmin();
  const n = Math.round(Number(days));
  if (!Number.isFinite(n) || n < 1 || n > 365)
    throw new Error("Days must be between 1 and 365");
  const shop = await loadShop(shopId);
  const field = shop.plan === "trial" ? "trial_ends_at" : "subscription_ends_at";
  const current = shop[field] ? new Date(shop[field]!).getTime() : 0;
  const base = Math.max(Date.now(), current); // expired -> count from today
  const { error } = await supabaseAdmin()
    .from("shops")
    .update({
      [field]: new Date(base + n * DAY).toISOString(),
      ...reopen(shop.status),
      updated_at: new Date().toISOString(),
    })
    .eq("id", shopId);
  if (error) throw new Error(error.message);
  revalidateShop(shopId);
}

/** Set the plan and its exact end date (yyyy-mm-dd). */
export async function setPlanAndEndDate(
  shopId: string,
  plan: Plan,
  endDate: string
) {
  await assertAdmin();
  if (!PLAN_KEYS.includes(plan)) throw new Error("Invalid plan");
  const d = new Date(`${endDate}T23:59:59+05:30`); // end of that day, Sri Lanka time
  if (isNaN(d.getTime())) throw new Error("Pick a valid date");
  const shop = await loadShop(shopId);
  const update: Record<string, string> = {
    plan,
    ...(d.getTime() > Date.now() ? reopen(shop.status) : {}),
    updated_at: new Date().toISOString(),
  };
  if (plan === "trial") update.trial_ends_at = d.toISOString();
  else update.subscription_ends_at = d.toISOString();
  const { error } = await supabaseAdmin()
    .from("shops")
    .update(update)
    .eq("id", shopId);
  if (error) throw new Error(error.message);
  revalidateShop(shopId);
}

/** Record a cash / in-person payment and extend the plan. */
export async function recordManualPayment(
  shopId: string,
  plan: PaidPlan,
  months: number,
  amount: number,
  note?: string
) {
  await assertAdmin();
  if (!["basic", "pro", "ultra"].includes(plan)) throw new Error("Invalid plan");
  const m = Math.round(Number(months));
  const amt = Number(amount);
  if (!Number.isFinite(m) || m < 1 || m > 24)
    throw new Error("Months must be 1–24");
  if (!Number.isFinite(amt) || amt < 0) throw new Error("Invalid amount");

  const shop = await loadShop(shopId);
  const db = supabaseAdmin();

  const { data: pay, error: insErr } = await db
    .from("subscription_payments")
    .insert({
      shop_id: shopId,
      plan,
      months: m,
      amount: amt,
      receipt_url: null,
      method: "manual",
      status: "pending",
    })
    .select("id")
    .single();
  if (insErr) throw new Error(insErr.message);

  const { error: upErr } = await db
    .from("subscription_payments")
    .update({ status: "approved", admin_note: note?.trim() || "Recorded by admin" })
    .eq("id", pay.id);
  if (upErr) throw new Error(upErr.message);

  await applyPaidMonths(shop, plan, m);
  revalidateShop(shopId);
}

/** status change that re-opens a shop closed for non-payment */
function reopen(status: string) {
  return status === "expired" ? { status: "active" } : {};
}

/**
 * Set plan + exact new end date after a payment. Runs after the DB's own
 * approval trigger, so the final value is always correct.
 * Same plan (or upgrade) → adds on top of remaining paid time.
 */
async function applyPaidMonths(
  shop: Awaited<ReturnType<typeof loadShop>>,
  plan: PaidPlan,
  months: number
) {
  const paidEnd =
    shop.plan !== "trial" && shop.subscription_ends_at
      ? new Date(shop.subscription_ends_at).getTime()
      : 0;
  const base = Math.max(Date.now(), paidEnd);
  const newEnd = new Date(base + months * 30 * DAY).toISOString();
  const { error } = await supabaseAdmin()
    .from("shops")
    .update({
      plan,
      subscription_ends_at: newEnd,
      ...reopen(shop.status),
      updated_at: new Date().toISOString(),
    })
    .eq("id", shop.id);
  if (error) throw new Error(error.message);
}
