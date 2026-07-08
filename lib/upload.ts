// lib/upload.ts
import { createClient } from "@/lib/supabase/client";

// Security limits
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_RECEIPT_BYTES = 8 * 1024 * 1024; // 8 MB
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

// Uploads a file to a public bucket and returns its public URL.
export async function uploadImage(
  bucket: "shop-assets" | "product-images",
  file: File,
  userId: string
): Promise<string> {
  validateImage(file, MAX_IMAGE_BYTES);

  const supabase = createClient();
  const ext = (file.name.split(".").pop() || "jpg")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const path = `${userId}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;

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
export async function uploadReceipt(file: File, prefix: string): Promise<string> {
  validateImage(file, MAX_RECEIPT_BYTES);

  const supabase = createClient();
  const ext = (file.name.split(".").pop() || "jpg")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const path = `${prefix}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from("receipts")
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error;
  return path;
}
