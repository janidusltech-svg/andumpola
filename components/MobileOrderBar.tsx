"use client";
// components/MobileOrderBar.tsx — sticky bottom bar on phones (product page).
// Appears once the order box scrolls out of view; tap → jumps to it.
import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n";

export default function MobileOrderBar({
  price,
  soldOut,
}: {
  price: string;
  soldOut?: boolean;
}) {
  const t = useT();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const box = document.getElementById("order");
    if (!box) return;
    const io = new IntersectionObserver(
      ([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top > 0),
      { threshold: 0 }
    );
    io.observe(box);
    return () => io.disconnect();
  }, []);

  return (
    <div
      className={`lg:hidden fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] flex items-center gap-3 transition-transform duration-200 ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!show}
    >
      <span className="display font-bold text-lg whitespace-nowrap">{price}</span>
      <button
        type="button"
        tabIndex={show ? 0 : -1}
        onClick={() =>
          document.getElementById("order")?.scrollIntoView({ behavior: "smooth", block: "center" })
        }
        className={`flex-1 rounded-xl font-bold py-3 text-white ${soldOut ? "bg-ink" : "bg-leaf"}`}
      >
        {soldOut ? t("soldOut") : t("orderOnWhatsApp")}
      </button>
    </div>
  );
}
