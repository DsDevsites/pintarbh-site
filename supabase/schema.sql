create extension if not exists "pgcrypto";
create schema if not exists private;

create table if not exists site_settings (
  id text primary key default 'default',
  content jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  image text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  location text not null,
  date date not null,
  cover_image text not null,
  short_description text not null,
  full_description text not null,
  services text[] not null default '{}',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  comment text not null,
  rating integer not null check (rating between 1 and 5),
  created_at timestamptz not null default now()
);

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

create table if not exists admin_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role = 'admin'),
  created_at timestamptz not null default now()
);

alter table site_settings enable row level security;
alter table services enable row level security;
alter table projects enable row level security;
alter table project_images enable row level security;
alter table testimonials enable row level security;
alter table contacts enable row level security;
alter table admin_users enable row level security;
alter table admin_access enable row level security;

drop policy if exists "Public read settings" on site_settings;
drop policy if exists "Public read services" on services;
drop policy if exists "Public read projects" on projects;
drop policy if exists "Public read project images" on project_images;
drop policy if exists "Public read testimonials" on testimonials;
drop policy if exists "Public insert contacts" on contacts;

create policy "Public read settings" on site_settings for select using (true);
create policy "Public read services" on services for select using (true);
create policy "Public read projects" on projects for select using (true);
create policy "Public read project images" on project_images for select using (true);
create policy "Public read testimonials" on testimonials for select using (true);
create policy "Public insert contacts" on contacts for insert with check (true);

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_access
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

drop policy if exists "Admin read contacts" on contacts;
drop policy if exists "Admin manage settings" on site_settings;
drop policy if exists "Admin manage services" on services;
drop policy if exists "Admin manage projects" on projects;
drop policy if exists "Admin manage project images" on project_images;
drop policy if exists "Admin manage testimonials" on testimonials;
drop policy if exists "Admin read own access" on admin_access;

create policy "Admin read contacts"
on contacts for select to authenticated
using (private.is_admin());

create policy "Admin manage settings"
on site_settings for all to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy "Admin manage services"
on services for all to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy "Admin manage projects"
on projects for all to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy "Admin manage project images"
on project_images for all to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy "Admin manage testimonials"
on testimonials for all to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy "Admin read own access"
on admin_access for select to authenticated
using (user_id = auth.uid());

-- Public image delivery + admin-only writes.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pintarbh-images',
  'pintarbh-images',
  true,
  10485760,
  array['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read PintarBH images" on storage.objects;
drop policy if exists "Admin upload PintarBH images" on storage.objects;
drop policy if exists "Admin update PintarBH images" on storage.objects;
drop policy if exists "Admin delete PintarBH images" on storage.objects;

create policy "Public read PintarBH images"
on storage.objects for select
using (bucket_id = 'pintarbh-images');

create policy "Admin upload PintarBH images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'pintarbh-images'
  and private.is_admin()
);

create policy "Admin update PintarBH images"
on storage.objects for update to authenticated
using (
  bucket_id = 'pintarbh-images'
  and private.is_admin()
)
with check (
  bucket_id = 'pintarbh-images'
  and private.is_admin()
);

create policy "Admin delete PintarBH images"
on storage.objects for delete to authenticated
using (
  bucket_id = 'pintarbh-images'
  and private.is_admin()
);

create index if not exists projects_slug_idx on projects(slug);
create index if not exists project_images_project_id_idx on project_images(project_id);
create index if not exists contacts_created_at_idx on contacts(created_at desc);


create table if not exists customer_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  phone text not null,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table customer_profiles enable row level security;
drop policy if exists "Customer can read own profile" on customer_profiles;
create policy "Customer can read own profile" on customer_profiles for select to authenticated using (id = (select auth.uid()));
drop policy if exists "Customer can insert own profile" on customer_profiles;
create policy "Customer can insert own profile" on customer_profiles for insert to authenticated with check (id = (select auth.uid()));
drop policy if exists "Customer can update own profile" on customer_profiles;
create policy "Customer can update own profile" on customer_profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  quote_number text not null unique,
  client_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  phone text not null,
  property_type text not null,
  city text not null,
  neighborhood text,
  address text,
  service_types text[] not null default '{}',
  environments integer,
  area numeric(12,2),
  color text,
  finish text,
  desired_start_date date,
  urgency text,
  budget_range text,
  description text not null,
  status text not null default 'new' check (status in ('new','in_review','sent','approved','completed','cancelled')),
  labor_amount numeric(12,2),
  materials_amount numeric(12,2),
  other_amount numeric(12,2),
  discount_amount numeric(12,2),
  total_amount numeric(12,2),
  duration text,
  payment_terms text,
  admin_notes text,
  request_pdf_path text,
  final_pdf_path text,
  email_status text not null default 'pending' check (email_status in ('pending','sent','failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists quote_images (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references quotes(id) on delete cascade,
  image_path text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table quotes enable row level security;
alter table quote_images enable row level security;

drop policy if exists "Admin manage quotes" on quotes;
create policy "Admin manage quotes" on quotes for all to authenticated
using (private.is_admin()) with check (private.is_admin());

drop policy if exists "Admin manage quote images" on quote_images;
create policy "Admin manage quote images" on quote_images for all to authenticated
using (private.is_admin()) with check (private.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pintarbh-quotes','pintarbh-quotes',false,8388608,array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "Admin read PintarBH quote files" on storage.objects;
drop policy if exists "Admin upload PintarBH quote files" on storage.objects;
drop policy if exists "Admin update PintarBH quote files" on storage.objects;
drop policy if exists "Admin delete PintarBH quote files" on storage.objects;

create policy "Admin read PintarBH quote files" on storage.objects for select to authenticated
using (bucket_id='pintarbh-quotes' and private.is_admin());
create policy "Admin upload PintarBH quote files" on storage.objects for insert to authenticated
with check (bucket_id='pintarbh-quotes' and private.is_admin());
create policy "Admin update PintarBH quote files" on storage.objects for update to authenticated
using (bucket_id='pintarbh-quotes' and private.is_admin())
with check (bucket_id='pintarbh-quotes' and private.is_admin());
create policy "Admin delete PintarBH quote files" on storage.objects for delete to authenticated
using (bucket_id='pintarbh-quotes' and private.is_admin());

create index if not exists quotes_created_at_idx on quotes(created_at desc);
create index if not exists quotes_status_idx on quotes(status);
create index if not exists quote_images_quote_id_idx on quote_images(quote_id);


drop policy if exists "Customer can read own quotes" on quotes;
create policy "Customer can read own quotes" on quotes for select to authenticated using (client_id = (select auth.uid()));
drop policy if exists "Customer can read own quote images" on quote_images;
create policy "Customer can read own quote images" on quote_images for select to authenticated using (exists (select 1 from quotes q where q.id = quote_images.quote_id and q.client_id = (select auth.uid())));
drop policy if exists "Customer read own quote files" on storage.objects;
create policy "Customer read own quote files" on storage.objects for select to authenticated using (bucket_id='pintarbh-quotes' and exists (select 1 from quotes q where q.client_id=(select auth.uid()) and name like 'pdfs/' || q.id::text || '/%'));
create index if not exists quotes_client_id_idx on quotes(client_id);
