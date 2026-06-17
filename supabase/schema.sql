create extension if not exists "pgcrypto";

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

alter table site_settings enable row level security;
alter table services enable row level security;
alter table projects enable row level security;
alter table project_images enable row level security;
alter table testimonials enable row level security;
alter table contacts enable row level security;
alter table admin_users enable row level security;

create policy "Public read settings" on site_settings for select using (true);
create policy "Public read services" on services for select using (true);
create policy "Public read projects" on projects for select using (true);
create policy "Public read project images" on project_images for select using (true);
create policy "Public read testimonials" on testimonials for select using (true);
create policy "Public insert contacts" on contacts for insert with check (true);

create index if not exists projects_slug_idx on projects(slug);
create index if not exists project_images_project_id_idx on project_images(project_id);
create index if not exists contacts_created_at_idx on contacts(created_at desc);
