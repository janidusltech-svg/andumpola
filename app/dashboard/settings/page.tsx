// app/dashboard/settings/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Shop } from "@/lib/types";
import ShopSettingsForm from "@/components/ShopSettingsForm";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: shop } = await supabase
    .from("shops")
    .select("*")
    .eq("owner_id", user!.id)
    .maybeSingle();

  if (!shop) redirect("/dashboard");

  return (
    <div>
      <h1 className="display text-2xl font-bold mb-6">Shop settings</h1>
      <ShopSettingsForm shop={shop as Shop} />
    </div>
  );
}
