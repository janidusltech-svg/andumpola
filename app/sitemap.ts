// app/sitemap.ts
import type { MetadataRoute } from "next";
import { supabasePublic } from "@/lib/supabase/public";

const SITE = "https://andumpola.lk";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = supabasePublic();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    "",
    "/shops",
    "/search",
    "/clothing",
    "/furniture",
    "/electronics",
    "/about",
    "/faq",
    "/contact",
    "/terms",
    "/privacy",
    "/signup",
  ].map((path) => ({
    url: `${SITE}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  // All active shops
  const { data: shops } = await supabase
    .from("shops")
    .select("slug, created_at")
    .eq("status", "active");

  const shopPages: MetadataRoute.Sitemap = (shops ?? []).map((s) => ({
    url: `${SITE}/${s.slug}`,
    lastModified: s.created_at ? new Date(s.created_at) : new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...shopPages];
}
