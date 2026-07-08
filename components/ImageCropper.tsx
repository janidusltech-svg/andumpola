"use client";
// components/ImageCropper.tsx
// Modal crop window. User adjusts + zooms, we output a perfectly-sized file.
// npm install react-easy-crop
import { useState, useEffect } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { getCroppedFile } from "@/lib/crop";

export type CropKind = "logo" | "banner" | "product";

const PRESETS: Record<
  CropKind,
  { aspect: number; outW: number; outH: number; label: string; shape: "rect" | "round" }
> = {
  logo: { aspect: 1, outW: 512, outH: 512, label: "Logo (square)", shape: "rect" },
  banner: { aspect: 3, outW: 1500, outH: 500, label: "Banner (wide)", shape: "rect" },
  product: { aspect: 3 / 4, outW: 900, outH: 1200, label: "Product photo", shape: "rect" },
};

export default function ImageCropper({
  file,
  kind,
  onDone,
  onCancel,
}: {
  file: File;
  kind: CropKind;
  onDone: (cropped: File) => void;
  onCancel: () => void;
}) {
  const preset = PRESETS[kind];
  const [src, setSrc] = useState<string>("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function confirm() {
    if (!area) return;
    setBusy(true);
    try {
      const cropped = await getCroppedFile(
        src,
        area,
        preset.outW,
        preset.outH,
        file.name.replace(/\.[^.]+$/, "") + ".jpg"
      );
      onDone(cropped);
    } catch {
      onCancel();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] bg-ink/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-line flex items-center justify-between">
          <h3 className="display font-bold">Adjust your {preset.label.toLowerCase()}</h3>
          <button onClick={onCancel} className="text-soft hover:text-berry text-xl">
            ✕
          </button>
        </div>

        <div className="relative h-[340px] bg-ink/90">
          {src && (
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={preset.aspect}
              cropShape={preset.shape}
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, pixels) => setArea(pixels)}
            />
          )}
        </div>

        <div className="px-5 py-4 space-y-4">
          <label className="block">
            <span className="text-xs text-soft">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-[color:var(--color-berry)]"
            />
          </label>
          <p className="text-xs text-soft">
            Drag to position, use the slider to zoom. Everything inside the
            frame is what customers will see.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="btn btn-ghost flex-1"
            >
              Cancel
            </button>
            <button
              onClick={confirm}
              disabled={busy || !area}
              className="btn btn-primary flex-1 disabled:opacity-60"
            >
              {busy ? "Cropping…" : "Crop & use"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
