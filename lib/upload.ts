// lib/upload.ts
import { createClient } from "@/lib/supabase/client";

// Uploads a file to a public bucket and returns its public URL.
export async function uploadImage(
  bucket: "shop-assets" | "product-images",
  file: File,
  userId: string
): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// Uploads a receipt to the PRIVATE receipts bucket, returns the path (not URL).
export async function uploadReceipt(file: File, prefix: string): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${prefix}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from("receipts")
    .upload(path, file, { upsert: false });
  if (error) throw error;
  return path;
}
