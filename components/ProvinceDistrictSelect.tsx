"use client";
// components/ProvinceDistrictSelect.tsx
import { PROVINCES, districtsForProvince } from "@/lib/lk-locations";

export default function ProvinceDistrictSelect({
  province,
  district,
  onProvinceChange,
  onDistrictChange,
}: {
  province: string;
  district: string;
  onProvinceChange: (v: string) => void;
  onDistrictChange: (v: string) => void;
}) {
  const districts = districtsForProvince(province);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <label className="block">
        <span className="text-sm font-medium">Province</span>
        <select
          value={province}
          onChange={(e) => {
            onProvinceChange(e.target.value);
            onDistrictChange(""); // clear district; user picks a new one
          }}
          className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 bg-white outline-none focus:ring-2 focus:ring-berry/40"
        >
          <option value="">Select province</option>
          {PROVINCES.map((p) => (
            <option key={p.slug} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-medium">District</span>
        <select
          value={district}
          onChange={(e) => onDistrictChange(e.target.value)}
          disabled={!province}
          className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 bg-white outline-none focus:ring-2 focus:ring-berry/40 disabled:bg-line/30"
        >
          <option value="">
            {province ? "Select district" : "Pick province first"}
          </option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
