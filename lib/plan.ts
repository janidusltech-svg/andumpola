// lib/plan.ts — works out a shop's plan end date and days left
type ShopPlanFields = {
  plan: string;
  status?: string;
  trial_ends_at: string | null;
  subscription_ends_at: string | null;
};

export function shopExpiry(shop: ShopPlanFields) {
  const isTrial = shop.plan === "trial";
  const endIso = isTrial ? shop.trial_ends_at : shop.subscription_ends_at;
  const end = endIso ? new Date(endIso).getTime() : 0;
  const daysLeft = end ? Math.ceil((end - Date.now()) / 86400000) : 0;
  const expired = daysLeft <= 0;
  return {
    isTrial,
    endIso,
    daysLeft,
    expired,
    expiringSoon: !expired && daysLeft <= 7,
    label: isTrial ? "Trial" : shop.plan.charAt(0).toUpperCase() + shop.plan.slice(1),
  };
}

export function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
