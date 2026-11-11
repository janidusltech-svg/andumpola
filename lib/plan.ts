// lib/plan.ts — ONE place for plan prices, limits and expiry maths.
// Change prices/limits here and the whole site follows.
// (If you change maxProducts, also update shop_product_limit() in SQL.)

export type PlanKey = "trial" | "basic" | "pro" | "ultra";
export type PaidPlan = "basic" | "pro" | "ultra";

export type PlanInfo = {
  key: PlanKey;
  name: string;
  price: number; // LKR per month (0 for trial)
  maxProducts: number; // Infinity = unlimited
  photosPerProduct: number; // images per product listing
  aiPhotos: number; // free AI product photos
  aiPhotosMonthly: boolean; // false = one-time allowance
  onlineOrders: boolean; // bank-transfer orders on the site
  searchRank: number; // higher shows first in search & lists
  featured: boolean; // homepage + Verified badge
  features: string[];
};

export const PLANS: Record<PlanKey, PlanInfo> = {
  trial: {
    key: "trial",
    name: "Free trial",
    price: 0,
    maxProducts: 150,
    photosPerProduct: 10,
    aiPhotos: 5,
    aiPhotosMonthly: false,
    onlineOrders: true,
    searchRank: 1,
    featured: false,
    features: ["60 days free", "Full Pro access", "5 free AI product photos (coming soon)"],
  },
  basic: {
    key: "basic",
    name: "Basic",
    price: 500,
    maxProducts: 30,
    photosPerProduct: 3,
    aiPhotos: 5,
    aiPhotosMonthly: true,
    onlineOrders: false,
    searchRank: 0,
    featured: false,
    features: [
      "Up to 30 products",
      "Your own shop page & link",
      "WhatsApp & call orders",
      "Listed in AndumPola search",
      "5 AI product photos / month (soon)",
    ],
  },
  pro: {
    key: "pro",
    name: "Pro",
    price: 1000,
    maxProducts: 150,
    photosPerProduct: 10,
    aiPhotos: 10,
    aiPhotosMonthly: true,
    onlineOrders: true,
    searchRank: 1,
    featured: false,
    features: [
      "Up to 150 products",
      "Everything in Basic",
      "Online bank-transfer orders",
      "Shown higher in search",
      "10 AI product photos / month (soon)",
    ],
  },
  ultra: {
    key: "ultra",
    name: "Ultra",
    price: 2000,
    maxProducts: Infinity,
    photosPerProduct: 10,
    aiPhotos: 20,
    aiPhotosMonthly: true,
    onlineOrders: true,
    searchRank: 2,
    featured: true,
    features: [
      "Unlimited products",
      "Everything in Pro",
      "Top of search results",
      "Featured on the homepage",
      "✔ Verified shop badge",
      "20 AI product photos / month (soon)",
    ],
  },
};

export const PAID_PLANS: PaidPlan[] = ["basic", "pro", "ultra"];
export const GRACE_DAYS = 7;

export function planInfo(plan: string | null | undefined): PlanInfo {
  return plan && plan in PLANS ? PLANS[plan as PlanKey] : PLANS.basic;
}

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
  const graceLeft = expired ? Math.max(0, GRACE_DAYS + daysLeft) : GRACE_DAYS;
  return {
    isTrial,
    endIso,
    daysLeft,
    expired,
    graceLeft, // days until the shop closes after expiry
    closed: shop.status === "expired",
    expiringSoon: !expired && daysLeft <= 7,
    label: isTrial ? "Trial" : planInfo(shop.plan).name,
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

/** Stable sort: higher plans first, otherwise keep the original order. */
export function byPlanRank<T>(items: T[], planOf: (x: T) => string | null | undefined) {
  return items
    .map((x, i) => ({ x, i, r: planInfo(planOf(x)).searchRank }))
    .sort((a, b) => b.r - a.r || a.i - b.i)
    .map((o) => o.x);
}
