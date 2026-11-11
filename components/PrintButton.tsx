"use client";
import { T } from "@/lib/i18n";
export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="shrink-0 whitespace-nowrap rounded-lg bg-berry text-white font-semibold px-4 py-2 text-sm"
    >
      🖨️ <T k="printPdf" />
    </button>
  );
}
