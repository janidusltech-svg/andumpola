// components/ContactButtons.tsx
import { formatLKR } from "@/lib/types";

export default function ContactButtons({
  whatsapp,
  phone,
  productTitle,
  price,
  productUrl,
}: {
  whatsapp: string;
  phone: string;
  productTitle: string;
  price: number;
  productUrl: string;
}) {
  const msg = encodeURIComponent(
    `Hi! I saw "${productTitle}" (${formatLKR(
      price
    )}) on AndumPola. Is it available?\n${productUrl}`
  );
  const wa = whatsapp.replace(/[^0-9]/g, "");

  return (
    <div className="grid grid-cols-2 gap-3">
      <a
        href={`https://wa.me/${wa}?text=${msg}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-lg bg-leaf text-white font-semibold py-3 hover:opacity-90"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.2 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.9-1.2-4.7-4.1-4.9-4.3-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5s.8 1.9.8 2c.1.1.1.3 0 .5l-.4.6c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1.1 2.2 1.4 2.5 1.5.3.2.5.1.7-.1l.7-.9c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.1.1.7-.1 1.3Z" />
        </svg>
        WhatsApp
      </a>
      <a
        href={`tel:${phone}`}
        className="flex items-center justify-center gap-2 rounded-lg border-2 border-berry text-berry font-semibold py-3 hover:bg-berry hover:text-white"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
          <path d="M6.6 10.8a15.6 15.6 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.2.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.3 1l-2.2 2.2Z" />
        </svg>
        Call shop
      </a>
    </div>
  );
}
