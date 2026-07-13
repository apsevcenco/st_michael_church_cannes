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
  updated_at timestamptz not null default now()
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
  created_at timestamptz not null default now()
);

alter table public.parish_news enable row level security;
alter table public.parish_news_photos enable row level security;

drop policy if exists "Public can read published parish news" on public.parish_news;
create policy "Public can read published parish news"
on public.parish_news for select
using (status = 'published');

drop policy if exists "Authenticated users can manage parish news" on public.parish_news;
create policy "Authenticated users can manage parish news"
on public.parish_news for all
to authenticated
using (true)
with check (true);

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

drop policy if exists "Authenticated users can manage parish news photos" on public.parish_news_photos;
create policy "Authenticated users can manage parish news photos"
on public.parish_news_photos for all
to authenticated
using (true)
with check (true);
