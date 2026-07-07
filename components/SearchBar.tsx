"use client";
// components/SearchBar.tsx
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SearchBar({ big = false }: { big?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  function go() {
    const query = q.trim();
    if (query) router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <div
      className={`flex w-full rounded-lg border border-line bg-white overflow-hidden focus-within:ring-2 focus-within:ring-berry/40 ${
        big ? "max-w-xl shadow-sm" : "max-w-md"
      }`}
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
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
  );
}
