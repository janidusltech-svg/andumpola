"use client";
// components/ShopSettingsForm.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/upload";
import { Shop } from "@/lib/types";
import ProvinceDistrictSelect from "@/components/ProvinceDistrictSelect";
import CroppedFileField from "@/components/CroppedFileField";
import LocationPicker from "@/components/LocationPicker";
import { SHOP_TYPES, SHOP_MODES } from "@/lib/types";

type ShopFull = Shop & {
  bank_name?: string | null;
  bank_branch?: string | null;
  bank_account_name?: string | null;
  bank_account_number?: string | null;
};

export default function ShopSettingsForm({ shop }: { shop: ShopFull }) {
  const router = useRouter();
  const supabase = createClient();
  const [f, setF] = useState({
    name: shop.name,
    description: shop.description ?? "",
    whatsapp: shop.whatsapp,
    phone: shop.phone,
    province: shop.province ?? "",
    district: shop.district ?? "",
    city: shop.city ?? "",
    address: shop.address ?? "",
    bank_name: shop.bank_name ?? "",
    bank_branch: shop.bank_branch ?? "",
    bank_account_name: shop.bank_account_name ?? "",
    bank_account_number: shop.bank_account_number ?? "",
    enable_online_orders: shop.enable_online_orders,
    shop_type: (shop.shop_type ?? "retail") as string,
    shop_mode: (shop.shop_mode ?? "both") as string,
    facebook_url: shop.facebook_url ?? "",
    instagram_url: shop.instagram_url ?? "",
    tiktok_url: shop.tiktok_url ?? "",
    business_hours: shop.business_hours ?? "",
    announcement: shop.announcement ?? "",
  });
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    shop.latitude != null && shop.longitude != null
      ? { lat: shop.latitude, lng: shop.longitude }
      : null
  );
  const [logo, setLogo] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function save() {
    setError("");
    setMsg("");
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in.");

      const patch: Record<string, unknown> = {
        name: f.name.trim(),
        description: f.description.trim() || null,
        whatsapp: f.whatsapp.replace(/[^0-9]/g, ""),
        phone: f.phone.trim(),
        province: f.province || null,
        district: f.district || null,
        city: f.city.trim() || null,
        address: f.address.trim() || null,
        bank_name: f.bank_name.trim() || null,
        bank_branch: f.bank_branch.trim() || null,
        bank_account_name: f.bank_account_name.trim() || null,
        bank_account_number: f.bank_account_number.trim() || null,
        enable_online_orders: f.enable_online_orders,
        shop_type: f.shop_type,
        shop_mode: f.shop_mode,
        facebook_url: f.facebook_url.trim() || null,
        instagram_url: f.instagram_url.trim() || null,
        tiktok_url: f.tiktok_url.trim() || null,
        business_hours: f.business_hours.trim() || null,
        announcement: f.announcement.trim() || null,
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
        updated_at: new Date().toISOString(),
      };
      if (logo) patch.logo_url = await uploadImage("shop-assets", logo, user.id);
      if (banner)
        patch.banner_url = await uploadImage("shop-assets", banner, user.id);

      // Guard: can't enable online orders without bank details
      if (f.enable_online_orders && !f.bank_account_number.trim()) {
        throw new Error(
          "Add your bank account number before enabling online orders."
        );
      }

      const { error } = await supabase
        .from("shops")
        .update(patch)
        .eq("id", shop.id);
      if (error) throw error;
      setMsg("Saved!");
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Basic info */}
      <Section title="Shop details">
        <Field label="Shop name" value={f.name} onChange={(v) => setF({ ...f, name: v })} />
        <Area
          label="Description"
          value={f.description}
          onChange={(v) => setF({ ...f, description: v })}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="WhatsApp" value={f.whatsapp} onChange={(v) => setF({ ...f, whatsapp: v })} />
          <Field label="Phone" value={f.phone} onChange={(v) => setF({ ...f, phone: v })} />
        </div>
        <ProvinceDistrictSelect
          province={f.province}
          district={f.district}
          onProvinceChange={(v) => setF((prev) => ({ ...prev, province: v }))}
          onDistrictChange={(v) => setF((prev) => ({ ...prev, district: v }))}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="City / Town" value={f.city} onChange={(v) => setF({ ...f, city: v })} />
          <Field label="Address" value={f.address} onChange={(v) => setF({ ...f, address: v })} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CroppedFileField label="Replace logo" kind="logo" file={logo} onChange={setLogo} />
          <CroppedFileField label="Replace banner" kind="banner" file={banner} onChange={setBanner} />
        </div>
      </Section>

      {/* Type, mode, location */}
      <Section title="Shop type & location">
        <div>
          <span className="text-sm font-medium">Shop type</span>
          <div className="mt-1.5 flex gap-2 flex-wrap">
            {SHOP_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setF({ ...f, shop_type: t.value })}
                title={t.hint}
                className={`rounded-xl px-4 py-2 text-sm font-semibold border ${
                  f.shop_type === t.value
                    ? "bg-ink text-white border-ink"
                    : "bg-white border-line hover:border-berry hover:text-berry"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="text-sm font-medium">How do you operate?</span>
          <div className="mt-1.5 flex gap-2 flex-wrap">
            {SHOP_MODES.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setF({ ...f, shop_mode: m.value })}
                title={m.hint}
                className={`rounded-xl px-4 py-2 text-sm font-semibold border ${
                  f.shop_mode === m.value
                    ? "bg-ink text-white border-ink"
                    : "bg-white border-line hover:border-berry hover:text-berry"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <LocationPicker value={coords} onChange={(c) => setCoords(c)} />
      </Section>

      {/* Storefront — makes their page feel like their own website */}
      <Section title="Your storefront">
        <p className="text-xs text-soft -mt-2">
          These make your shop page feel like your own website. Share your shop
          link on Facebook &amp; WhatsApp!
        </p>

        <label className="block">
          <span className="text-sm font-medium">Announcement (optional)</span>
          <input
            value={f.announcement}
            onChange={(e) => setF({ ...f, announcement: e.target.value })}
            maxLength={120}
            placeholder="e.g. 20% off all frocks this week! 🎉"
            className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:ring-2 focus:ring-berry/40"
          />
          <span className="text-[11px] text-soft">
            Shows as a banner at the top of your shop page.
          </span>
        </label>

        <label className="block">
          <span className="text-sm font-medium">Business hours (optional)</span>
          <input
            value={f.business_hours}
            onChange={(e) => setF({ ...f, business_hours: e.target.value })}
            placeholder="Mon–Sat: 9am–6pm · Sun: closed"
            className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:ring-2 focus:ring-berry/40"
          />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium">Facebook link</span>
            <input
              value={f.facebook_url}
              onChange={(e) => setF({ ...f, facebook_url: e.target.value })}
              placeholder="https://facebook.com/yourpage"
              className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:ring-2 focus:ring-berry/40"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Instagram link</span>
            <input
              value={f.instagram_url}
              onChange={(e) => setF({ ...f, instagram_url: e.target.value })}
              placeholder="https://instagram.com/yourpage"
              className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:ring-2 focus:ring-berry/40"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">TikTok link</span>
            <input
              value={f.tiktok_url}
              onChange={(e) => setF({ ...f, tiktok_url: e.target.value })}
              placeholder="https://tiktok.com/@yourpage"
              className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:ring-2 focus:ring-berry/40"
            />
          </label>
        </div>
        <p className="text-xs text-soft">
          Tip: mark your best products as &ldquo;Featured&rdquo; when editing
          them — featured items show first on your shop page.
        </p>
      </Section>

      {/* Bank details */}
      <Section title="Bank details (for online orders)">
        <p className="text-xs text-soft -mt-2">
          Shown to customers ONLY when they order from your shop. Customers pay
          you directly — AndumPola never handles this money.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Bank name" value={f.bank_name} onChange={(v) => setF({ ...f, bank_name: v })} placeholder="Commercial Bank" />
          <Field label="Branch" value={f.bank_branch} onChange={(v) => setF({ ...f, bank_branch: v })} placeholder="Maharagama" />
        </div>
        <Field label="Account name" value={f.bank_account_name} onChange={(v) => setF({ ...f, bank_account_name: v })} placeholder="K Perera" />
        <Field label="Account number" value={f.bank_account_number} onChange={(v) => setF({ ...f, bank_account_number: v })} placeholder="8001234567" />

        <label className="flex items-start gap-3 mt-2 rounded-lg bg-sand p-3">
          <input
            type="checkbox"
            checked={f.enable_online_orders}
            onChange={(e) =>
              setF({ ...f, enable_online_orders: e.target.checked })
            }
            className="h-4 w-4 mt-0.5 accent-[color:var(--color-berry)]"
          />
          <span className="text-sm">
            <strong>Enable online orders</strong> — let customers place orders
            on your product pages and upload payment receipts. If off, customers
            contact you only via WhatsApp/phone.
          </span>
        </label>
      </Section>

      {error && <p className="text-sm text-berry">{error}</p>}
      {msg && <p className="text-sm text-leaf">{msg}</p>}

      <button
        onClick={save}
        disabled={loading}
        className="rounded-lg bg-berry text-white font-semibold px-6 py-3 hover:bg-berry-dark disabled:opacity-60"
      >
        {loading ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-line rounded-xl p-6 space-y-4">
      <h2 className="display font-bold">{title}</h2>
      {children}
    </div>
  );
}
function Field({
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
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:ring-2 focus:ring-berry/40"
      />
    </label>
  );
}
function Area({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
