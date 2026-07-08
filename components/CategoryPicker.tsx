"use client";
// components/CategoryPicker.tsx
import { useState } from "react";
import Link from "next/link";
import { Category, Audience, AUDIENCES } from "@/lib/types";
import { MAIN_CATEGORY_SLUGS } from "@/lib/lk-locations";

export default function CategoryPicker({
  categories,
  activeSlug,
  activeAudience,
  baseParams = {},
}: {
  categories: Category[];
  activeSlug?: string;
  activeAudience?: string; // from URL on search page
  // other params to preserve (q, province, district). category+audience set here.
  baseParams?: Record<string, string | undefined>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Audience | "all">(
    (activeAudience as Audience) || "all"
  );

  const q = search.trim().toLowerCase();

  function buildHref(opts: { category?: string; audience?: string }) {
    const merged: Record<string, string | undefined> = {
      ...baseParams,
      audience: opts.audience !== undefined ? opts.audience : tab === "all" ? undefined : tab,
      category: opts.category,
    };
    const parts = Object.entries(merged)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`);
    return `/search${parts.length ? "?" + parts.join("&") : ""}`;
  }

  // Filter categories by audience tab (unisex categories show in every tab)
  const byAudience =
    tab === "all"
      ? categories
      : categories.filter((c) => c.audience === tab || c.audience === "unisex");

  let shown: Category[];
  if (q) {
    shown = byAudience.filter((c) => c.name.toLowerCase().includes(q));
  } else if (expanded) {
    shown = byAudience;
  } else if (tab !== "all") {
    // inside a tab, the list is already focused — show all of that tab
    shown = byAudience;
  } else {
    shown = byAudience.filter((c) => MAIN_CATEGORY_SLUGS.includes(c.slug));
    if (shown.length === 0) shown = byAudience.slice(0, 10);
  }

  const hiddenCount = byAudience.length - shown.length;

  return (
    <div>
      {/* Audience tabs */}
      <div className="flex gap-2 justify-center mb-4 flex-wrap">
        <TabButton
          active={tab === "all"}
          onClick={() => setTab("all")}
          label="All"
        />
        {AUDIENCES.filter((a) => a.value !== "unisex").map((a) => (
          <TabButton
            key={a.value}
            active={tab === a.value}
            onClick={() => setTab(a.value)}
            label={`${a.emoji} ${a.label}`}
          />
        ))}
      </div>

      {/* Category search */}
      <div className="mb-3 max-w-xs mx-auto">
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

      {/* Chips */}
      <div className="flex gap-2 flex-wrap justify-center">
        {!q && (
          <Link
            href={buildHref({ category: undefined })}
            className={`rounded-full px-3 py-1.5 text-sm border whitespace-nowrap ${
              !activeSlug
                ? "bg-berry text-white border-berry"
                : "bg-white border-line hover:border-berry"
            }`}
          >
            {tab === "all" ? "All categories" : `All ${labelFor(tab)}`}
          </Link>
        )}
        {shown.map((c) => (
          <Link
            key={c.id}
            href={buildHref({ category: c.slug })}
            className={`rounded-full px-3 py-1.5 text-sm border whitespace-nowrap ${
              activeSlug === c.slug
                ? "bg-berry text-white border-berry"
                : "bg-white border-line hover:border-berry hover:text-berry"
            }`}
          >
            {c.name}
          </Link>
        ))}

        {!q && tab === "all" && !expanded && hiddenCount > 0 && (
          <button
            onClick={() => setExpanded(true)}
            className="rounded-full px-3 py-1.5 text-sm border border-berry text-berry font-medium hover:bg-berry hover:text-white"
          >
            + Show all ({byAudience.length})
          </button>
        )}
        {!q && tab === "all" && expanded && (
          <button
            onClick={() => setExpanded(false)}
            className="rounded-full px-3 py-1.5 text-sm border border-line text-soft hover:border-berry"
          >
            Show less
          </button>
        )}
      </div>

      {q && shown.length === 0 && (
        <p className="text-sm text-soft mt-2 text-center">
          No categories match &ldquo;{search}&rdquo;.
        </p>
      )}
    </div>
  );
}

function labelFor(tab: string) {
  const map: Record<string, string> = {
    men: "Men's wear",
    women: "Women's wear",
    kids: "Kids' wear",
  };
  return map[tab] ?? "";
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-semibold border transition-colors ${
        active
          ? "bg-ink text-white border-ink"
          : "bg-white border-line hover:border-berry hover:text-berry"
      }`}
    >
      {label}
    </button>
  );
}
