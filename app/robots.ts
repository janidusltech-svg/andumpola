// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Don't index private/account areas
      disallow: [
        "/dashboard",
        "/admin",
        "/account",
        "/auth",
        "/choose-account",
      ],
    },
    sitemap: "https://andumpola.lk/sitemap.xml",
  };
}
