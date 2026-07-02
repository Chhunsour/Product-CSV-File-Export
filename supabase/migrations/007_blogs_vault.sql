create table if not exists public.blogs_vault (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (owner_id)
);

drop trigger if exists blogs_vault_set_updated_at on public.blogs_vault;

create trigger blogs_vault_set_updated_at
before update on public.blogs_vault
for each row execute function public.set_updated_at();

alter table public.blogs_vault enable row level security;

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
