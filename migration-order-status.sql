-- ============================================================
-- ANDUMPOLA — MIGRATION: Detailed order status + notes
-- Run in Supabase SQL Editor. Safe/additive.
-- ============================================================

-- 1) Allow the new statuses (drop any old status check, add the new one)
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.orders'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%status%'
  loop
    execute format('alter table public.orders drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.orders
  add constraint orders_status_check
  check (status in ('pending','approved','processing','shipped','delivered','rejected','cancelled'));

-- 2) Private notes for the shop owner + last update time
alter table public.orders add column if not exists owner_notes text;
alter table public.orders add column if not exists status_updated_at timestamptz;

-- Owners can already update their orders (RLS); make sure the new columns are writable
grant update (status, shop_note, owner_notes, status_updated_at) on public.orders to authenticated;

-- ============================================================
-- DONE.
-- ============================================================
