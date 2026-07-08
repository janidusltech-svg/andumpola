"use client";
// components/ProductForm.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/upload";
import { Category, Product, AUDIENCES } from "@/lib/types";
import ImageCropper from "@/components/ImageCropper";

type SizeRow = { size: string; qty: string };

export default function ProductForm({
  categories,
  existing,
  photoLimit = 3,
}: {
  categories: Category[];
  existing?: Product;
  photoLimit?: number;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [f, setF] = useState({
    title: existing?.title ?? "",
    description: existing?.description ?? "",
    price: existing ? String(existing.price) : "",
    category_id: existing?.category_id ?? categories[0]?.id ?? "",
    audience: existing?.audience ?? "unisex",
    is_available: existing?.is_available ?? true,
  });
  const [sizes, setSizes] = useState<SizeRow[]>(
    existing && Object.keys(existing.sizes ?? {}).length
      ? Object.entries(existing.sizes).map(([size, qty]) => ({
          size,
          qty: String(qty),
        }))
      : [{ size: "", qty: "" }]
  );
  const [existingImages, setExistingImages] = useState<string[]>(
    existing?.images ?? []
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [cropQueue, setCropQueue] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function setSize(i: number, key: keyof SizeRow, val: string) {
    setSizes((s) =>
      s.map((row, idx) => (idx === i ? { ...row, [key]: val } : row))
    );
  }

  async function submit() {
    setError("");
    if (!f.title || !f.price || !f.category_id) {
      setError("Title, price and category are required.");
      return;
    }
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in.");

      const { data: shop } = await supabase
        .from("shops")
        .select("id")
        .eq("owner_id", user.id)
        .single();
      if (!shop) throw new Error("Create your shop first.");

      // upload new images
      const uploaded: string[] = [];
      for (const file of newFiles) {
        uploaded.push(await uploadImage("product-images", file, user.id));
      }
      const images = [...existingImages, ...uploaded];

      // build sizes object
      const sizesObj: Record<string, number> = {};
      for (const r of sizes) {
        if (r.size.trim() && r.qty !== "")
          sizesObj[r.size.trim()] = Math.max(0, parseInt(r.qty) || 0);
      }

      const payload = {
        shop_id: shop.id,
        title: f.title.trim(),
        description: f.description.trim() || null,
        price: parseFloat(f.price),
        category_id: f.category_id,
        audience: f.audience,
        sizes: sizesObj,
        images,
        is_available: f.is_available,
      };

      if (existing) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      }
      router.push("/dashboard/products");
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-line rounded-xl p-6 space-y-4 max-w-2xl">
      <label className="block">
        <span className="text-sm font-medium">Product title *</span>
        <input
          value={f.title}
          onChange={(e) => setF({ ...f, title: e.target.value })}
          placeholder="Floral Summer Frock"
          className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:ring-2 focus:ring-berry/40"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-medium">Price (LKR) *</span>
          <input
            type="number"
            value={f.price}
            onChange={(e) => setF({ ...f, price: e.target.value })}
            placeholder="2450"
            className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:ring-2 focus:ring-berry/40"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Category *</span>
          <select
            value={f.category_id}
            onChange={(e) => setF({ ...f, category_id: e.target.value })}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:ring-2 focus:ring-berry/40 bg-white"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Audience: who is this for? */}
      <div>
        <span className="text-sm font-medium">Who is it for? *</span>
        <div className="mt-1.5 flex gap-2 flex-wrap">
          {AUDIENCES.map((a) => (
            <button
              key={a.value}
              type="button"
              onClick={() => setF({ ...f, audience: a.value })}
              className={`rounded-xl px-4 py-2 text-sm font-semibold border transition-colors ${
                f.audience === a.value
                  ? "bg-ink text-white border-ink"
                  : "bg-white border-line hover:border-berry hover:text-berry"
              }`}
            >
              {a.emoji} {a.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-soft mt-1">
          Customers filter by Men / Women / Kids — pick the right one so your
          product is found.
        </p>
      </div>

      <label className="block">
        <span className="text-sm font-medium">Description</span>
        <textarea
          value={f.description}
          onChange={(e) => setF({ ...f, description: e.target.value })}
          rows={3}
          placeholder="Fabric, colours, fit, care…"
          className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:ring-2 focus:ring-berry/40 resize-none"
        />
      </label>

      {/* Sizes + stock */}
      <div>
        <span className="text-sm font-medium">Sizes & stock</span>
        <p className="text-xs text-soft mb-2">
          e.g. S / M / L / XL / Free Size. Stock is how many you have.
        </p>
        <div className="space-y-2">
          {sizes.map((row, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={row.size}
                onChange={(e) => setSize(i, "size", e.target.value)}
                placeholder="Size (M)"
                className="flex-1 rounded-lg border border-line px-3 py-2 outline-none focus:ring-2 focus:ring-berry/40"
              />
              <input
                type="number"
                value={row.qty}
                onChange={(e) => setSize(i, "qty", e.target.value)}
                placeholder="Qty"
                className="w-24 rounded-lg border border-line px-3 py-2 outline-none focus:ring-2 focus:ring-berry/40"
              />
              <button
                onClick={() =>
                  setSizes((s) => s.filter((_, idx) => idx !== i))
                }
                className="px-3 text-soft hover:text-berry"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => setSizes((s) => [...s, { size: "", qty: "" }])}
          className="mt-2 text-sm font-medium text-berry"
        >
          + Add size
        </button>
      </div>

      {/* Images */}
      <div>
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium">Photos</span>
          <span className="text-xs text-soft">
            {existingImages.length + newFiles.length} / {photoLimit}
          </span>
        </div>
        <p className="text-xs text-soft mb-2">
          Add photos of different colours and angles. The first photo is the
          main image customers see. Up to {photoLimit} photos on your plan.
        </p>

        {/* Existing images with main badge + remove */}
        {existingImages.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-3">
            {existingImages.map((img, i) => (
              <div key={img} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt=""
                  className="h-20 w-20 rounded-lg object-cover border border-line"
                />
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 bg-ink/80 text-white text-[9px] px-1.5 py-0.5 rounded">
                    Main
                  </span>
                )}
                {i !== 0 && (
                  <button
                    type="button"
                    title="Make main image"
                    onClick={() =>
                      setExistingImages((imgs) => {
                        const copy = [...imgs];
                        const [m] = copy.splice(i, 1);
                        return [m, ...copy];
                      })
                    }
                    className="absolute bottom-1 left-1 bg-white/90 text-ink text-[9px] px-1.5 py-0.5 rounded border border-line hover:bg-white"
                  >
                    Set main
                  </button>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setExistingImages((imgs) => imgs.filter((_, idx) => idx !== i))
                  }
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-berry text-white text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* New file previews */}
        {newFiles.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-3">
            {newFiles.map((file, i) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(file)}
                  alt=""
                  className="h-20 w-20 rounded-lg object-cover border border-dashed border-berry"
                />
                <button
                  type="button"
                  onClick={() =>
                    setNewFiles((files) => files.filter((_, idx) => idx !== i))
                  }
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-berry text-white text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {existingImages.length + newFiles.length < photoLimit ? (
          <label className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2.5 text-sm font-medium cursor-pointer hover:border-berry hover:text-berry">
            + Add photos
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const picked = Array.from(e.target.files ?? []);
                const room = photoLimit - existingImages.length - newFiles.length;
                // send to crop queue — each photo gets cropped to 3:4
                setCropQueue((prev) => [...prev, ...picked.slice(0, room)]);
                e.target.value = ""; // allow re-picking same file
              }}
            />
          </label>
        ) : (
          <p className="text-xs text-turmeric bg-turmeric/10 border border-turmeric/30 rounded-lg px-3 py-2">
            Photo limit reached ({photoLimit}).{" "}
            {photoLimit < 10 && (
              <>Upgrade to Pro for up to 10 photos per product.</>
            )}
          </p>
        )}
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={f.is_available}
          onChange={(e) => setF({ ...f, is_available: e.target.checked })}
          className="h-4 w-4 accent-[color:var(--color-berry)]"
        />
        <span className="text-sm">Show this product to customers</span>
      </label>

      {error && <p className="text-sm text-berry">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={submit}
          disabled={loading}
          className="rounded-lg bg-berry text-white font-semibold px-6 py-3 hover:bg-berry-dark disabled:opacity-60"
        >
          {loading
            ? "Saving…"
            : existing
            ? "Save changes"
            : "Add product"}
        </button>
        <button
          onClick={() => router.push("/dashboard/products")}
          className="rounded-lg border border-line font-semibold px-6 py-3 hover:border-berry"
        >
          Cancel
        </button>
      </div>

      {/* Crop window — photos are cropped one at a time to 3:4 */}
      {cropQueue.length > 0 && (
        <ImageCropper
          file={cropQueue[0]}
          kind="product"
          onDone={(cropped) => {
            setNewFiles((prev) => [...prev, cropped]);
            setCropQueue((prev) => prev.slice(1));
          }}
          onCancel={() => setCropQueue((prev) => prev.slice(1))}
        />
      )}
    </div>
  );
}
