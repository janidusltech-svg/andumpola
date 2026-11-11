// app/manifest.ts — lets people "Add to Home screen" / install AndumPola
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AndumPola — Sri Lanka's online pola",
    short_name: "AndumPola",
    description:
      "Every Sri Lankan shop in one place. Shop owners: manage your shop and orders.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#c4265e",
    orientation: "portrait",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "My shop", url: "/dashboard" },
      { name: "Orders", url: "/dashboard/orders" },
      { name: "Add product", url: "/dashboard/products/new" },
    ],
  };
}
