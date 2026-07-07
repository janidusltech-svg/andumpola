// app/[shopSlug]/loading.tsx
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-40 sm:h-56 bg-line/60" />
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-end gap-4 -mt-10 mb-6">
          <div className="h-24 w-24 rounded-xl bg-line/70 border-4 border-sand" />
          <div className="pb-1 space-y-2">
            <div className="h-6 w-48 rounded bg-line/70" />
            <div className="h-3 w-24 rounded bg-line/70" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
