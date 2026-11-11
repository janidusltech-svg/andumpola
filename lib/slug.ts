// lib/slug.ts — shop URL rules (shared by owner sign-up and admin sign-up)
export function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Route names a shop can never use as its URL
export const RESERVED_SLUGS = [
  "shops", "search", "login", "signup", "dashboard", "admin", "account",
  "track", "order", "orders", "api", "auth", "about", "terms", "privacy",
  "contact", "help", "andumpola", "pricing", "join", "print", "faq",
  "clothing", "furniture", "electronics", "choose-account",
  "forgot-password", "reset-password", "manifest", "robots", "sitemap",
];
