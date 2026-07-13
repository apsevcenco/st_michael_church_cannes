-- Split the Support page into editable bank details and online donation blocks.

delete from public.content_sections
where page_key = 'help'
  and section_key = 'body';

insert into public.content_sections
  (page_key, language, section_key, title, summary, body, status, sort_order)
select 'help', 'ru', 'donation', 'Банковские реквизиты', '', '', 'published', 20
where not exists (
  select 1 from public.content_sections
  where page_key = 'help' and language = 'ru' and section_key = 'donation'
);

insert into public.content_sections
  (page_key, language, section_key, title, summary, body, status, sort_order)
select 'help', 'ru', 'details', 'Онлайн-пожертвование', '', '', 'published', 30
where not exists (
  select 1 from public.content_sections
  where page_key = 'help' and language = 'ru' and section_key = 'details'
);

insert into public.content_sections
  (page_key, language, section_key, title, summary, body, status, sort_order)
select 'help', 'fr', 'donation', 'Coordonnées bancaires', '', '', 'published', 20
where not exists (
  select 1 from public.content_sections
  where page_key = 'help' and language = 'fr' and section_key = 'donation'
);

insert into public.content_sections
  (page_key, language, section_key, title, summary, body, status, sort_order)
select 'help', 'fr', 'details', 'Don en ligne', '', '', 'published', 30
where not exists (
  select 1 from public.content_sections
  where page_key = 'help' and language = 'fr' and section_key = 'details'
);

insert into public.content_sections
  (page_key, language, section_key, title, summary, body, status, sort_order)
select 'help', 'en', 'donation', 'Bank details', '', '', 'published', 20
where not exists (
  select 1 from public.content_sections
  where page_key = 'help' and language = 'en' and section_key = 'donation'
);

insert into public.content_sections
  (page_key, language, section_key, title, summary, body, status, sort_order)
select 'help', 'en', 'details', 'Online donation', '', '', 'published', 30
where not exists (
  select 1 from public.content_sections
  where page_key = 'help' and language = 'en' and section_key = 'details'
);
