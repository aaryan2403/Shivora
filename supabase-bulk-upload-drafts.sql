-- Shivora bulk-upload foundation. REVIEW before applying to Supabase.
-- Existing products and storefront behavior remain unchanged until the app adopts these tables.
create table if not exists public.product_drafts (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id),
  name text not null default '',
  description text not null default '',
  material text not null default 'Anti-tarnish',
  price_cad numeric(12,2) check (price_cad is null or price_cad >= 0),
  stock integer not null default 1 check (stock >= 0),
  image_paths text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft','publishing','published')),
  published_product_id integer references public.products(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.product_draft_collections (
  draft_id uuid not null references public.product_drafts(id) on delete cascade,
  collection_id integer not null references public.collections(id) on delete cascade,
  primary key (draft_id,collection_id)
);
create table if not exists public.product_collections (
  product_id integer not null references public.products(id) on delete cascade,
  collection_id integer not null references public.collections(id) on delete cascade,
  primary key (product_id,collection_id)
);
create index if not exists product_drafts_created_by_idx on public.product_drafts(created_by);
create index if not exists product_drafts_status_idx on public.product_drafts(status);
alter table public.product_drafts enable row level security;
alter table public.product_draft_collections enable row level security;
alter table public.product_collections enable row level security;
drop policy if exists "Admin manage product drafts" on public.product_drafts;
create policy "Admin manage product drafts" on public.product_drafts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admin manage draft collections" on public.product_draft_collections;
create policy "Admin manage draft collections" on public.product_draft_collections for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Public read published product collections" on public.product_collections;
create policy "Public read published product collections" on public.product_collections for select to anon,authenticated using (true);
drop policy if exists "Admin manage product collections" on public.product_collections;
create policy "Admin manage product collections" on public.product_collections for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
-- Backfill existing product-to-collection associations without removing the legacy collection column.
insert into public.product_collections (product_id,collection_id)
select p.id,c.id from public.products p join public.collections c on lower(trim(p.collection))=lower(trim(c.name))
where p.collection is not null on conflict do nothing;
