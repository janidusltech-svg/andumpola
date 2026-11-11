-- ANDUMPOLA — WhatsApp order status. Run in Supabase SQL Editor.
alter table public.leads add column if not exists status text not null default 'new';

drop policy if exists "owner updates own leads" on public.leads;
create policy "owner updates own leads" on public.leads
  for update
  using (exists (select 1 from public.shops s where s.id = leads.shop_id and s.owner_id = auth.uid()))
  with check (exists (select 1 from public.shops s where s.id = leads.shop_id and s.owner_id = auth.uid()));

grant update (status) on public.leads to authenticated;
