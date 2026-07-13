create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.page_visits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  visit_date date not null default current_date,
  page_key text not null,
  page_path text not null,
  language text not null default 'ru',
  session_id text,
  referrer text,
  user_agent text
);

alter table public.page_visits enable row level security;

create index if not exists page_visits_created_at_idx on public.page_visits (created_at desc);
create index if not exists page_visits_visit_date_idx on public.page_visits (visit_date desc);
create index if not exists page_visits_page_key_idx on public.page_visits (page_key);

drop policy if exists "Public can insert page visits" on public.page_visits;
create policy "Public can insert page visits"
on public.page_visits for insert
to anon, authenticated
with check (
  length(page_key) <= 80
  and length(page_path) <= 300
  and language in ('ru', 'fr', 'en')
  and (session_id is null or length(session_id) <= 120)
  and (referrer is null or length(referrer) <= 500)
  and (user_agent is null or length(user_agent) <= 500)
);

drop policy if exists "Admins can read page visits" on public.page_visits;
create policy "Admins can read page visits"
on public.page_visits for select
to authenticated
using (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid()));

drop policy if exists "Admins can delete page visits" on public.page_visits;
create policy "Admins can delete page visits"
on public.page_visits for delete
to authenticated
using (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid()));
