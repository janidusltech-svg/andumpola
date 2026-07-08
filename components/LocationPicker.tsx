"use client";
// components/LocationPicker.tsx
// Free map (OpenStreetMap via Leaflet). npm install leaflet
import { useEffect, useRef, useState } from "react";

type Coords = { lat: number; lng: number };

// Sri Lanka center as default view
const DEFAULT: Coords = { lat: 7.8731, lng: 80.7718 };

export default function LocationPicker({
  value,
  onChange,
}: {
  value: Coords | null;
  onChange: (c: Coords) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletMap = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);
  const [status, setStatus] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // dynamically import leaflet (client only)
      const L = (await import("leaflet")).default;
      // inject leaflet CSS once
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }
      if (cancelled || !mapRef.current || leafletMap.current) return;

      const start = value || DEFAULT;
      const map = L.map(mapRef.current).setView(
        [start.lat, start.lng],
        value ? 15 : 8
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      const icon = L.icon({
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      const marker = L.marker([start.lat, start.lng], {
        draggable: true,
        icon,
      }).addTo(map);

      marker.on("dragend", () => {
        const p = marker.getLatLng();
        onChange({ lat: p.lat, lng: p.lng });
      });
      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        marker.setLatLng(e.latlng);
        onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
      });

      leafletMap.current = map;
      markerRef.current = marker;
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function useMyLocation() {
    setStatus("Locating…");
    if (!navigator.geolocation) {
      setStatus("Location not supported on this device.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        onChange(c);
        if (leafletMap.current && markerRef.current) {
          leafletMap.current.setView([c.lat, c.lng], 16);
          markerRef.current.setLatLng([c.lat, c.lng]);
        }
        setStatus("Location set ✓");
      },
      () => setStatus("Couldn't get location. Drop a pin on the map instead."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Shop location (optional)</span>
        <button
          type="button"
          onClick={useMyLocation}
          className="text-sm font-medium text-berry hover:underline"
        >
          📍 Use my current location
        </button>
      </div>
      <div
        ref={mapRef}
        className="h-64 w-full rounded-lg border border-line overflow-hidden bg-sand relative"
        style={{ zIndex: 0, isolation: "isolate" }}
      />
      {!ready && (
        <p className="text-xs text-soft mt-1">Loading map…</p>
      )}
      <p className="text-xs text-soft mt-1">
        Tap the map or drag the pin to set your shop&apos;s location.{" "}
        {status && <span className="text-leaf">{status}</span>}
      </p>
      {value && (
        <p className="text-xs text-soft">
          Selected: {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
        </p>
      )}
    </div>
  );
}
