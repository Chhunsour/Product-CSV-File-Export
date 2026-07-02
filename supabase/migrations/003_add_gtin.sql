alter table public.workspace_items
  add column if not exists gtin text;
