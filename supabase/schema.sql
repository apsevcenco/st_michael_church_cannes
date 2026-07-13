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

create table if not exists public.content_sections (
  id uuid primary key default gen_random_uuid(),
  page_key text not null,
  language text not null default 'ru',
  section_key text not null default 'body',
  title text,
  summary text,
  body text,
  status text not null default 'published',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_sections_status_check check (status in ('published', 'draft')),
  constraint content_sections_language_check check (language in ('ru', 'fr', 'en'))
);

create table if not exists public.media_files (
  id uuid primary key default gen_random_uuid(),
  page_key text not null,
  purpose text not null,
  title text,
  description text,
  file_url text not null,
  storage_path text,
  file_name text,
  mime_type text,
  file_size bigint,
  status text not null default 'published',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint media_files_status_check check (status in ('published', 'draft')),
  constraint media_files_size_check check (file_size is null or file_size <= 20971520)
);

create table if not exists public.parish_news (
  id uuid primary key default gen_random_uuid(),
  language text not null default 'ru',
  title text not null,
  excerpt text,
  body text,
  event_date date not null default current_date,
  status text not null default 'published',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint parish_news_status_check check (status in ('published', 'draft')),
  constraint parish_news_language_check check (language in ('ru', 'fr', 'en'))
);

create table if not exists public.parish_news_photos (
  id uuid primary key default gen_random_uuid(),
  news_id uuid not null references public.parish_news(id) on delete cascade,
  title text,
  description text,
  file_url text not null,
  storage_path text,
  file_name text,
  mime_type text,
  file_size bigint,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint parish_news_photos_size_check check (file_size is null or file_size <= 8388608)
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

alter table public.services enable row level security;
alter table public.news enable row level security;
alter table public.pages enable row level security;
alter table public.content_sections enable row level security;
alter table public.media_files enable row level security;
alter table public.parish_news enable row level security;
alter table public.parish_news_photos enable row level security;
alter table public.admin_users enable row level security;

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

drop policy if exists "Public can read published content sections" on public.content_sections;
create policy "Public can read published content sections"
on public.content_sections for select
using (status = 'published');

drop policy if exists "Public can read published media files" on public.media_files;
create policy "Public can read published media files"
on public.media_files for select
using (status = 'published');

drop policy if exists "Public can read published parish news" on public.parish_news;
create policy "Public can read published parish news"
on public.parish_news for select
using (status = 'published');

drop policy if exists "Public can read published parish news photos" on public.parish_news_photos;
create policy "Public can read published parish news photos"
on public.parish_news_photos for select
using (
  exists (
    select 1
    from public.parish_news
    where parish_news.id = parish_news_photos.news_id
      and parish_news.status = 'published'
  )
);

drop policy if exists "Admins can read own admin record" on public.admin_users;
create policy "Admins can read own admin record"
on public.admin_users for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Authenticated users can manage services" on public.services;
drop policy if exists "Authenticated users can manage news" on public.news;
drop policy if exists "Authenticated users can manage pages" on public.pages;
drop policy if exists "Authenticated users can manage content sections" on public.content_sections;
drop policy if exists "Authenticated users can manage media files" on public.media_files;
drop policy if exists "Authenticated users can manage parish news" on public.parish_news;
drop policy if exists "Authenticated users can manage parish news photos" on public.parish_news_photos;
drop policy if exists "Authenticated users can upload parish media" on storage.objects;
drop policy if exists "Authenticated users can update parish media" on storage.objects;
drop policy if exists "Authenticated users can delete parish media" on storage.objects;

drop policy if exists "Admins can manage services" on public.services;
create policy "Admins can manage services"
on public.services for all
to authenticated
using (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid()));

drop policy if exists "Admins can manage news" on public.news;
create policy "Admins can manage news"
on public.news for all
to authenticated
using (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid()));

drop policy if exists "Admins can manage pages" on public.pages;
create policy "Admins can manage pages"
on public.pages for all
to authenticated
using (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid()));

drop policy if exists "Admins can manage content sections" on public.content_sections;
create policy "Admins can manage content sections"
on public.content_sections for all
to authenticated
using (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid()));

drop policy if exists "Admins can manage media files" on public.media_files;
create policy "Admins can manage media files"
on public.media_files for all
to authenticated
using (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid()));

drop policy if exists "Admins can manage parish news" on public.parish_news;
create policy "Admins can manage parish news"
on public.parish_news for all
to authenticated
using (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid()));

drop policy if exists "Admins can manage parish news photos" on public.parish_news_photos;
create policy "Admins can manage parish news photos"
on public.parish_news_photos for all
to authenticated
using (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid()));

insert into storage.buckets (id, name, public)
values ('parish-media', 'parish-media', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can read parish media" on storage.objects;
create policy "Public can read parish media"
on storage.objects for select
using (bucket_id = 'parish-media');

drop policy if exists "Admins can upload parish media" on storage.objects;
create policy "Admins can upload parish media"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'parish-media'
  and exists (select 1 from public.admin_users where admin_users.user_id = auth.uid())
);

drop policy if exists "Admins can update parish media" on storage.objects;
create policy "Admins can update parish media"
on storage.objects for update
to authenticated
using (
  bucket_id = 'parish-media'
  and exists (select 1 from public.admin_users where admin_users.user_id = auth.uid())
)
with check (
  bucket_id = 'parish-media'
  and exists (select 1 from public.admin_users where admin_users.user_id = auth.uid())
);

drop policy if exists "Admins can delete parish media" on storage.objects;
create policy "Admins can delete parish media"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'parish-media'
  and exists (select 1 from public.admin_users where admin_users.user_id = auth.uid())
);
