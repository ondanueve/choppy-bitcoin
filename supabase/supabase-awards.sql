alter table public.profiles
  add column if not exists awards text[] not null default '{}';
