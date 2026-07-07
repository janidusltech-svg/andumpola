// app/faq/page.tsx
export const metadata = { title: "FAQ — AndumPola" };

const FAQS = [
  {
    q: "What is AndumPola?",
    a: "AndumPola is Sri Lanka's online clothing market. Clothing shops open a virtual shop, add their products, and customers browse and connect with them directly.",
  },
  {
    q: "Is it free for customers?",
    a: "Yes — browsing, searching, and saving products is completely free. You only need an account if you want to save favourites for later.",
  },
  {
    q: "How much does it cost for shops?",
    a: "Shops get 3 months free. After that, Basic is LKR 1,000/month (up to 150 products) and Pro is LKR 2,000/month (unlimited products).",
  },
  {
    q: "How do payments work?",
    a: "Payments happen directly between the customer and the shop — by bank transfer, WhatsApp arrangement, or cash. AndumPola never handles or holds any money. We only connect buyers and sellers.",
  },
  {
    q: "How do I pay for my subscription?",
    a: "From your dashboard, choose a plan, deposit to the AndumPola bank account shown, and upload your receipt. Your shop is activated once we verify it.",
  },
  {
    q: "How do customers contact a shop?",
    a: "Every product has WhatsApp and Call buttons that reach the shop directly. Some shops also enable online ordering, where you pay the shop directly and upload your receipt.",
  },
  {
    q: "Is my payment safe when I order online?",
    a: "You pay the shop directly into their bank account — AndumPola does not process the payment. Always check the shop's details and keep your deposit receipt. Contact the shop directly with any questions about your order.",
  },
  {
    q: "How do I track my order?",
    a: "Use the 'Track your order' link and enter your order reference and the phone number you used. You'll see the current status.",
  },
  {
    q: "Can I sell things other than clothes?",
    a: "AndumPola is focused on clothing and fashion — frocks, sarees, shirts, footwear, bags and accessories. This focus helps customers find what they're looking for.",
  },
];

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="display text-4xl font-bold mb-2">
        Frequently asked questions
      </h1>
      <p className="text-soft mb-8">Everything you need to know about AndumPola.</p>

      <div className="space-y-3">
        {FAQS.map((item, i) => (
          <details
            key={i}
            className="group rounded-xl bg-white border border-line p-5"
          >
            <summary className="flex items-center justify-between cursor-pointer font-semibold list-none">
              {item.q}
              <span className="text-berry group-open:rotate-45 transition-transform text-xl leading-none">
                +
              </span>
            </summary>
            <p className="text-soft text-sm mt-3">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
