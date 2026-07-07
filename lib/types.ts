// lib/types.ts
export type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

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
