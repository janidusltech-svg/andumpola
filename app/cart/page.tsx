// app/cart/page.tsx
import CartView from "@/components/CartView";
import BackButton from "@/components/BackButton";

export const metadata = { title: "Your cart — AndumPola" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <div className="mb-3">
        <BackButton label="Back" fallback="/" />
      </div>
      <h1 className="display text-2xl sm:text-3xl font-bold mb-1">Your cart</h1>
      <p className="text-sm text-soft mb-6">
        Each shop gets one WhatsApp message with everything you picked. The shop
        confirms price, delivery and payment with you.
      </p>
      <CartView />
    </div>
  );
}
