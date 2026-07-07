"use client";
// components/CategoryPicker.tsx
import { useState } from "react";
import Link from "next/link";
import { Category } from "@/lib/types";
import { MAIN_CATEGORY_SLUGS } from "@/lib/lk-locations";

// mode "home"  -> links to /search?category=slug  (all -> /search)
// mode "search"-> links preserving existing query via baseParams
export default function CategoryPicker({
  categories,
  activeSlug,
  baseParams = {},
}: {
  categories: Category[];
  activeSlug?: string;
  // other search params to preserve (q, province, district). category is set here.
  baseParams?: Record<string, string | undefined>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");

  const q = search.trim().toLowerCase();

  function buildHref(categorySlug?: string) {
    const merged: Record<string, string | undefined> = {
      ...baseParams,
      category: categorySlug,
    };
    const parts = Object.entries(merged)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`);
    return `/search${parts.length ? "?" + parts.join("&") : ""}`;
  }

  let shown: Category[];
  if (q) {
    shown = categories.filter((c) => c.name.toLowerCase().includes(q));
  } else if (expanded) {
    shown = categories;
  } else {
    shown = categories.filter((c) => MAIN_CATEGORY_SLUGS.includes(c.slug));
    if (shown.length === 0) shown = categories.slice(0, 10);
  }

  const hiddenCount = categories.length - shown.length;

  return (
    <div>
      <div className="mb-3 max-w-xs">
        <div className="flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2">
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-soft" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3-3" strokeLinecap="round" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories…"
            className="flex-1 text-sm outline-none bg-transparent"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-soft hover:text-berry text-sm"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {!q && (
          <Link
            href={buildHref(undefined)}
            className={`rounded-full px-3 py-1.5 text-sm border whitespace-nowrap ${
              !activeSlug
                ? "bg-berry text-white border-berry"
                : "bg-white border-line hover:border-berry"
            }`}
          >
            All categories
          </Link>
        )}
        {shown.map((c) => (
          <Link
            key={c.id}
            href={buildHref(c.slug)}
            className={`rounded-full px-3 py-1.5 text-sm border whitespace-nowrap ${
              activeSlug === c.slug
                ? "bg-berry text-white border-berry"
                : "bg-white border-line border-t-2 border-t-turmeric hover:border-berry hover:text-berry"
            }`}
          >
            {c.name}
          </Link>
        ))}

        {!q && !expanded && hiddenCount > 0 && (
          <button
            onClick={() => setExpanded(true)}
            className="rounded-full px-3 py-1.5 text-sm border border-berry text-berry font-medium hover:bg-berry hover:text-white"
          >
            + Show all ({categories.length})
          </button>
        )}
        {!q && expanded && (
          <button
            onClick={() => setExpanded(false)}
            className="rounded-full px-3 py-1.5 text-sm border border-line text-soft hover:border-berry"
          >
            Show less
          </button>
        )}
      </div>

      {q && shown.length === 0 && (
        <p className="text-sm text-soft mt-2">No categories match &ldquo;{search}&rdquo;.</p>
      )}
    </div>
  );
}
