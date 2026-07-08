// app/contact/page.tsx
import Link from "next/link";

export const metadata = { title: "Contact — AndumPola" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="display text-3xl sm:text-4xl font-bold mb-2">Contact us</h1>
      <p className="text-soft mb-8">
        Questions, feedback, or need help with your shop? Reach out.
      </p>

      <div className="space-y-4">
        <div className="rounded-xl bg-white border border-line p-6">
          <p className="text-sm text-soft">Email</p>
          <a
            href="mailto:hello@andumpola.lk"
            className="display text-lg font-bold text-berry"
          >
            hello@andumpola.lk
          </a>
        </div>

        <div className="rounded-xl bg-white border border-line p-6">
          <p className="text-sm text-soft">WhatsApp</p>
          <a
            href="https://wa.me/94770000000"
            target="_blank"
            rel="noopener noreferrer"
            className="display text-lg font-bold text-leaf"
          >
            Chat on WhatsApp
          </a>
          <p className="text-xs text-soft mt-1">
            Replace with your real support number.
          </p>
        </div>

        <div className="rounded-xl bg-berry/5 border border-berry/20 p-6">
          <p className="font-semibold">Are you a shop owner?</p>
          <p className="text-sm text-soft mt-1 mb-3">
            Get started in minutes — free for your first 3 months.
          </p>
          <Link
            href="/signup"
            className="inline-block rounded-lg bg-berry text-white font-semibold px-5 py-2.5"
          >
            Open your shop
          </Link>
        </div>
      </div>
    </div>
  );
}
