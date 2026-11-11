// lib/wa-templates.ts — ready-made WhatsApp messages you send to shop owners
const SITE = "https://www.andumpola.lk";

export function welcomeMsg(o: {
  shopName: string;
  slug: string;
  email?: string;
  password?: string;
}) {
  return [
    `Welcome to AndumPola, ${o.shopName}! 🎉`,
    ``,
    `Your shop page: ${SITE}/${o.slug}`,
    `Share this link on WhatsApp, Facebook and your Status — it's your own website.`,
    ``,
    ...(o.email && o.password
      ? [
          `Log in to add products:`,
          `${SITE}/login`,
          o.email.endsWith("@owners.andumpola.lk")
            ? `Phone number: 0${o.email.split("@")[0].replace(/^94/, "")}`
            : `Email: ${o.email}`,
          `Password: ${o.password}`,
          `(Please keep this safe.)`,
          ``,
        ]
      : []),
    `✅ 60 days FREE · full Pro access`,
    `Need help? Just reply here.`,
  ].join("\n");
}

export function howToAddProductsMsg(shopName: string) {
  return [
    `Hi ${shopName} 👋 Adding products takes 1 minute:`,
    ``,
    `1️⃣ Open ${SITE}/dashboard and log in`,
    `2️⃣ Tap *Products → + Add product*`,
    `3️⃣ Add a clear photo (good light, plain background)`,
    `4️⃣ Name, price, sizes & stock → *Save*`,
    ``,
    `Tip: same item in another colour? Tap *Duplicate* and just change the photo.`,
    `Shops with 10+ products get many more orders. 🙌`,
  ].join("\n");
}

export function shareTipsMsg(shopName: string, slug: string) {
  return [
    `Hi ${shopName}! 3 easy ways to get orders from your AndumPola page:`,
    ``,
    `📲 Put your link on your WhatsApp Status: ${SITE}/${slug}`,
    `📘 Add it to your Facebook page "Website" field`,
    `🧾 Stick the QR poster at your counter: ${SITE}/print/${slug}`,
    ``,
    `Customers order straight to your WhatsApp — no commission.`,
  ].join("\n");
}

export function waLink(phone: string, text: string) {
  const d = phone.replace(/\D/g, "");
  const n = d.startsWith("0") ? `94${d.slice(1)}` : d;
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
}
