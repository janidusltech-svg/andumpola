// app/terms/page.tsx
import BackButton from "@/components/BackButton";
export const metadata = { title: "Terms of Service — AndumPola" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-4">
        <BackButton label="Back" fallback="/" />
      </div>
      <h1 className="display text-3xl sm:text-4xl font-bold mb-2">Terms of Service</h1>
      <p className="text-soft mb-8">Last updated: {new Date().getFullYear()}</p>

      <div className="space-y-6 text-sm text-ink leading-relaxed">
        <Section title="1. About AndumPola">
          AndumPola (&ldquo;the platform&rdquo;) is an online marketplace that
          connects clothing shops in Sri Lanka with customers. We provide the
          platform only; we are not a party to any transaction between a shop
          and a customer.
        </Section>

        <Section title="2. We do not handle payments">
          All payments for products are made directly between the customer and
          the shop. AndumPola does not process, hold, guarantee, or refund any
          payment for products. Any dispute over a product, payment, delivery,
          or refund is strictly between the customer and the shop.
        </Section>

        <Section title="3. Shop responsibilities">
          Shops are responsible for the accuracy of their listings, the quality
          and delivery of their products, their own bank details, honouring
          orders, and complying with Sri Lankan law. Shops must not list
          counterfeit, illegal, or prohibited items.
        </Section>

        <Section title="4. Subscriptions">
          Shops receive a free trial period, after which a monthly subscription
          fee applies to keep the shop visible. Subscription fees are paid to
          AndumPola for use of the platform and are separate from product sales.
          Fees are non-refundable except where required by law.
        </Section>

        <Section title="5. Customer responsibilities">
          Customers are responsible for verifying a shop&apos;s details before
          making any payment, and for keeping their own receipts. Because
          payments go directly to shops, customers should exercise normal
          caution when transacting.
        </Section>

        <Section title="6. Account suspension">
          AndumPola may suspend or remove any shop or account that violates
          these terms, receives credible complaints, or harms the platform or
          its users.
        </Section>

        <Section title="7. Limitation of liability">
          AndumPola is provided &ldquo;as is&rdquo;. To the maximum extent
          permitted by law, AndumPola is not liable for any loss arising from
          transactions between shops and customers, including but not limited to
          non-delivery, defective goods, fraud, or payment disputes.
        </Section>

        <Section title="8. Changes">
          We may update these terms from time to time. Continued use of the
          platform means you accept the updated terms.
        </Section>

        <p className="text-soft">
          These terms are a general template and not legal advice. Consider
          having them reviewed by a qualified lawyer before relying on them.
        </p>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="display font-bold text-base mb-1">{title}</h2>
      <p className="text-soft">{children}</p>
    </div>
  );
}
