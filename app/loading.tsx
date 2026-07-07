// app/loading.tsx
export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="animate-pulse space-y-8">
        {/* hero-ish */}
        <div className="flex flex-col items-center gap-3">
          <div className="h-4 w-48 rounded bg-line/70" />
          <div className="h-10 w-72 rounded bg-line/70" />
          <div className="h-12 w-full max-w-xl rounded-lg bg-line/70 mt-2" />
        </div>
        {/* cards */}
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
    </div>
  );
}
