create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null default '',
  role text not null default '',
  photo_url text not null default '',
  description text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.team_members enable row level security;

drop policy if exists "Public can read team members" on public.team_members;
create policy "Public can read team members"
  on public.team_members for select
  using (true);

drop policy if exists "Admins can manage team members" on public.team_members;
create policy "Admins can manage team members"
  on public.team_members for all
  using (private.is_admin())
  with check (private.is_admin());

create index if not exists team_members_sort_order_idx on public.team_members(sort_order, created_at);
