create table if not exists public.workspace_folders (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  is_active boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (owner_id, name)
);

drop trigger if exists workspace_folders_set_updated_at on public.workspace_folders;

create trigger workspace_folders_set_updated_at
before update on public.workspace_folders
for each row execute function public.set_updated_at();

create unique index if not exists workspace_folders_active_idx
on public.workspace_folders (owner_id)
where is_active;

alter table public.workspace_folders enable row level security;

drop policy if exists "workspace_folders_select" on public.workspace_folders;
drop policy if exists "workspace_folders_insert" on public.workspace_folders;
drop policy if exists "workspace_folders_update" on public.workspace_folders;
drop policy if exists "workspace_folders_delete" on public.workspace_folders;

create policy "workspace_folders_select" on public.workspace_folders
for select using (auth.uid() = owner_id);

create policy "workspace_folders_insert" on public.workspace_folders
for insert with check (auth.uid() = owner_id);

create policy "workspace_folders_update" on public.workspace_folders
for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "workspace_folders_delete" on public.workspace_folders
for delete using (auth.uid() = owner_id);
