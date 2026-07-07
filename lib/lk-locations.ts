// lib/lk-locations.ts
// Sri Lanka: 9 provinces, 25 districts

export const PROVINCES: { name: string; slug: string; districts: string[] }[] = [
  {
    name: "Western",
    slug: "western",
    districts: ["Colombo", "Gampaha", "Kalutara"],
  },
  {
    name: "Central",
    slug: "central",
    districts: ["Kandy", "Matale", "Nuwara Eliya"],
  },
  {
    name: "Southern",
    slug: "southern",
    districts: ["Galle", "Matara", "Hambantota"],
  },
  {
    name: "Northern",
    slug: "northern",
    districts: ["Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu"],
  },
  {
    name: "Eastern",
    slug: "eastern",
    districts: ["Trincomalee", "Batticaloa", "Ampara"],
  },
  {
    name: "North Western",
    slug: "north-western",
    districts: ["Kurunegala", "Puttalam"],
  },
  {
    name: "North Central",
    slug: "north-central",
    districts: ["Anuradhapura", "Polonnaruwa"],
  },
  {
    name: "Uva",
    slug: "uva",
    districts: ["Badulla", "Monaragala"],
  },
  {
    name: "Sabaragamuwa",
    slug: "sabaragamuwa",
    districts: ["Ratnapura", "Kegalle"],
  },
];

export const PROVINCE_NAMES = PROVINCES.map((p) => p.name);

export function districtsForProvince(province: string): string[] {
  return PROVINCES.find((p) => p.name === province)?.districts ?? [];
}

export function provinceSlug(name: string): string {
  return PROVINCES.find((p) => p.name === name)?.slug ?? "";
}

export function provinceFromSlug(slug: string): string | null {
  return PROVINCES.find((p) => p.slug === slug)?.name ?? null;
}

// The few "main" categories shown by default; rest are behind "Show all"
export const MAIN_CATEGORY_SLUGS = [
  "frocks-dresses",
  "sarees",
  "mens-shirts",
  "mens-tshirts",
  "jeans",
  "kids-wear",
  "girls-wear",
  "boys-wear",
  "ladies-footwear",
  "handbags",
];
