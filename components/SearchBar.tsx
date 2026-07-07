"use client";
// components/SearchBar.tsx
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { formatLKR } from "@/lib/types";

type Suggestions = {
  products: {
    id: string;
    title: string;
    price: number;
    image: string | null;
    shopName: string;
    shopSlug: string;
  }[];
  shops: {
    name: string;
    slug: string;
    logo_url: string | null;
    city: string | null;
    district: string | null;
  }[];
};

export default function SearchBar({ big = false }: { big?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [sug, setSug] = useState<Suggestions>({ products: [], shops: [] });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) {
      setSug({ products: [], shops: [] });
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
        const data = await res.json();
        setSug(data);
        setOpen(true);
      } catch {
        setSug({ products: [], shops: [] });
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function go() {
    const query = q.trim();
    if (query) {
      setOpen(false);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  }

  const hasResults = sug.products.length > 0 || sug.shops.length > 0;

  return (
    <div ref={boxRef} className={`relative w-full ${big ? "max-w-xl" : "max-w-md"}`}>
      <div
        className={`flex w-full rounded-lg border border-line bg-white overflow-hidden focus-within:ring-2 focus-within:ring-berry/40 ${
          big ? "shadow-sm" : ""
        }`}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => q.trim().length >= 2 && setOpen(true)}
          onKeyDown={(e) => e.key === "Enter" && go()}
          placeholder="Search frocks, sarees, shirts…"
          className={`flex-1 px-4 outline-none bg-transparent ${
            big ? "py-3.5 text-base" : "py-2.5 text-sm"
          }`}
        />
        <button
          onClick={go}
          className={`bg-berry text-white font-medium hover:bg-berry-dark ${
            big ? "px-6" : "px-4 text-sm"
          }`}
        >
          Search
        </button>
      </div>

      {open && q.trim().length >= 2 && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-line bg-white shadow-lg overflow-hidden text-left">
          {loading && !hasResults && (
            <p className="px-4 py-3 text-sm text-soft">Searching…</p>
          )}

          {!loading && !hasResults && (
            <p className="px-4 py-3 text-sm text-soft">
              No matches for &ldquo;{q.trim()}&rdquo;. Press Enter to search anyway.
            </p>
          )}

          {sug.shops.length > 0 && (
            <div className="border-b border-line">
              <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-soft">
                Shops
              </p>
              {sug.shops.map((s) => (
                <Link
                  key={s.slug}
                  href={`/${s.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-sand"
                >
                  <div className="h-8 w-8 rounded-full bg-line/50 overflow-hidden shrink-0">
                    {s.logo_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.logo_url} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{s.name}</span>
                  {(s.city || s.district) && (
                    <span className="text-xs text-soft ml-auto">
                      {s.city || s.district}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}

          {sug.products.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-soft">
                Products
              </p>
              {sug.products.map((p) => (
                <Link
                  key={p.id}
                  href={`/${p.shopSlug}/${p.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-sand"
                >
                  <div className="h-10 w-10 rounded-lg bg-line/50 overflow-hidden shrink-0">
                    {p.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.title}</p>
                    <p className="text-xs text-soft truncate">{p.shopName}</p>
                  </div>
                  <span className="text-sm font-semibold text-berry ml-auto shrink-0">
                    {formatLKR(p.price)}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {hasResults && (
            <button
              onClick={go}
              className="w-full text-center px-4 py-2.5 text-sm font-medium text-berry hover:bg-sand border-t border-line"
            >
              See all results for &ldquo;{q.trim()}&rdquo; &rarr;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
