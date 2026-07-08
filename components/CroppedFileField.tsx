"use client";
// components/CroppedFileField.tsx
import { useState } from "react";
import ImageCropper, { CropKind } from "@/components/ImageCropper";

export default function CroppedFileField({
  label,
  kind,
  file,
  onChange,
}: {
  label: string;
  kind: CropKind;
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  const [raw, setRaw] = useState<File | null>(null);

  return (
    <div>
      <span className="text-sm font-medium">{label}</span>
      <label className="mt-1 flex items-center gap-3 rounded-lg border border-dashed border-line px-3 py-2.5 cursor-pointer hover:border-berry">
        <span className="text-sm text-berry font-medium">Choose image…</span>
        {file && (
          <span className="text-xs text-leaf truncate">✓ {file.name}</span>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const picked = e.target.files?.[0] ?? null;
            if (picked) setRaw(picked);
            e.target.value = "";
          }}
        />
      </label>
      <p className="text-[11px] text-soft mt-1">
        {kind === "logo" && "Square — you'll crop it after choosing."}
        {kind === "banner" && "Wide (3:1) — you'll crop it after choosing."}
        {kind === "product" && "Portrait (3:4) — you'll crop it after choosing."}
      </p>

      {raw && (
        <ImageCropper
          file={raw}
          kind={kind}
          onDone={(cropped) => {
            onChange(cropped);
            setRaw(null);
          }}
          onCancel={() => setRaw(null)}
        />
      )}
    </div>
  );
}
