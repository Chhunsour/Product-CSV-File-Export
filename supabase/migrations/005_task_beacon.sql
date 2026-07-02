create table if not exists public.task_beacon (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (owner_id)
);

drop trigger if exists task_beacon_set_updated_at on public.task_beacon;

create trigger task_beacon_set_updated_at
before update on public.task_beacon
for each row execute function public.set_updated_at();

alter table public.task_beacon enable row level security;

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
