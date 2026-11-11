// app/admin/shops/new/page.tsx — create a shop for an owner while you're with them
import Link from "next/link";
import AssistedSignupForm from "@/components/admin/AssistedSignupForm";

export default function NewShopPage() {
  return (
    <div className="max-w-xl">
      <Link href="/admin/shops" className="text-sm text-soft hover:text-berry">
        ← All shops
      </Link>
      <h1 className="display text-2xl font-bold mt-2">Sign up a shop</h1>
      <p className="text-sm text-soft mb-5">
        Use this when you visit a shop. It creates their login and their shop
        page in one go (live straight away, 60-day free trial). Then send them
        the welcome message.
      </p>
      <AssistedSignupForm />
    </div>
  );
}
