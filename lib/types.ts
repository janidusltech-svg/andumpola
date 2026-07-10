// lib/types.ts
export type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  audience: "men" | "women" | "kids" | "unisex";
};

export type Audience = "men" | "women" | "kids" | "unisex";

export const AUDIENCES: { value: Audience; label: string; emoji: string }[] = [
  { value: "women", label: "Women", emoji: "👗" },
  { value: "men", label: "Men", emoji: "👔" },
  { value: "kids", label: "Kids", emoji: "🧒" },
  { value: "unisex", label: "Unisex", emoji: "👕" },
];

export function audienceLabel(a?: string | null) {
  return AUDIENCES.find((x) => x.value === a)?.label ?? "Unisex";
}

export const SHOP_TYPES: { value: string; label: string; hint: string }[] = [
  { value: "retail", label: "Retail", hint: "Sell single pieces to customers" },
  { value: "wholesale", label: "Wholesale", hint: "Sell in bulk (6+ pieces)" },
  { value: "both", label: "Both", hint: "Retail and wholesale" },
];

export const SHOP_MODES: { value: string; label: string; hint: string }[] = [
  { value: "online", label: "Online only", hint: "Ships / delivers, no walk-in store" },
  { value: "physical", label: "Physical store", hint: "Visit in person only" },
  { value: "both", label: "Online & Physical", hint: "Both a store and online" },
];

export function shopModeLabel(m?: string | null) {
  return SHOP_MODES.find((x) => x.value === m)?.label ?? "Online & Physical";
}

// Common clothing colours with a swatch hex for the dot
export const COLORS: { name: string; hex: string }[] = [
  { name: "Black", hex: "#1b1720" },
  { name: "White", hex: "#ffffff" },
  { name: "Grey", hex: "#9ca3af" },
  { name: "Red", hex: "#dc2626" },
  { name: "Maroon", hex: "#7f1d1d" },
  { name: "Pink", hex: "#ec4899" },
  { name: "Orange", hex: "#f97316" },
  { name: "Yellow", hex: "#eab308" },
  { name: "Green", hex: "#16a34a" },
  { name: "Blue", hex: "#2563eb" },
  { name: "Navy Blue", hex: "#1e3a8a" },
  { name: "Purple", hex: "#7c3aed" },
  { name: "Brown", hex: "#92400e" },
  { name: "Beige", hex: "#e7d3b3" },
  { name: "Gold", hex: "#d4af37" },
  { name: "Silver", hex: "#c0c0c0" },
];

export function colorHex(name: string): string {
  return (
    COLORS.find((c) => c.name.toLowerCase() === name.toLowerCase())?.hex ||
    "#c4265e"
  );
}

export type Shop = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  whatsapp: string;
  phone: string;
  address: string | null;
  city: string | null;
  province: string | null;
  district: string | null;
  shop_type?: "retail" | "wholesale" | "both";
  shop_mode?: "online" | "physical" | "both";
  latitude?: number | null;
  longitude?: number | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  tiktok_url?: string | null;
  business_hours?: string | null;
  announcement?: string | null;
  vertical?: "clothing" | "furniture" | "electronics";
  status?: string;
  enable_online_orders: boolean;
  created_at: string;
};

export type Product = {
  id: string;
  shop_id: string;
  category_id: string;
  title: string;
  description: string | null;
  price: number;
  audience: "men" | "women" | "kids" | "unisex";
  vertical?: "clothing" | "furniture" | "electronics";
  colors?: string[];
  wholesale_only?: boolean;
  is_featured?: boolean;
  sizes: Record<string, number>;
  images: string[];
  is_available: boolean;
  created_at: string;
  shops?: Pick<Shop, "name" | "slug" | "whatsapp" | "phone" | "city" | "enable_online_orders">;
  categories?: Pick<Category, "name" | "slug">;
};

export function formatLKR(n: number) {
  return "Rs " + Number(n).toLocaleString("en-LK");
}
