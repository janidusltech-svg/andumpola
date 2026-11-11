# AndumPola — launch checklist

## 1. Database
- [ ] Run `migration-plans.sql` (if not done)
- [ ] Run `migration-improvements.sql`
- [ ] Run `launch-cleanup.sql` — STEP 1, read numbers, then STEP 2
- [ ] Check stock of products you test-ordered (approved test orders reduced stock)

## 2. Supabase → Authentication → URL Configuration
- [ ] Site URL: `https://www.andumpola.lk`
- [ ] Redirect URLs: `https://www.andumpola.lk/**` and `https://andumpola.lk/**`
- [ ] Authentication → Providers → Email: **Confirm email ON**
- [ ] Authentication → Users: delete test customer / owner accounts you don't need

## 3. Google sign-in (Google Cloud Console)
- [ ] APIs & Services → OAuth consent screen → **Publish app** (status "In production")
- [ ] Authorised redirect URI is your Supabase callback (already set if Google login works)

## 4. Vercel
- [ ] Push works (auto deploy) — Deployments shows "Ready"
- [ ] Analytics tab → Enable
- [ ] Env var `NEXT_PUBLIC_SITE_URL = https://www.andumpola.lk`

## 5. Safety
- [ ] uptimerobot.com → HTTP monitor for `https://www.andumpola.lk` (email alert)
- [ ] Weekly backup: `npx supabase db dump -f backup.sql --db-url "<your DB connection string>"`
      (or Supabase Pro when shops pay — daily backups, never pauses)
- [ ] Make GitHub repo private (after auto-deploy works)

## 6. Test on your phone (real flow)
- [ ] Admin → Shops → **+ Sign up a shop** → create a test shop
- [ ] Log in as it **with the phone number** + password
- [ ] Add 2 products (one with sale price), set delivery info
- [ ] Open product as a customer → Order on WhatsApp → message opens with details
- [ ] Bank order → upload slip → owner sees it → change status → customer WhatsApp
- [ ] Owner → Subscription → upload payment → Admin approves → days go up
- [ ] Language switch EN / සිං / தமி
- [ ] /join and /print/<slug> look right; print one poster
- [ ] Delete the test shop afterwards (Admin → shop → or SQL)

## Onboarding a shop (at the counter, ~5 min)
1. Show `andumpola.lk/join` on your phone
2. Admin → Shops → **+ Sign up a shop** (name, phone, town)
3. Tap **Send welcome + login on WhatsApp**
4. Help add 3–5 products with their phone
5. Print / send the **counter poster** (`/print/<slug>`)
6. Next day: send **"How to add products"** and **"Get more orders"** from the shop's admin page
