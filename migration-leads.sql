-- ============================================================
-- ANDUMPOLA — MIGRATION: WhatsApp order leads (click tracking)
-- Logs each "Order on WhatsApp" click so shop owners can see demand.
-- Run in Supabase SQL Editor. Safe/additive.
-- ============================================================

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_title text,
  size text,
  quantity int not null default 1,
  channel text not null default 'whatsapp',
  created_at timestamptz not null default now()
);

create index if not exists leads_shop_idx on public.leads(shop_id, created_at desc);

alter table public.leads enable row level security;

-- Shop owners can read only their own shop's leads
drop policy if exists "owner reads own leads" on public.leads;
create policy "owner reads own leads" on public.leads
  for select
  using (
    exists (
      select 1 from public.shops s
      where s.id = leads.shop_id and s.owner_id = auth.uid()
    )
  );

grant select on public.leads to authenticated;
-- Inserts are done by the server (service role) via /api/leads, which
-- validates input — so no public insert policy is needed.

-- ============================================================
-- DONE.
-- ============================================================
