-- ============================================================
-- ANDUMPOLA — MIGRATION: New plans (Basic / Pro / Ultra),
-- product limits, auto-close after expiry.
-- Includes migration-admin.sql, so it's fine if you skipped that.
-- Safe to run more than once. Run the WHOLE file in Supabase SQL Editor.
-- ============================================================

-- ---------- 0) admin bits (60-day trial, manual payments) ----------
alter table public.shops
  alter column trial_ends_at set default (now() + interval '60 days');
alter table public.subscription_payments
  alter column receipt_url drop not null;
alter table public.subscription_payments
  add column if not exists method text not null default 'receipt';

-- ---------- 1) allow 'ultra' plan + 'expired' shop status ----------
do $$
declare r record;
begin
  -- drop old CHECK constraints on shops.plan / shops.status / payments.plan
  for r in
    select conrelid::regclass::text as tbl, conname
    from pg_constraint
    where contype = 'c'
      and conrelid in ('public.shops'::regclass, 'public.subscription_payments'::regclass)
      and (pg_get_constraintdef(oid) ilike '%plan%'
           or (conrelid = 'public.shops'::regclass and pg_get_constraintdef(oid) ilike '%status%'))
  loop
    execute format('alter table %s drop constraint %I', r.tbl, r.conname);
  end loop;
end $$;

alter table public.shops
  add constraint shops_plan_check check (plan in ('trial','basic','pro','ultra'));
alter table public.shops
  add constraint shops_status_check check (status in ('pending','active','suspended','expired'));
alter table public.subscription_payments
  add constraint subscription_payments_plan_check check (plan in ('basic','pro','ultra'));

-- ---------- 2) product limit per plan (enforced in the database) ----------
create or replace function public.shop_product_limit(p_plan text)
returns int language sql immutable as $$
  select case p_plan
    when 'basic' then 30
    when 'pro'   then 150
    when 'trial' then 150      -- trial = Pro access
    else null                  -- ultra = unlimited
  end;
$$;

create or replace function public.enforce_product_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_plan text; v_status text; v_limit int; v_count int;
begin
  select plan, status into v_plan, v_status from shops where id = new.shop_id;
  if v_status = 'expired' then
    raise exception 'Your plan has ended. Renew it to add products.';
  end if;
  v_limit := shop_product_limit(v_plan);
  if v_limit is not null then
    select count(*) into v_count from products where shop_id = new.shop_id;
    if v_count >= v_limit then
      raise exception 'Your plan allows % products. Upgrade to add more.', v_limit;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_product_limit on public.products;
create trigger trg_product_limit
  before insert on public.products
  for each row execute function public.enforce_product_limit();

-- ---------- 3) auto-close shops 7 days after their plan ends ----------
create or replace function public.close_lapsed_shops()
returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  update shops set status = 'expired', updated_at = now()
  where status = 'active'
    and (
      (plan = 'trial' and trial_ends_at < now() - interval '7 days')
      or (plan <> 'trial' and coalesce(subscription_ends_at, '-infinity') < now() - interval '7 days')
    );
  get diagnostics n = row_count;
  return n;
end $$;

-- run it every hour (Supabase includes pg_cron)
create extension if not exists pg_cron;
do $$
begin
  perform cron.unschedule('andumpola-close-lapsed-shops');
exception when others then null;
end $$;
select cron.schedule('andumpola-close-lapsed-shops', '7 * * * *',
                     $$select public.close_lapsed_shops();$$);

-- ---------- 4) (optional) see what would close right now ----------
-- select name, plan, trial_ends_at, subscription_ends_at from shops
-- where status='active' and ((plan='trial' and trial_ends_at < now()-interval '7 days')
--   or (plan<>'trial' and coalesce(subscription_ends_at,'-infinity') < now()-interval '7 days'));

-- ============================================================
-- DONE.
-- ============================================================
