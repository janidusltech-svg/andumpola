// app/privacy/page.tsx
export const metadata = { title: "Privacy Policy — AndumPola" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="display text-3xl sm:text-4xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-soft mb-8">Last updated: {new Date().getFullYear()}</p>

      <div className="space-y-6 text-sm text-ink leading-relaxed">
        <Section title="1. Information we collect">
          For shops: your name, email, phone, WhatsApp number, shop details, and
          bank details you choose to add. For customers: your name, email, and
          products you save. For orders: the name, phone, and delivery address
          you provide, and the receipt you upload.
        </Section>

        <Section title="2. How we use it">
          We use your information to operate the platform: to show shops and
          products, to connect customers with shops, to process subscriptions,
          and to let shops fulfil orders. Shop bank details are shown to
          customers only for that shop&apos;s own orders.
        </Section>

        <Section title="3. What we share">
          When you place an order, your order details are shared with that shop
          so they can fulfil it. We do not sell your personal information to
          third parties. We use trusted service providers (such as hosting and
          database services) to run the platform.
        </Section>

        <Section title="4. Receipts and payments">
          Payment receipts you upload are stored securely and are visible only
          to the relevant shop (for product orders) or to AndumPola admin (for
          subscription payments). AndumPola does not store card numbers or
          banking passwords.
        </Section>

        <Section title="5. Your choices">
          You can edit or remove your saved products at any time, and update
          your shop or account details from your dashboard. To delete your
          account entirely, contact us.
        </Section>

        <Section title="6. Security">
          We take reasonable measures to protect your data. However, no online
          service is completely secure, and you share information at your own
          risk.
        </Section>

        <Section title="7. Contact">
          For any privacy questions, contact hello@andumpola.lk.
        </Section>

        <p className="text-soft">
          This policy is a general template and not legal advice. Consider
          having it reviewed by a qualified lawyer.
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
