-- ============================================================
-- ANDUMPOLA — MIGRATION: Shop analytics (page view tracking)
-- Counts shop page + product page views so owners see their numbers.
-- Anonymous — no personal data is stored. Run in Supabase SQL Editor.
-- ============================================================

create table if not exists public.shop_views (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists shop_views_shop_idx
  on public.shop_views(shop_id, created_at desc);

alter table public.shop_views enable row level security;

-- Shop owners can read only their own shop's views
drop policy if exists "owner reads own views" on public.shop_views;
create policy "owner reads own views" on public.shop_views
  for select
  using (
    exists (
      select 1 from public.shops s
      where s.id = shop_views.shop_id and s.owner_id = auth.uid()
    )
  );

grant select on public.shop_views to authenticated;
-- Inserts happen via the server (service role) through /api/views,
-- which validates input — so no public insert policy is needed.

-- ============================================================
-- DONE.
-- ============================================================
