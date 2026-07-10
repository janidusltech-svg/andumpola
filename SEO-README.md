# AndumPola — SEO Setup (get found on Google)

## What these files do
- app/sitemap.ts  → auto-generates andumpola.lk/sitemap.xml listing every
  page + every active shop, so Google can find and index them all.
- app/robots.ts   → andumpola.lk/robots.txt telling search engines they
  can crawl the site (but not private dashboard/admin/account pages), and
  pointing them to the sitemap.
- app/layout.tsx  → description updated to mention clothing + furniture +
  electronics.

## Files
New:
- app/sitemap.ts
- app/robots.ts
Replaced:
- app/layout.tsx (description)

## After you deploy, CHECK these URLs work:
- https://andumpola.lk/sitemap.xml   (should list your pages + shops)
- https://andumpola.lk/robots.txt    (should show the rules + sitemap line)

============================================================
## MANUAL STEPS YOU MUST DO (I can't do these for you)
============================================================

### 1. Google Search Console (most important) — free
This is how you tell Google your site exists and submit your sitemap.
1. Go to https://search.google.com/search-console
2. Add property → URL prefix → https://andumpola.lk
3. Verify ownership. Easiest method: "HTML tag" → Google gives you a
   meta tag → OR use the DNS method (add a TXT record in Cloudflare).
   - DNS method: Cloudflare → DNS → add the TXT record Google gives you.
4. Once verified: left menu → Sitemaps → enter "sitemap.xml" → Submit.
5. Google will start indexing over the next days/weeks.

### 2. Request indexing for key pages (speeds it up)
In Search Console → URL Inspection → paste https://andumpola.lk →
"Request indexing". Do this for your homepage and a few shop pages.

### 3. Bing Webmaster Tools (optional, easy) — free
https://www.bing.com/webmasters → add site → import from Google Search
Console (one click). Gets you on Bing too.

============================================================
## THINGS THAT HELP RANKING (over time)
============================================================
- Share your andumpola.lk links on Facebook, WhatsApp, Instagram — links
  and traffic help Google trust the site.
- Each shop's page has its own title/description already (good).
- Real shops with real products = more pages = more chances to rank.
- Ask shop owners to share their shop link — free backlinks.
- Be patient: new sites take a few weeks to months to rank well. There's
  no instant fix; anyone promising #1 overnight is lying.

## Note
Google indexing is NOT automatic or instant. Even with a perfect sitemap,
it takes days to weeks for pages to appear in search. Search Console (step
1) is what actually gets the ball rolling — do that first.
