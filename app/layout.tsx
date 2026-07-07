// app/layout.tsx
import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

// Header reads the logged-in user, so render per-request
export const dynamic = "force-dynamic";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});
const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: {
    default: "AndumPola — ඇඳුම්පොළ | Sri Lanka's Online Clothing Market",
    template: "%s",
  },
  description:
    "Browse hundreds of Sri Lankan clothing shops in one place. Frocks, sarees, shirts and more — contact shops directly on WhatsApp.",
  openGraph: {
    siteName: "AndumPola",
    type: "website",
    locale: "en_LK",
    title: "AndumPola — Sri Lanka's Online Clothing Market",
    description:
      "Every clothing shop. One pola. Browse Sri Lankan shops and order directly.",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bricolage.variable} ${instrument.variable}`}>
      <body className="min-h-screen flex flex-col">
        <SiteHeader />

        <main className="flex-1">{children}</main>

        <footer className="border-t border-line mt-16">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-soft flex flex-col sm:flex-row justify-between gap-2">
            <p>
              © {new Date().getFullYear()} AndumPola — connecting Sri Lankan
              clothing shops and customers.
            </p>
            <div className="flex flex-col sm:items-end gap-1">
              <Link href="/track" className="text-berry font-medium">
                Track your order
              </Link>
              <p>
                Payments are made directly to shops. AndumPola does not process
                or hold payments.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
