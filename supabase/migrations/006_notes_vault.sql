create table if not exists public.notes_vault (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (owner_id)
);

drop trigger if exists notes_vault_set_updated_at on public.notes_vault;

create trigger notes_vault_set_updated_at
before update on public.notes_vault
for each row execute function public.set_updated_at();

alter table public.notes_vault enable row level security;

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
