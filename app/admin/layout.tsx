// app/admin/layout.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  // Only admins allowed
  if (profile?.role !== "admin") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="display text-2xl font-bold">Admins only</h1>
        <p className="text-soft mt-2">
          This area is for the AndumPola admin. If that&apos;s you, set your
          role to admin in the database.
        </p>
        <Link href="/" className="text-berry font-medium mt-4 inline-block">
          ← Back to site
        </Link>
      </div>
    );
  }

  const nav = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/shops", label: "Shops" },
    { href: "/admin/subscriptions", label: "Subscriptions" },
    { href: "/admin/categories", label: "Categories" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-56 shrink-0">
          <div className="bg-berry text-white rounded-xl p-4">
            <p className="text-xs text-white/70">AndumPola Admin</p>
            <p className="display font-bold truncate">
              {profile?.full_name || "Admin"}
            </p>
          </div>
          <nav className="mt-4 flex md:flex-col gap-1 overflow-x-auto">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-white hover:text-berry whitespace-nowrap"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4">
            <SignOutButton />
          </div>
        </aside>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
