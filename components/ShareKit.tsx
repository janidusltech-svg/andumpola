"use client";
// components/ShareKit.tsx — shop link, one-tap sharing, printable QR code
import { useState } from "react";

export default function ShareKit({ slug, name }: { slug: string; name: string }) {
  const [copied, setCopied] = useState(false);
  const url = `https://www.andumpola.lk/${slug}`;
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=10&data=${encodeURIComponent(url)}`;
  const msg = encodeURIComponent(`Visit our online shop ${name} 🛍️ ${url}`);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  async function downloadQr() {
    try {
      const blob = await (await fetch(qr)).blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${slug}-qr.png`;
      a.click();
    } catch {
      window.open(qr, "_blank");
    }
  }

  return (
    <div className="rounded-2xl border border-berry/20 bg-berry/5 p-5 mb-8">
      <h2 className="display font-bold text-lg">🔗 Your shop website</h2>
      <p className="text-sm text-soft mt-0.5">Share this link everywhere — it&apos;s your online shop.</p>

      <div className="mt-3 flex flex-col sm:flex-row gap-2">
        <span className="flex-1 min-w-0 truncate rounded-lg bg-white border border-line px-3 py-2.5 font-mono text-sm">
          andumpola.lk/{slug}
        </span>
        <button onClick={copy} className="rounded-lg bg-berry text-white font-semibold px-4 py-2.5 text-sm hover:bg-berry-dark">
          {copied ? "Copied ✓" : "Copy link"}
        </button>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <a href={`https://wa.me/?text=${msg}`} target="_blank" rel="noopener noreferrer"
          className="rounded-lg bg-leaf text-white font-semibold py-2.5 text-sm text-center hover:opacity-90">
          Share on WhatsApp
        </a>
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer"
          className="rounded-lg border border-line bg-white font-semibold py-2.5 text-sm text-center hover:border-berry">
          Share on Facebook
        </a>
      </div>

      <div className="mt-4 flex items-center gap-4 rounded-xl bg-white border border-line p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qr} alt="Shop QR code" className="h-24 w-24 shrink-0" />
        <div className="min-w-0">
          <p className="font-semibold text-sm">Shop QR code</p>
          <p className="text-xs text-soft">Print it for your counter — customers scan to see all your products.</p>
          <button onClick={downloadQr} className="mt-2 text-sm font-semibold text-berry">
            Download QR ↓
          </button>
        </div>
      </div>
    </div>
  );
}
