// app/search/loading.tsx
export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 animate-pulse space-y-6">
      <div className="h-8 w-64 rounded bg-line/70" />
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-8 w-20 rounded-full bg-line/60" />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-lg overflow-hidden border border-line">
            <div className="aspect-[3/4] bg-line/60" />
            <div className="p-3 space-y-2">
              <div className="h-3 w-3/4 rounded bg-line/70" />
              <div className="h-5 w-20 rounded bg-line/70" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
