# AndumPola — Build 4: Admin Panel (your control center)

No more SQL. Everything is buttons now.

## What's included (`/admin`)
- **Overview** — live stats: total/active/pending shops, total products,
  pending payments, approved revenue. Shows alerts when things need action.
- **Shops** — every shop with filter tabs (All / Pending / Active /
  Suspended). One click to **Approve**, **Suspend**, or **Un-suspend**.
  Suspended shops instantly disappear from customers.
- **Subscriptions** — every subscription payment. **View the deposit
  receipt** (secure signed URL), then **Approve** or **Reject**. Approving
  auto-extends the shop's plan + expiry (DB trigger does it).
- **Categories** — add or remove clothing categories. New ones instantly
  appear in shops' product dropdown and site filters.

All admin actions are protected server-side — only a profile with
role = 'admin' can run them, even if someone finds the URLs.

## Files to copy into your project
- `app/admin/` — the whole folder (layout, page, shops, subscriptions,
  categories, actions.ts)
- `components/admin/` — the whole folder (4 components)

Nothing else changes. Your middleware already guards `/admin`.

## One-time setup: make yourself admin
1. Supabase → Authentication → Users → copy YOUR user's UID
2. Supabase → SQL Editor:
   `update public.profiles set role = 'admin' where id = 'YOUR-UUID';`
   (This is the LAST time you need SQL for admin work.)

## Use it
1. `npm run dev`
2. Go to `http://localhost:3000/admin`
3. If you see "Admins only", you haven't set your role yet — do the step
   above, refresh.
4. Overview shows JP Fashion waiting → click **Shops** → **Approve**.
   Done — it's live, no SQL.
5. Test subscription: as a shop owner, submit a payment receipt in
   `/dashboard/subscription`, then here in **Subscriptions** click
   **Approve** → the shop's plan updates automatically.

## Tip — bookmark it
There's no admin link in the public header (keeps the site fast for
customers). Just bookmark `http://localhost:3000/admin` (and later
`https://andumpola.lk/admin`).

## What's left
- **Build 3** — customer online-order flow (order form on product pages,
  shop bank details shown to customer, receipt upload, order status check).
  After that, AndumPola is feature-complete for launch.
