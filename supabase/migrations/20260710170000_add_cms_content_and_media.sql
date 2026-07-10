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
  updated_at timestamptz not null default now()
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
  updated_at timestamptz not null default now()
);

alter table public.content_sections enable row level security;
alter table public.media_files enable row level security;

drop policy if exists "Public can read published content sections" on public.content_sections;
create policy "Public can read published content sections"
on public.content_sections for select
using (status = 'published');

drop policy if exists "Authenticated users can manage content sections" on public.content_sections;
create policy "Authenticated users can manage content sections"
on public.content_sections for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public can read published media files" on public.media_files;
create policy "Public can read published media files"
on public.media_files for select
using (status = 'published');

drop policy if exists "Authenticated users can manage media files" on public.media_files;
create policy "Authenticated users can manage media files"
on public.media_files for all
to authenticated
using (true)
with check (true);

insert into storage.buckets (id, name, public)
values ('parish-media', 'parish-media', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can read parish media" on storage.objects;
create policy "Public can read parish media"
on storage.objects for select
using (bucket_id = 'parish-media');

drop policy if exists "Authenticated users can upload parish media" on storage.objects;
create policy "Authenticated users can upload parish media"
on storage.objects for insert
to authenticated
with check (bucket_id = 'parish-media');

drop policy if exists "Authenticated users can update parish media" on storage.objects;
create policy "Authenticated users can update parish media"
on storage.objects for update
to authenticated
using (bucket_id = 'parish-media')
with check (bucket_id = 'parish-media');

drop policy if exists "Authenticated users can delete parish media" on storage.objects;
create policy "Authenticated users can delete parish media"
on storage.objects for delete
to authenticated
using (bucket_id = 'parish-media');
