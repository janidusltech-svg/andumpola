// components/SetupGuide.tsx
import Link from "next/link";

const STEPS = [
  {
    n: 1,
    title: "Complete your shop profile",
    body: "Add a clear logo, a banner, your city, province and district, and a short description. Shops with a logo and banner look far more trustworthy and get more customers.",
    link: { href: "/dashboard/settings", label: "Edit shop settings" },
  },
  {
    n: 2,
    title: "Add your products",
    body: "Add each product with good photos (natural light, plain background works best), a clear title, the correct category, price, and available sizes with stock. The first photo is the main image customers see.",
    link: { href: "/dashboard/products/new", label: "Add a product" },
  },
  {
    n: 3,
    title: "Choose how customers buy",
    body: "By default, customers reach you via WhatsApp and Call buttons on every product. If you want customers to order and pay online, add your bank details in settings and turn on 'Enable online orders'.",
    link: { href: "/dashboard/settings", label: "Set up online orders" },
  },
  {
    n: 4,
    title: "Share your shop link",
    body: "Your shop has its own web address. Share it on WhatsApp, Facebook, and Instagram so customers can find you. Every product also has its own shareable link.",
    link: null,
  },
  {
    n: 5,
    title: "Manage orders",
    body: "When a customer orders online, it appears in your Orders inbox. Check your bank account for their deposit, then Approve — stock updates automatically. Reject with a note if something's wrong.",
    link: { href: "/dashboard/orders", label: "View orders" },
  },
  {
    n: 6,
    title: "Keep your shop active",
    body: "You get 3 months free. After that, pay your monthly subscription from the Subscription page (deposit + upload receipt) to keep your shop visible to customers.",
    link: { href: "/dashboard/subscription", label: "View subscription" },
  },
];

export default function SetupGuide({ compact = false }: { compact?: boolean }) {
  return (
    <div className="space-y-3">
      {!compact && (
        <p className="text-soft">
          Follow these steps to get your shop ready for customers. You can come
          back to this guide anytime from the dashboard.
        </p>
      )}
      {STEPS.map((s) => (
        <div
          key={s.n}
          className="rounded-xl bg-white border border-line p-5 flex gap-4"
        >
          <div className="h-8 w-8 shrink-0 rounded-full bg-berry text-white flex items-center justify-center font-bold display">
            {s.n}
          </div>
          <div className="min-w-0">
            <h3 className="display font-bold">{s.title}</h3>
            <p className="text-sm text-soft mt-1">{s.body}</p>
            {s.link && (
              <Link
                href={s.link.href}
                className="inline-block mt-2 text-sm font-medium text-berry hover:underline"
              >
                {s.link.label} →
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
