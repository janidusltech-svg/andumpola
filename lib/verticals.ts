// lib/verticals.ts
// The three marketplaces AndumPola runs. Add more here later.

export type VerticalKey = "clothing" | "furniture" | "electronics";

export type Vertical = {
  key: VerticalKey;
  label: string; // e.g. "Clothing"
  emoji: string;
  slug: string; // landing page path, e.g. "clothing" -> /clothing
  tagline: string;
  // If true, shops in this vertical need admin approval before going live.
  needsApproval: boolean;
  // Suggested categories for this vertical (used in product forms / filters).
  categories: string[];
  // Whether the Men/Women/Kids audience filter applies (clothing only).
  hasAudience: boolean;
};

export const VERTICALS: Record<VerticalKey, Vertical> = {
  clothing: {
    key: "clothing",
    label: "Clothing",
    emoji: "👗",
    slug: "clothing",
    tagline: "Frocks, sarees, shirts and more from shops island-wide.",
    needsApproval: false, // open — as today
    hasAudience: true,
    categories: [
      "Frocks",
      "Sarees",
      "Blouses",
      "Skirts",
      "Tops & T-Shirts",
      "Shirts",
      "Trousers & Denim",
      "Kids Wear",
      "Sportswear",
      "Accessories",
      "Other",
    ],
  },
  furniture: {
    key: "furniture",
    label: "Furniture",
    emoji: "🛋️",
    slug: "furniture",
    tagline: "Furnish your home from local shops.",
    needsApproval: true, // must be approved by admin
    hasAudience: false,
    categories: [
      "Sofas & Couches",
      "Beds & Mattresses",
      "Tables",
      "Chairs",
      "Cupboards & Wardrobes",
      "Office Furniture",
      "Kitchen & Dining",
      "Outdoor",
      "Decor",
      "Other",
    ],
  },
  electronics: {
    key: "electronics",
    label: "Electronics",
    emoji: "📱",
    slug: "electronics",
    tagline: "Phones, gadgets & appliances near you.",
    needsApproval: true, // must be approved by admin
    hasAudience: false,
    categories: [
      "Phones & Tablets",
      "Laptops & Computers",
      "TVs",
      "Audio & Headphones",
      "Cameras",
      "Home Appliances",
      "Kitchen Appliances",
      "Accessories",
      "Gaming",
      "Other",
    ],
  },
};

export const VERTICAL_LIST = Object.values(VERTICALS);

export function getVertical(key?: string | null): Vertical {
  if (key && key in VERTICALS) return VERTICALS[key as VerticalKey];
  return VERTICALS.clothing;
}

export function verticalNeedsApproval(key?: string | null): boolean {
  return getVertical(key).needsApproval;
}
