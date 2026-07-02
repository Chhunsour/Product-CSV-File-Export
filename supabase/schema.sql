-- Extensions
create extension if not exists "pgcrypto";

-- Tables
create table if not exists public.workspace_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  slug text not null,
  excerpt text,
  content_md text,
  status text not null default 'private' check (status in ('draft', 'published', 'private')),
  featured boolean not null default false,
  folder text not null default 'production',
  parent_id uuid references public.workspace_items(id) on delete set null,
  post_id text,
  post_password text,
  menu_order text,
  post_date text,
  post_author text,
  comment_status text,
  sku text,
  gtin text,
  parent_sku text,
  children text,
  downloadable boolean not null default false,
  virtual boolean not null default false,
  stock text,
  regular_price text,
  sale_price text,
  weight text,
  length text,
  width text,
  height text,
  tax_class text,
  stock_status text,
  backorders text,
  sold_individually boolean not null default false,
  low_stock_amount text,
  manage_stock boolean not null default false,
  tax_status text,
  upsell_ids text,
  crosssell_ids text,
  purchase_note text,
  sale_price_dates_from text,
  sale_price_dates_to text,
  download_limit text,
  download_expiry text,
  product_url text,
  button_text text,
  product_type text,
  categories text,
  tags text,
  images text,
  short_description text,
  shipping_class text,
  visibility text,
  attr_1_name text,
  attr_1_values text,
  attr_1_visible boolean not null default false,
  attr_1_global boolean not null default false,
  attr_1_default text,
  attr_2_name text,
  attr_2_values text,
  attr_2_visible boolean not null default false,
  attr_2_global boolean not null default false,
  attr_2_default text,
  attr_3_name text,
  attr_3_values text,
  attr_3_visible boolean not null default false,
  attr_3_global boolean not null default false,
  attr_3_default text,
  download_1_name text,
  download_1_url text,
  download_2_name text,
  download_2_url text,
  rank_math_title text,
  rank_math_description text,
  rank_math_facebook_title text,
  rank_math_facebook_description text,
  rank_math_facebook_image text,
  rank_math_twitter_title text,
  rank_math_twitter_description text,
  rank_math_twitter_image text,
  rank_math_focus_keyword text,
  rank_math_canonical_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (owner_id, slug)
);

alter table public.workspace_items
  add column if not exists folder text not null default 'production',
  add column if not exists post_id text,
  add column if not exists post_password text,
  add column if not exists menu_order text,
  add column if not exists post_date text,
  add column if not exists post_author text,
  add column if not exists comment_status text,
  add column if not exists sku text,
  add column if not exists gtin text,
  add column if not exists parent_sku text,
  add column if not exists children text,
  add column if not exists downloadable boolean not null default false,
  add column if not exists virtual boolean not null default false,
  add column if not exists stock text,
  add column if not exists regular_price text,
  add column if not exists sale_price text,
  add column if not exists weight text,
  add column if not exists length text,
  add column if not exists width text,
  add column if not exists height text,
  add column if not exists tax_class text,
  add column if not exists stock_status text,
  add column if not exists backorders text,
  add column if not exists sold_individually boolean not null default false,
  add column if not exists low_stock_amount text,
  add column if not exists manage_stock boolean not null default false,
  add column if not exists tax_status text,
  add column if not exists upsell_ids text,
  add column if not exists crosssell_ids text,
  add column if not exists purchase_note text,
  add column if not exists sale_price_dates_from text,
  add column if not exists sale_price_dates_to text,
  add column if not exists download_limit text,
  add column if not exists download_expiry text,
  add column if not exists product_url text,
  add column if not exists button_text text,
  add column if not exists product_type text,
  add column if not exists categories text,
  add column if not exists tags text,
  add column if not exists images text,
  add column if not exists short_description text,
  add column if not exists shipping_class text,
  add column if not exists visibility text,
  add column if not exists attr_1_name text,
  add column if not exists attr_1_values text,
  add column if not exists attr_1_visible boolean not null default false,
  add column if not exists attr_1_global boolean not null default false,
  add column if not exists attr_1_default text,
  add column if not exists attr_2_name text,
  add column if not exists attr_2_values text,
  add column if not exists attr_2_visible boolean not null default false,
  add column if not exists attr_2_global boolean not null default false,
  add column if not exists attr_2_default text,
  add column if not exists attr_3_name text,
  add column if not exists attr_3_values text,
  add column if not exists attr_3_visible boolean not null default false,
  add column if not exists attr_3_global boolean not null default false,
  add column if not exists attr_3_default text,
  add column if not exists download_1_name text,
  add column if not exists download_1_url text,
  add column if not exists download_2_name text,
  add column if not exists download_2_url text,
  add column if not exists rank_math_title text,
  add column if not exists rank_math_description text,
  add column if not exists rank_math_facebook_title text,
  add column if not exists rank_math_facebook_description text,
  add column if not exists rank_math_facebook_image text,
  add column if not exists rank_math_twitter_title text,
  add column if not exists rank_math_twitter_description text,
  add column if not exists rank_math_twitter_image text,
  add column if not exists rank_math_focus_keyword text,
  add column if not exists rank_math_canonical_url text;

create table if not exists public.workspace_folders (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  is_active boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (owner_id, name)
);

create unique index if not exists workspace_folders_active_idx
on public.workspace_folders (owner_id)
where is_active;

create table if not exists public.task_beacon (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (owner_id)
);

create table if not exists public.notes_vault (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (owner_id)
);

create table if not exists public.blogs_vault (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (owner_id)
);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null references public.workspace_items(id) on delete cascade,
  type text not null check (type in ('file', 'link')),
  label text,
  url text not null,
  created_at timestamptz default now()
);

create table if not exists public.item_relations (
  from_item_id uuid references public.workspace_items(id) on delete cascade,
  to_item_id uuid references public.workspace_items(id) on delete cascade,
  relation_type text check (relation_type in ('related', 'upsell', 'crosssell')),
  primary key (from_item_id, to_item_id, relation_type)
);

-- Updated timestamp trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists workspace_items_set_updated_at on public.workspace_items;

create trigger workspace_items_set_updated_at
before update on public.workspace_items
for each row execute function public.set_updated_at();

drop trigger if exists workspace_folders_set_updated_at on public.workspace_folders;

create trigger workspace_folders_set_updated_at
before update on public.workspace_folders
for each row execute function public.set_updated_at();

drop trigger if exists task_beacon_set_updated_at on public.task_beacon;

create trigger task_beacon_set_updated_at
before update on public.task_beacon
for each row execute function public.set_updated_at();

drop trigger if exists notes_vault_set_updated_at on public.notes_vault;

create trigger notes_vault_set_updated_at
before update on public.notes_vault
for each row execute function public.set_updated_at();

drop trigger if exists blogs_vault_set_updated_at on public.blogs_vault;

create trigger blogs_vault_set_updated_at
before update on public.blogs_vault
for each row execute function public.set_updated_at();

-- Row level security
alter table public.workspace_items enable row level security;
alter table public.workspace_folders enable row level security;
alter table public.task_beacon enable row level security;
alter table public.notes_vault enable row level security;
alter table public.blogs_vault enable row level security;
alter table public.attachments enable row level security;
alter table public.item_relations enable row level security;

-- workspace_items policies
drop policy if exists "workspace_items_select" on public.workspace_items;
drop policy if exists "workspace_items_insert" on public.workspace_items;
drop policy if exists "workspace_items_update" on public.workspace_items;
drop policy if exists "workspace_items_delete" on public.workspace_items;

create policy "workspace_items_select" on public.workspace_items
for select using (owner_id = auth.uid());

create policy "workspace_items_insert" on public.workspace_items
for insert with check (owner_id = auth.uid());

create policy "workspace_items_update" on public.workspace_items
for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "workspace_items_delete" on public.workspace_items
for delete using (owner_id = auth.uid());

-- workspace_folders policies
drop policy if exists "workspace_folders_select" on public.workspace_folders;
drop policy if exists "workspace_folders_insert" on public.workspace_folders;
drop policy if exists "workspace_folders_update" on public.workspace_folders;
drop policy if exists "workspace_folders_delete" on public.workspace_folders;

create policy "workspace_folders_select" on public.workspace_folders
for select using (owner_id = auth.uid());

create policy "workspace_folders_insert" on public.workspace_folders
for insert with check (owner_id = auth.uid());

create policy "workspace_folders_update" on public.workspace_folders
for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "workspace_folders_delete" on public.workspace_folders
for delete using (owner_id = auth.uid());

-- task_beacon policies
drop policy if exists "task_beacon_select" on public.task_beacon;
drop policy if exists "task_beacon_insert" on public.task_beacon;
drop policy if exists "task_beacon_update" on public.task_beacon;
drop policy if exists "task_beacon_delete" on public.task_beacon;

create policy "task_beacon_select" on public.task_beacon
for select using (owner_id = auth.uid());

create policy "task_beacon_insert" on public.task_beacon
for insert with check (owner_id = auth.uid());

create policy "task_beacon_update" on public.task_beacon
for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "task_beacon_delete" on public.task_beacon
for delete using (owner_id = auth.uid());

-- notes_vault policies
drop policy if exists "notes_vault_select" on public.notes_vault;
drop policy if exists "notes_vault_insert" on public.notes_vault;
drop policy if exists "notes_vault_update" on public.notes_vault;
drop policy if exists "notes_vault_delete" on public.notes_vault;

create policy "notes_vault_select" on public.notes_vault
for select using (owner_id = auth.uid());

create policy "notes_vault_insert" on public.notes_vault
for insert with check (owner_id = auth.uid());

create policy "notes_vault_update" on public.notes_vault
for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "notes_vault_delete" on public.notes_vault
for delete using (owner_id = auth.uid());

-- blogs_vault policies
drop policy if exists "blogs_vault_select" on public.blogs_vault;
drop policy if exists "blogs_vault_insert" on public.blogs_vault;
drop policy if exists "blogs_vault_update" on public.blogs_vault;
drop policy if exists "blogs_vault_delete" on public.blogs_vault;

create policy "blogs_vault_select" on public.blogs_vault
for select using (owner_id = auth.uid());

create policy "blogs_vault_insert" on public.blogs_vault
for insert with check (owner_id = auth.uid());

create policy "blogs_vault_update" on public.blogs_vault
for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "blogs_vault_delete" on public.blogs_vault
for delete using (owner_id = auth.uid());

-- attachments policies
drop policy if exists "attachments_select" on public.attachments;
drop policy if exists "attachments_insert" on public.attachments;
drop policy if exists "attachments_update" on public.attachments;
drop policy if exists "attachments_delete" on public.attachments;

create policy "attachments_select" on public.attachments
for select using (owner_id = auth.uid());

create policy "attachments_insert" on public.attachments
for insert with check (owner_id = auth.uid());

create policy "attachments_update" on public.attachments
for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "attachments_delete" on public.attachments
for delete using (owner_id = auth.uid());

-- item_relations policies (both items must belong to the user)
drop policy if exists "item_relations_select" on public.item_relations;
drop policy if exists "item_relations_insert" on public.item_relations;
drop policy if exists "item_relations_update" on public.item_relations;
drop policy if exists "item_relations_delete" on public.item_relations;

create policy "item_relations_select" on public.item_relations
for select using (
  exists (
    select 1 from public.workspace_items wi
    where wi.id = from_item_id and wi.owner_id = auth.uid()
  )
  and exists (
    select 1 from public.workspace_items wi2
    where wi2.id = to_item_id and wi2.owner_id = auth.uid()
  )
);

create policy "item_relations_insert" on public.item_relations
for insert with check (
  exists (
    select 1 from public.workspace_items wi
    where wi.id = from_item_id and wi.owner_id = auth.uid()
  )
  and exists (
    select 1 from public.workspace_items wi2
    where wi2.id = to_item_id and wi2.owner_id = auth.uid()
  )
);

create policy "item_relations_update" on public.item_relations
for update using (
  exists (
    select 1 from public.workspace_items wi
    where wi.id = from_item_id and wi.owner_id = auth.uid()
  )
  and exists (
    select 1 from public.workspace_items wi2
    where wi2.id = to_item_id and wi2.owner_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.workspace_items wi
    where wi.id = from_item_id and wi.owner_id = auth.uid()
  )
  and exists (
    select 1 from public.workspace_items wi2
    where wi2.id = to_item_id and wi2.owner_id = auth.uid()
  )
);

create policy "item_relations_delete" on public.item_relations
for delete using (
  exists (
    select 1 from public.workspace_items wi
    where wi.id = from_item_id and wi.owner_id = auth.uid()
  )
  and exists (
    select 1 from public.workspace_items wi2
    where wi2.id = to_item_id and wi2.owner_id = auth.uid()
  )
);

-- Storage bucket and policies
insert into storage.buckets (id, name, public)
values ('workspace', 'workspace', false)
on conflict (id) do nothing;

drop policy if exists "workspace_objects_select" on storage.objects;
drop policy if exists "workspace_objects_insert" on storage.objects;
drop policy if exists "workspace_objects_delete" on storage.objects;

create policy "workspace_objects_select" on storage.objects
for select using (
  bucket_id = 'workspace'
  and auth.role() = 'authenticated'
  and split_part(name, '/', 1) = auth.uid()::text
);

create policy "workspace_objects_insert" on storage.objects
for insert with check (
  bucket_id = 'workspace'
  and auth.role() = 'authenticated'
  and split_part(name, '/', 1) = auth.uid()::text
);

create policy "workspace_objects_delete" on storage.objects
for delete using (
  bucket_id = 'workspace'
  and auth.role() = 'authenticated'
  and split_part(name, '/', 1) = auth.uid()::text
);
