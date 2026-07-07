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

        <footer className="border-t border-line mt-16 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="col-span-2 md:col-span-1">
                <span className="display text-xl font-bold text-ink">
                  Andum<span className="text-berry">Pola</span>
                </span>
                <p className="text-sm text-soft mt-2">
                  Sri Lanka&apos;s online clothing market. Every clothing shop,
                  one pola.
                </p>
              </div>

              <div>
                <p className="font-semibold text-sm mb-3">Explore</p>
                <ul className="space-y-2 text-sm text-soft">
                  <li><Link href="/shops" className="hover:text-berry">All shops</Link></li>
                  <li><Link href="/search" className="hover:text-berry">Search products</Link></li>
                  <li><Link href="/track" className="hover:text-berry">Track your order</Link></li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-sm mb-3">For shops</p>
                <ul className="space-y-2 text-sm text-soft">
                  <li><Link href="/signup" className="hover:text-berry">Open a shop</Link></li>
                  <li><Link href="/login" className="hover:text-berry">Shop login</Link></li>
                  <li><Link href="/faq" className="hover:text-berry">FAQ</Link></li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-sm mb-3">Company</p>
                <ul className="space-y-2 text-sm text-soft">
                  <li><Link href="/about" className="hover:text-berry">About</Link></li>
                  <li><Link href="/contact" className="hover:text-berry">Contact</Link></li>
                  <li><Link href="/terms" className="hover:text-berry">Terms</Link></li>
                  <li><Link href="/privacy" className="hover:text-berry">Privacy</Link></li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-line flex flex-col sm:flex-row justify-between gap-2 text-xs text-soft">
              <p>© {new Date().getFullYear()} AndumPola. All rights reserved.</p>
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
