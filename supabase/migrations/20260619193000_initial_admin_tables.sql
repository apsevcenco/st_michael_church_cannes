create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  item_date text,
  title text not null,
  body text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  item_date text,
  title text not null,
  body text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  item_date text,
  title text not null,
  body text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.services enable row level security;
alter table public.news enable row level security;
alter table public.pages enable row level security;

drop policy if exists "Public can read services" on public.services;
create policy "Public can read services"
on public.services for select
using (true);

drop policy if exists "Public can read news" on public.news;
create policy "Public can read news"
on public.news for select
using (true);

drop policy if exists "Public can read pages" on public.pages;
create policy "Public can read pages"
on public.pages for select
using (true);

drop policy if exists "Authenticated users can manage services" on public.services;
create policy "Authenticated users can manage services"
on public.services for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage news" on public.news;
create policy "Authenticated users can manage news"
on public.news for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage pages" on public.pages;
create policy "Authenticated users can manage pages"
on public.pages for all
to authenticated
using (true)
with check (true);
