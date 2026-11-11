"use client";
// components/ProductGallery.tsx
import { useState } from "react";

export default function ProductGallery({
  images,
  title,
  wide = false,
}: {
  images: string[];
  title: string;
  wide?: boolean; // furniture / electronics: show the whole item
}) {
  const [active, setActive] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className={`${wide ? "aspect-square" : "aspect-[3/4]"} rounded-2xl bg-sand border border-line flex items-center justify-center text-soft`}>
        No photo
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div
        className={`${wide ? "aspect-square bg-white" : "aspect-[3/4] bg-sand"} rounded-2xl overflow-hidden border border-line`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[active]}
          alt={`${title} — photo ${active + 1}`}
          className={`h-full w-full ${wide ? "object-contain p-3" : "object-cover"}`}
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                i === active ? "border-berry" : "border-line hover:border-soft"
              }`}
              aria-label={`View photo ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" loading="lazy" className={`h-full w-full ${wide ? "object-contain bg-white" : "object-cover"}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
