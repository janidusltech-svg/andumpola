// lib/upload.ts
import { createClient } from "@/lib/supabase/client";

// Security limits (checked on the ORIGINAL file, before compression)
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_RECEIPT_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

function validateImage(file: File, maxBytes: number) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Please upload a JPG, PNG, WEBP, or GIF image.");
  }
  if (file.size > maxBytes) {
    const mb = Math.round(maxBytes / (1024 * 1024));
    throw new Error(`File is too large. Maximum size is ${mb} MB.`);
  }
}

// Shrinks an image in the browser before upload: resizes so the longest
// side is at most `maxSide` px and re-encodes as JPEG. A 4 MB phone photo
// typically becomes ~150–300 KB. GIFs and already-small files are kept as-is.
async function compressImage(
  file: File,
  maxSide = 1600,
  quality = 0.75
): Promise<File> {
  if (file.type === "image/gif" || file.size < 250 * 1024) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#ffffff"; // transparent PNGs get a white background
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    const blob: Blob | null = await new Promise((res) =>
      canvas.toBlob(res, "image/jpeg", quality)
    );
    if (!blob || blob.size >= file.size) return file; // no gain → keep original
    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
  } catch {
    return file; // never block an upload because compression failed
  }
}

function extOf(file: File) {
  return (file.name.split(".").pop() || "jpg")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function randomName(prefix: string, file: File) {
  return `${prefix}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${extOf(file)}`;
}

// Uploads a file to a public bucket and returns its public URL.
export async function uploadImage(
  bucket: "shop-assets" | "product-images",
  original: File,
  userId: string
): Promise<string> {
  validateImage(original, MAX_IMAGE_BYTES);
  const file = await compressImage(original, 1600, 0.8);

  const supabase = createClient();
  const path = randomName(userId, file);

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// Uploads a receipt to the PRIVATE receipts bucket, returns the path (not URL).
export async function uploadReceipt(
  original: File,
  prefix: string
): Promise<string> {
  validateImage(original, MAX_RECEIPT_BYTES);
  // Receipts only need to be readable — 1400px is plenty
  const file = await compressImage(original, 1400, 0.72);

  const supabase = createClient();
  const path = randomName(prefix, file);
  const { error } = await supabase.storage
    .from("receipts")
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error;
  return path;
}
