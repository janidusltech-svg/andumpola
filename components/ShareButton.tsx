"use client";
// components/ShareButton.tsx
import { useState } from "react";

export default function ShareButton({
  url,
  text,
  label = "Share",
}: {
  url: string;
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const fullUrl =
    typeof window !== "undefined" && url.startsWith("/")
      ? window.location.origin + url
      : url;

  async function copy() {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-medium hover:border-berry hover:text-berry"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
          <path d="M18 8a3 3 0 1 0-2.8-4H15a3 3 0 0 0 .1 1.5L8.9 9A3 3 0 1 0 8 13.5l6.2 3.6A3 3 0 1 0 18 16a3 3 0 0 0-2.1.9L9.7 13.3a3 3 0 0 0 0-2.6l6.2-3.6A3 3 0 0 0 18 8z" />
        </svg>
        {label}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg border border-line bg-white shadow-lg z-30 overflow-hidden">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(text + " " + fullUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-sand"
            onClick={() => setOpen(false)}
          >
            <span className="text-leaf">●</span> WhatsApp
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              fullUrl
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-sand"
            onClick={() => setOpen(false)}
          >
            <span className="text-berry">●</span> Facebook
          </a>
          <button
            onClick={copy}
            className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-sand"
          >
            <span className="text-soft">●</span> {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      )}
    </div>
  );
}
