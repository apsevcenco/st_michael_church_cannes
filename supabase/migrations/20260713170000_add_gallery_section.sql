-- Add editable public Gallery page content and keep media deletion policies explicit.

delete from public.content_sections
where page_key = 'gallery';

insert into public.content_sections
  (page_key, language, section_key, title, summary, body, status, sort_order)
values
  ('gallery', 'ru', 'hero', 'Галерея', '', '', 'published', 1),
  ('gallery', 'ru', 'body', 'Галерея', '', '', 'published', 10),
  ('gallery', 'fr', 'hero', 'Galerie', '', '', 'published', 1),
  ('gallery', 'fr', 'body', 'Galerie', '', '', 'published', 10),
  ('gallery', 'en', 'hero', 'Gallery', '', '', 'published', 1),
  ('gallery', 'en', 'body', 'Gallery', '', '', 'published', 10);

drop policy if exists "Authenticated users can manage media files" on public.media_files;
create policy "Authenticated users can manage media files"
on public.media_files for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete parish media" on storage.objects;
create policy "Authenticated users can delete parish media"
on storage.objects for delete
to authenticated
using (bucket_id = 'parish-media');
