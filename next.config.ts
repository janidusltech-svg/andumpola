// next.config.ts
import type { NextConfig } from "next";

const securityHeaders = [
  // Stop your site being embedded in an iframe (clickjacking protection)
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Stop browsers guessing content types
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Control how much referrer info is sent
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Limit powerful browser features
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // Force HTTPS for 2 years (Vercel already serves HTTPS)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
