-- ============================================================
-- ANDUMPOLA — MIGRATION: Admin tools (trial control, manual payments)
-- Run in Supabase SQL Editor. Safe/additive.
-- ============================================================

-- 1) New shops get a 60-day free trial (was 90)
alter table public.shops
  alter column trial_ends_at set default (now() + interval '60 days');

-- 2) Manual payments (cash / in-person) don't have a receipt image
alter table public.subscription_payments
  alter column receipt_url drop not null;

alter table public.subscription_payments
  add column if not exists method text not null default 'receipt';

-- ============================================================
-- DONE.
-- ============================================================
