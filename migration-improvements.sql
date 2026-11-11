-- ============================================================
-- ANDUMPOLA — MIGRATION: Delivery info, sale prices, sold out,
-- shop reports, WhatsApp number clean-up.
-- Safe to run more than once. Run the WHOLE file in Supabase SQL Editor.
-- ============================================================

-- 1) Shop delivery info
alter table public.shops add column if not exists delivery_areas text;
alter table public.shops add column if not exists delivery_fee text;
alter table public.shops add column if not exists cash_on_delivery boolean not null default false;

-- 2) Products: sale price + "sold out" (still visible)
alter table public.products add column if not exists compare_at_price numeric;
alter table public.products add column if not exists sold_out boolean not null default false;

-- 3) Customer reports about shops (only admin reads them, via service role)
create table if not exists public.shop_reports (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  reason text not null,
  details text,
  contact text,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists shop_reports_open_idx
  on public.shop_reports (resolved, created_at desc);
alter table public.shop_reports enable row level security;
-- no policies on purpose: the public can't read or write directly;
-- the website's server inserts reports and the admin page reads them.

-- 4) WhatsApp numbers in international format (0771234567 → 94771234567)
--    so every "Order on WhatsApp" link opens the right chat.
update public.shops
set whatsapp = '94' || substr(regexp_replace(whatsapp, '[^0-9]', '', 'g'), 2)
where regexp_replace(whatsapp, '[^0-9]', '', 'g') ~ '^0[0-9]{9}$';

-- ============================================================
-- DONE.
-- ============================================================
