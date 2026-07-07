"use client";
// components/CreateShopForm.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/upload";
import ProvinceDistrictSelect from "@/components/ProvinceDistrictSelect";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Route names a shop can never use as its URL
const RESERVED_SLUGS = [
  "shops", "search", "login", "signup", "dashboard", "admin", "account",
  "track", "order", "orders", "api", "auth", "about", "terms", "privacy",
  "contact", "help", "andumpola",
];

export default function CreateShopForm() {
  const router = useRouter();
  const supabase = createClient();
  const [f, setF] = useState({
    name: "",
    description: "",
    whatsapp: "",
    phone: "",
    province: "",
    district: "",
    city: "",
    address: "",
  });
  const [logo, setLogo] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const slug = slugify(f.name);

  async function submit() {
    setError("");
    if (!f.name || !f.whatsapp || !f.phone) {
      setError("Shop name, WhatsApp and phone are required.");
      return;
    }
    if (RESERVED_SLUGS.includes(slug) || slug.length < 3) {
      setError(
        "That shop name can't be used — please choose a different name (at least 3 letters)."
      );
      return;
    }
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in.");

      let logo_url: string | null = null;
      let banner_url: string | null = null;
      if (logo) logo_url = await uploadImage("shop-assets", logo, user.id);
      if (banner) banner_url = await uploadImage("shop-assets", banner, user.id);

      const { error: insErr } = await supabase.from("shops").insert({
        owner_id: user.id,
        name: f.name.trim(),
        slug,
        description: f.description.trim() || null,
        whatsapp: f.whatsapp.replace(/[^0-9]/g, ""),
        phone: f.phone.trim(),
        province: f.province || null,
        district: f.district || null,
        city: f.city.trim() || null,
        address: f.address.trim() || null,
        logo_url,
        banner_url,
        status: "pending",
      });
      if (insErr) {
        if (insErr.code === "23505")
          throw new Error(
            "A shop with a similar name already exists. Try a different name."
          );
        throw insErr;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-line rounded-xl p-6 space-y-4 max-w-2xl">
      <Field
        label="Shop name *"
        value={f.name}
        onChange={(v) => setF({ ...f, name: v })}
        placeholder="ABC Fashion"
        hint={f.name ? `Your page: andumpola.lk/${slug}` : undefined}
      />
      <Area
        label="Description"
        value={f.description}
        onChange={(v) => setF({ ...f, description: v })}
        placeholder="Tell customers what you sell…"
      />
      <div className="grid grid-cols-2 gap-4">
        <Field
          label="WhatsApp number *"
          value={f.whatsapp}
          onChange={(v) => setF({ ...f, whatsapp: v })}
          placeholder="94771234567"
          hint="With country code, no +"
        />
        <Field
          label="Phone (for calls) *"
          value={f.phone}
          onChange={(v) => setF({ ...f, phone: v })}
          placeholder="0771234567"
        />
      </div>
      <ProvinceDistrictSelect
        province={f.province}
        district={f.district}
        onProvinceChange={(v) => setF({ ...f, province: v })}
        onDistrictChange={(v) => setF({ ...f, district: v })}
      />
      <div className="grid grid-cols-2 gap-4">
        <Field
          label="City / Town"
          value={f.city}
          onChange={(v) => setF({ ...f, city: v })}
          placeholder="Maharagama"
        />
        <Field
          label="Address"
          value={f.address}
          onChange={(v) => setF({ ...f, address: v })}
          placeholder="Optional"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FileField label="Logo" onChange={setLogo} file={logo} />
        <FileField label="Banner" onChange={setBanner} file={banner} />
      </div>

      {error && <p className="text-sm text-berry">{error}</p>}

      <button
        onClick={submit}
        disabled={loading}
        className="rounded-lg bg-berry text-white font-semibold px-6 py-3 hover:bg-berry-dark disabled:opacity-60"
      >
        {loading ? "Creating shop…" : "Create shop"}
      </button>
      <p className="text-xs text-soft">
        Your shop starts a 90-day free trial and goes live after admin
        approval.
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:ring-2 focus:ring-berry/40"
      />
      {hint && <span className="text-xs text-soft mt-1 block">{hint}</span>}
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:ring-2 focus:ring-berry/40 resize-none"
      />
    </label>
  );
}

function FileField({
  label,
  onChange,
  file,
}: {
  label: string;
  onChange: (f: File | null) => void;
  file: File | null;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="mt-1 w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-berry file:px-3 file:py-2 file:text-white file:font-medium"
      />
      {file && <span className="text-xs text-leaf mt-1 block">{file.name}</span>}
    </label>
  );
}
