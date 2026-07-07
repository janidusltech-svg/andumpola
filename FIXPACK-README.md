# AndumPola — Pre-flight Fix Pack (run before final testing)

## What's fixed
1. **Reserved slugs** — shops can no longer name themselves "search",
   "admin", "shops" etc. and break routing (CreateShopForm validates).
2. **Password reset** — "Forgot password?" on both logins →
   /forgot-password (sends email) → /reset-password (sets new one, then
   routes customer→saved, owner→dashboard).
3. **Mobile nav** — Shops + Search now visible on phones; the header
   button shortens to "Sell" on small screens.
4. **SEO** — every shop page and product page now has its own title,
   description, and social-share image (shop logo / product photo).
   Root metadata upgraded with metadataBase + OpenGraph defaults.
5. **Custom 404 + error pages** — branded "This rack is empty" (404) and
   "Something got tangled" (error) pages instead of ugly defaults.
6. **Loading skeletons** — homepage, shop pages, search, dashboard show
   pulse skeletons instead of a frozen screen on slow connections.
7. **Favicon + og-image** — browser tab icon (berry price tag) and a
   1200x630 share image that appears when AndumPola links are shared on
   WhatsApp/Facebook.

## Files
New:
- app/forgot-password/page.tsx
- app/reset-password/page.tsx
- app/not-found.tsx, app/error.tsx
- app/loading.tsx, app/search/loading.tsx, app/dashboard/loading.tsx,
  app/[shopSlug]/loading.tsx
- app/icon.svg, app/opengraph-image.png
Replaced:
- components/CreateShopForm.tsx (reserved slugs)
- components/SiteHeader.tsx (mobile nav)
- app/layout.tsx (metadata)
- app/login/page.tsx, app/account/login/page.tsx (forgot links)
- app/[shopSlug]/page.tsx, app/[shopSlug]/[productId]/page.tsx (SEO)

## One Supabase setting for password reset
Supabase → Authentication → URL Configuration:
- Site URL: http://localhost:3000 (change to your domain at deploy)
- Redirect URLs: add http://localhost:3000/reset-password
(At deploy, also add https://yourdomain/reset-password)

## After copying
npm run dev → then run the full BUILD5 test checklist, plus:
- [ ] Try creating a shop named "Search" → blocked with message
- [ ] Login page → Forgot password → email arrives → link opens
      /reset-password → new password works
- [ ] Open site on phone width → Shops/Search visible in header
- [ ] Visit a wrong URL like /xyz-nothing → branded 404
- [ ] Share a product link to yourself on WhatsApp → preview shows
      product image + title (works properly once deployed with real URL)
