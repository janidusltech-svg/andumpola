"use client";
export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg bg-berry text-white font-semibold px-4 py-2 text-sm"
    >
      🖨️ Print / Save PDF
    </button>
  );
}
