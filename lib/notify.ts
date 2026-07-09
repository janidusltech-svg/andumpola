// lib/notify.ts
// Sends order notification emails to shop owners via Resend.
// Requires env var: RESEND_API_KEY  (get one free at resend.com)
// Optional: NOTIFY_FROM (defaults to Resend's onboarding sender until you
// verify your domain in Resend, then use e.g. "AndumPola <orders@andumpola.lk>")

type OrderEmailData = {
  toEmail: string;
  shopName: string;
  orderRef: string;
  productTitle: string;
  size: string;
  quantity: number;
  total: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
};

export async function sendOrderNotification(data: OrderEmailData) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log("RESEND_API_KEY not set — skipping order email");
    return;
  }

  const from = process.env.NOTIFY_FROM || "AndumPola <onboarding@resend.dev>";
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://andumpola.lk";

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto">
    <h2 style="color:#C4265E">🛍️ New order on AndumPola!</h2>
    <p>Your shop <strong>${esc(data.shopName)}</strong> received a new order.</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="padding:6px 0;color:#666">Order ref</td><td style="font-weight:bold">${esc(data.orderRef)}</td></tr>
      <tr><td style="padding:6px 0;color:#666">Product</td><td>${esc(data.productTitle)}</td></tr>
      <tr><td style="padding:6px 0;color:#666">Size / Qty</td><td>${esc(data.size)} × ${data.quantity}</td></tr>
      <tr><td style="padding:6px 0;color:#666">Total</td><td style="font-weight:bold">${esc(data.total)}</td></tr>
      <tr><td style="padding:6px 0;color:#666">Customer</td><td>${esc(data.customerName)}</td></tr>
      <tr><td style="padding:6px 0;color:#666">Phone</td><td><a href="tel:${esc(data.customerPhone)}">${esc(data.customerPhone)}</a></td></tr>
      <tr><td style="padding:6px 0;color:#666">Address</td><td>${esc(data.customerAddress)}</td></tr>
    </table>
    <p style="margin-top:16px">
      <a href="${site}/dashboard/orders"
         style="background:#C4265E;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold">
        Open your orders inbox
      </a>
    </p>
    <p style="color:#666;font-size:13px;margin-top:14px">
      Check your bank account for the customer's deposit, then approve or
      reject the order from your dashboard. Stock updates automatically
      when you approve.
    </p>
    <hr style="border:none;border-top:1px solid #eee;margin:18px 0">
    <p style="color:#999;font-size:12px">AndumPola — Sri Lanka's online clothing market · ${site}</p>
  </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [data.toEmail],
        subject: `🛍️ New order ${data.orderRef} — ${data.productTitle}`,
        html,
      }),
    });
    if (!res.ok) {
      console.error("Resend error:", res.status, await res.text());
    }
  } catch (e) {
    console.error("Order email failed:", e);
  }
}

function esc(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
