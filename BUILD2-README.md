# AndumPola — Build 2: Shop Owner Dashboard

## What's new
- **Signup / Login** (`/signup`, `/login`) — shop owner accounts
- **Dashboard** (`/dashboard`) with sidebar: Overview, Products, Orders,
  Subscription, Shop settings
- **Create shop** — name (auto-slug), description, WhatsApp, phone, city,
  logo + banner upload; starts 90-day trial, pending admin approval
- **Products** — add/edit/delete with multi-photo upload, sizes + stock
  editor, category dropdown (uses your full category list), show/hide toggle
- **Plan limits** — Basic/trial capped at 150 products, Pro unlimited
  (enforced in UI + add-product page)
- **Shop settings** — edit everything, bank details, and the
  **Enable online orders** toggle (blocked until bank account is added)
- **Orders inbox** — approve/reject/deliver; approve auto-deducts stock;
  private receipts opened via signed URLs
- **Subscription** — pick plan + months, see YOUR bank details, upload
  deposit receipt → goes to admin for approval → auto-extends on approval
- Middleware protects `/dashboard` and `/admin`

## Files to copy into your project
Copy/replace these into your Next.js project root:
- `middleware.ts`  (project root — same level as package.json)
- `app/` — replaces layout.tsx + page.tsx, adds login/, signup/, dashboard/
- `components/` — new components (keep the old ones too)
- `lib/` — adds supabase/client.ts, supabase/server.ts, upload.ts

## IMPORTANT — before testing
1. **Set YOUR bank details.** Open `components/SubscriptionForm.tsx`,
   edit the `ADMIN_BANK` object at the top (bank, branch, name, account).
   This is where shop owners deposit subscription money.

2. **Supabase → Authentication → Providers → Email:**
   - Turn OFF "Confirm email" for now (so signup logs in instantly while
     testing). Turn it back ON before real launch.

3. **Storage buckets** already exist if you ran schema.sql
   (shop-assets, product-images = public; receipts = private).
   If you get upload errors, check Supabase → Storage that all 3 exist.

## Test the full flow
1. `npm run dev` → go to `/signup` → create an account
2. You land on `/dashboard` → fill the Create Shop form → submit
3. Shop is "pending". As admin, approve it for now by running in SQL Editor:
   `update public.shops set status = 'active' where slug = 'your-slug';`
   (The proper admin panel is Build 4.)
4. Go to Products → Add product → upload photos, add sizes, save
5. Open your public shop page `/your-slug` → product shows with photos
6. Shop settings → add bank details → enable online orders → Save
7. Subscription → pick a plan → see your bank details → upload any image
   as a test receipt → submit → approve it in SQL:
   `update public.subscription_payments set status='approved'
    where shop_id = (select id from shops where slug='your-slug');`
   → shop plan + expiry auto-updates (trigger).

## Next: Build 3
Customer online-order flow: order form on product page, shop bank details
shown to customer, receipt upload, order status check by ref + phone.

## Next: Build 4
Your admin panel — approve shops, approve subscription receipts, suspend
shops, platform stats — all with buttons instead of SQL.
