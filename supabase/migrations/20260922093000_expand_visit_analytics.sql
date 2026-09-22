alter table public.page_visits
  add column if not exists visitor_id text,
  add column if not exists is_new_session boolean not null default false,
  add column if not exists first_seen_at timestamptz,
  add column if not exists landing_page text,
  add column if not exists timezone text,
  add column if not exists visitor_language text,
  add column if not exists country_code text,
  add column if not exists country_name text,
  add column if not exists device_type text,
  add column if not exists browser_name text,
  add column if not exists os_name text,
  add column if not exists screen_width integer,
  add column if not exists screen_height integer;

create index if not exists page_visits_session_id_idx on public.page_visits (session_id);
create index if not exists page_visits_visitor_id_idx on public.page_visits (visitor_id);
create index if not exists page_visits_country_idx on public.page_visits (country_code, country_name);
create index if not exists page_visits_device_idx on public.page_visits (device_type);
create index if not exists page_visits_landing_page_idx on public.page_visits (landing_page);

drop policy if exists "Public can insert page visits" on public.page_visits;
create policy "Public can insert page visits"
on public.page_visits for insert
to anon, authenticated
with check (
  length(page_key) <= 80
  and length(page_path) <= 300
  and language in ('ru', 'fr', 'en')
  and (session_id is null or length(session_id) <= 120)
  and (visitor_id is null or length(visitor_id) <= 120)
  and (referrer is null or length(referrer) <= 500)
  and (user_agent is null or length(user_agent) <= 500)
  and (landing_page is null or length(landing_page) <= 300)
  and (timezone is null or length(timezone) <= 80)
  and (visitor_language is null or length(visitor_language) <= 40)
  and (country_code is null or length(country_code) <= 8)
  and (country_name is null or length(country_name) <= 80)
  and (device_type is null or device_type in ('desktop', 'mobile', 'tablet'))
  and (browser_name is null or length(browser_name) <= 40)
  and (os_name is null or length(os_name) <= 40)
  and (screen_width is null or screen_width between 0 and 10000)
  and (screen_height is null or screen_height between 0 and 10000)
);
