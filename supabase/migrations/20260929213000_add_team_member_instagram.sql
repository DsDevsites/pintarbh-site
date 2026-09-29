alter table public.team_members
  add column if not exists instagram_url text not null default '';
