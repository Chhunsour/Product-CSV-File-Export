-- Media Vault schema and policies

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('image', 'video')),
  source text not null check (source in ('stored', 'linked')),
  category text,
  label text,
  product_id text,
  product_slug text,
  storage_bucket text,
  storage_path text unique,
  external_url text,
  public_url text,
  short_code text unique,
  short_url text,
  source_hash text unique,
  mime_type text not null,
  ext text not null,
  bytes bigint not null default 0,
  width int,
  height int,
  duration_sec int,
  poster_asset_id uuid references public.media_assets(id) on delete set null,
  alt text,
  title text,
  sort_order int not null default 0,
  is_primary boolean not null default false,
  is_webp boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.media_variants (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.media_assets(id) on delete cascade,
  variant text not null check (variant in ('thumb', 'small', 'medium', 'large', 'webp')),
  storage_path text unique not null,
  public_url text not null,
  width int,
  height int,
  bytes bigint,
  created_at timestamptz default now()
);

drop trigger if exists media_assets_set_updated_at on public.media_assets;

create trigger media_assets_set_updated_at
before update on public.media_assets
for each row execute function public.set_updated_at();

create index if not exists media_assets_kind_idx on public.media_assets(kind);
create index if not exists media_assets_source_idx on public.media_assets(source);
create index if not exists media_assets_category_idx on public.media_assets(category);
create index if not exists media_assets_product_idx on public.media_assets(product_id);
create index if not exists media_assets_product_slug_idx on public.media_assets(product_slug);
create index if not exists media_assets_created_idx on public.media_assets(created_at desc);
create index if not exists media_assets_is_webp_idx on public.media_assets(is_webp);
create index if not exists media_variants_asset_idx on public.media_variants(asset_id);

alter table public.media_assets enable row level security;
alter table public.media_variants enable row level security;

drop policy if exists "media_assets_select" on public.media_assets;
drop policy if exists "media_assets_insert" on public.media_assets;
drop policy if exists "media_assets_update" on public.media_assets;
drop policy if exists "media_assets_delete" on public.media_assets;

create policy "media_assets_select" on public.media_assets
for select using (auth.role() = 'authenticated');

create policy "media_assets_insert" on public.media_assets
for insert with check (auth.role() = 'authenticated');

create policy "media_assets_update" on public.media_assets
for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "media_assets_delete" on public.media_assets
for delete using (auth.role() = 'authenticated');

drop policy if exists "media_variants_select" on public.media_variants;
drop policy if exists "media_variants_insert" on public.media_variants;
drop policy if exists "media_variants_update" on public.media_variants;
drop policy if exists "media_variants_delete" on public.media_variants;

create policy "media_variants_select" on public.media_variants
for select using (auth.role() = 'authenticated');

create policy "media_variants_insert" on public.media_variants
for insert with check (auth.role() = 'authenticated');

create policy "media_variants_update" on public.media_variants
for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "media_variants_delete" on public.media_variants
for delete using (auth.role() = 'authenticated');

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media_objects_select" on storage.objects;
drop policy if exists "media_objects_insert" on storage.objects;
drop policy if exists "media_objects_update" on storage.objects;
drop policy if exists "media_objects_delete" on storage.objects;

create policy "media_objects_select" on storage.objects
for select using (bucket_id = 'media');

create policy "media_objects_insert" on storage.objects
for insert with check (bucket_id = 'media' and auth.role() = 'authenticated');

create policy "media_objects_update" on storage.objects
for update using (bucket_id = 'media' and auth.role() = 'authenticated') with check (bucket_id = 'media' and auth.role() = 'authenticated');

create policy "media_objects_delete" on storage.objects
for delete using (bucket_id = 'media' and auth.role() = 'authenticated');
