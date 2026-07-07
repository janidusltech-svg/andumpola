"use client";
// components/ShopSettingsForm.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/upload";
import { Shop } from "@/lib/types";
import ProvinceDistrictSelect from "@/components/ProvinceDistrictSelect";

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
  });
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
        <div className="grid grid-cols-2 gap-4">
          <Field label="WhatsApp" value={f.whatsapp} onChange={(v) => setF({ ...f, whatsapp: v })} />
          <Field label="Phone" value={f.phone} onChange={(v) => setF({ ...f, phone: v })} />
        </div>
        <ProvinceDistrictSelect
          province={f.province}
          district={f.district}
          onProvinceChange={(v) => setF({ ...f, province: v })}
          onDistrictChange={(v) => setF({ ...f, district: v })}
        />
        <div className="grid grid-cols-2 gap-4">
          <Field label="City / Town" value={f.city} onChange={(v) => setF({ ...f, city: v })} />
          <Field label="Address" value={f.address} onChange={(v) => setF({ ...f, address: v })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FileField label="Replace logo" onChange={setLogo} file={logo} />
          <FileField label="Replace banner" onChange={setBanner} file={banner} />
        </div>
      </Section>

      {/* Bank details */}
      <Section title="Bank details (for online orders)">
        <p className="text-xs text-soft -mt-2">
          Shown to customers ONLY when they order from your shop. Customers pay
          you directly — AndumPola never handles this money.
        </p>
        <div className="grid grid-cols-2 gap-4">
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
