-- Historical seed migration intentionally left as a no-op.
--
-- The original version inserted static page text into content_sections and
-- media_files. Site content is now managed through the admin panel, so keeping
-- seeded text here risks overwriting live CMS data during a future migration.

select 1;
