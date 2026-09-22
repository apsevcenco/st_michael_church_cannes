alter table public.parish_news
  add column if not exists translation_group_id uuid;

update public.parish_news
set translation_group_id = id
where translation_group_id is null;

create index if not exists parish_news_translation_group_language_idx
  on public.parish_news (translation_group_id, language);
