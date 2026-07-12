"use client";
// components/BackButton.tsx
import { useRouter } from "next/navigation";

export default function BackButton({
  label = "Back",
  fallback = "/",
  className = "",
}: {
  label?: string;
  // where to go if there's no history to go back to (e.g. opened via a
  // shared link straight from WhatsApp)
  fallback?: string;
  className?: string;
}) {
  const router = useRouter();

  function goBack() {
    // If the user landed here directly (shared link), there's nothing to go
    // back to — send them somewhere useful instead.
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className={`inline-flex items-center gap-1.5 text-sm font-medium text-soft hover:text-berry transition-colors ${className}`}
      aria-label={label}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 fill-none stroke-current"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
      {label}
    </button>
  );
}
