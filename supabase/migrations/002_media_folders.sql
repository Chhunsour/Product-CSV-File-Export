alter table public.media_assets
  add column if not exists folder text;

create index if not exists media_assets_folder_idx on public.media_assets(folder);
