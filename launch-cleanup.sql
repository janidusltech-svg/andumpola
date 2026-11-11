-- ============================================================
-- ANDUMPOLA — LAUNCH CLEAN-UP
-- Removes TEST activity, keeps your real shops + their products.
-- Run STEP 1 first and read the numbers. Then run STEP 2.
-- ============================================================

-- ---------- STEP 1: preview (changes nothing) ----------
select 'shops'                 as what, count(*) from shops
union all select 'products',             count(*) from products
union all select 'bank orders',          count(*) from orders
union all select 'whatsapp order clicks',count(*) from leads
union all select 'page views',           count(*) from shop_views
union all select 'subscription payments',count(*) from subscription_payments
union all select 'reviews',              count(*) from reviews;

-- ---------- STEP 2: clean up (permanent) ----------
-- Delete any block you want to KEEP before running.
begin;

-- test bank orders (and their items table, if you have one)
do $$ begin
  if to_regclass('public.order_items') is not null then
    execute 'delete from public.order_items';
  end if;
end $$;
delete from orders;

-- analytics back to zero (your own test clicks & views)
delete from leads;
delete from shop_views;

-- test subscription payments
delete from subscription_payments;

-- test reviews (remove this line if any reviews are real)
delete from reviews;

-- everyone starts a fresh 60-day free trial from launch day
update shops
set plan = 'trial',
    trial_ends_at = now() + interval '60 days',
    subscription_ends_at = null,
    status = case when status = 'expired' then 'active' else status end;

commit;

-- ---------- STEP 3: check ----------
select name, status, plan, trial_ends_at from shops order by created_at;
