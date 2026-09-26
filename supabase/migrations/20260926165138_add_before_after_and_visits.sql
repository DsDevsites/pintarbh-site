alter table public.projects
  add column if not exists before_image text not null default '',
  add column if not exists after_image text not null default '',
  add column if not exists before_after_enabled boolean not null default false,
  add column if not exists before_after_description text not null default '';

create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references auth.users(id) on delete set null,
  name text not null,
  phone text not null,
  service_type text not null,
  address text not null,
  preferred_date date not null,
  preferred_period text not null,
  observations text not null default '',
  status text not null default 'pending'
    check (status in ('pending','confirmed','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.visits enable row level security;

drop policy if exists "Public insert visits" on public.visits;
drop policy if exists "Admin manage visits" on public.visits;
drop policy if exists "Customer read own visits" on public.visits;

create policy "Public insert visits"
on public.visits for insert
to anon, authenticated
with check (true);

create policy "Admin manage visits"
on public.visits for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Customer read own visits"
on public.visits for select
to authenticated
using ((select auth.uid()) = client_id);

grant insert on public.visits to anon, authenticated;
grant select, update, delete on public.visits to authenticated;

create index if not exists visits_created_at_idx on public.visits(created_at desc);
create index if not exists visits_status_idx on public.visits(status);
create index if not exists visits_preferred_date_idx on public.visits(preferred_date);
create index if not exists visits_client_id_idx on public.visits(client_id);
