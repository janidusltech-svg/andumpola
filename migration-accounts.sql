-- ============================================================
-- ANDUMPOLA — MIGRATION: Customer accounts ("My orders")
-- Links orders & WhatsApp orders to the logged-in customer so they
-- can see them in their Account page. Safe to run more than once.
-- ============================================================

alter table public.orders add column if not exists customer_id uuid
  references auth.users(id) on delete set null;
alter table public.leads add column if not exists customer_id uuid
  references auth.users(id) on delete set null;

create index if not exists orders_customer_idx on public.orders (customer_id, created_at desc);
create index if not exists leads_customer_idx on public.leads (customer_id, created_at desc);

-- customers can read their own orders (shop owners' existing access is unchanged)
drop policy if exists "customer reads own orders" on public.orders;
create policy "customer reads own orders" on public.orders
  for select to authenticated using (customer_id = auth.uid());

drop policy if exists "customer reads own leads" on public.leads;
create policy "customer reads own leads" on public.leads
  for select to authenticated using (customer_id = auth.uid());

-- ============================================================
-- DONE.
-- ============================================================
