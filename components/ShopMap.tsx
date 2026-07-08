"use client";
// components/ShopMap.tsx
import { useEffect, useRef } from "react";

export default function ShopMap({
  lat,
  lng,
  name,
}: {
  lat: number;
  lng: number;
  name: string;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const created = useRef(false);

  useEffect(() => {
    (async () => {
      const L = (await import("leaflet")).default;
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }
      if (!mapRef.current || created.current) return;
      created.current = true;

      const map = L.map(mapRef.current, {
        scrollWheelZoom: false,
      }).setView([lat, lng], 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);
      const icon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });
      L.marker([lat, lng], { icon }).addTo(map).bindPopup(name);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div
        ref={mapRef}
        className="h-64 w-full rounded-2xl border border-line overflow-hidden bg-sand"
      />
      <a
        href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-berry font-medium mt-2 inline-block"
      >
        Open in maps →
      </a>
    </div>
  );
}
