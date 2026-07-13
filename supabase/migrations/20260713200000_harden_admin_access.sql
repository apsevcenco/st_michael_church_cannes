create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

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

alter table public.content_sections
  drop constraint if exists content_sections_status_check,
  add constraint content_sections_status_check check (status in ('published', 'draft')) not valid;

alter table public.content_sections
  drop constraint if exists content_sections_language_check,
  add constraint content_sections_language_check check (language in ('ru', 'fr', 'en')) not valid;

alter table public.media_files
  drop constraint if exists media_files_status_check,
  add constraint media_files_status_check check (status in ('published', 'draft')) not valid;

alter table public.media_files
  drop constraint if exists media_files_size_check,
  add constraint media_files_size_check check (file_size is null or file_size <= 20971520) not valid;

alter table public.parish_news
  drop constraint if exists parish_news_status_check,
  add constraint parish_news_status_check check (status in ('published', 'draft')) not valid;

alter table public.parish_news
  drop constraint if exists parish_news_language_check,
  add constraint parish_news_language_check check (language in ('ru', 'fr', 'en')) not valid;

alter table public.parish_news_photos
  drop constraint if exists parish_news_photos_size_check,
  add constraint parish_news_photos_size_check check (file_size is null or file_size <= 8388608) not valid;
