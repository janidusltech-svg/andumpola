// lib/order-status.ts — one place for order statuses, labels and messages
export type OrderStatusKey =
  | "pending"
  | "approved"
  | "processing"
  | "shipped"
  | "delivered"
  | "rejected"
  | "cancelled";

export const ORDER_STATUS: Record<
  OrderStatusKey,
  { label: string; cls: string; customer: string; emoji: string }
> = {
  pending: {
    label: "New",
    emoji: "🆕",
    cls: "bg-turmeric/20 text-ink",
    customer:
      "The shop is verifying your payment. You'll be confirmed once they check their account.",
  },
  approved: {
    label: "Payment confirmed",
    emoji: "✅",
    cls: "bg-leaf/15 text-leaf",
    customer: "Your payment is confirmed and your order is being prepared. 🎉",
  },
  processing: {
    label: "Packing",
    emoji: "📦",
    cls: "bg-sand text-ink",
    customer: "Your order is being packed.",
  },
  shipped: {
    label: "Out for delivery",
    emoji: "🚚",
    cls: "bg-berry/10 text-berry",
    customer: "Your order is on the way!",
  },
  delivered: {
    label: "Delivered",
    emoji: "🎉",
    cls: "bg-ink/10 text-ink",
    customer: "This order has been delivered. Thank you for shopping! 🛍️",
  },
  rejected: {
    label: "Rejected",
    emoji: "❌",
    cls: "bg-berry/15 text-berry",
    customer:
      "Unfortunately this order was rejected. If you already paid, contact the shop.",
  },
  cancelled: {
    label: "Cancelled",
    emoji: "🚫",
    cls: "bg-berry/15 text-berry",
    customer: "This order was cancelled. Contact the shop if you have questions.",
  },
};

export function statusInfo(s: string) {
  return (
    ORDER_STATUS[s as OrderStatusKey] ?? {
      label: s,
      emoji: "•",
      cls: "bg-line",
      customer: "Status updated.",
    }
  );
}

// Which buttons the shop owner sees for each status
export const NEXT_ACTIONS: Record<string, { to: OrderStatusKey; label: string; tone: "go" | "stop" }[]> = {
  pending: [
    { to: "approved", label: "Confirm payment", tone: "go" },
    { to: "rejected", label: "Reject", tone: "stop" },
  ],
  approved: [
    { to: "processing", label: "Packing", tone: "go" },
    { to: "shipped", label: "Out for delivery", tone: "go" },
    { to: "cancelled", label: "Cancel", tone: "stop" },
  ],
  processing: [
    { to: "shipped", label: "Out for delivery", tone: "go" },
    { to: "cancelled", label: "Cancel", tone: "stop" },
  ],
  shipped: [
    { to: "delivered", label: "Mark delivered", tone: "go" },
    { to: "cancelled", label: "Cancel", tone: "stop" },
  ],
};

// Sri Lankan phone → WhatsApp international format (0771234567 → 94771234567)
export function toWaNumber(phone: string) {
  const d = phone.replace(/[^0-9]/g, "");
  if (d.startsWith("94")) return d;
  if (d.startsWith("0")) return "94" + d.slice(1);
  if (d.length === 9) return "94" + d;
  return d;
}
