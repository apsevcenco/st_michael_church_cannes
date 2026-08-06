# Frontend TypeScript Structure

This folder contains the TypeScript source used by Vite.

- `app.ts` is typed public UI behavior: language blocking, back button, hero slideshow and mobile navigation.
- `cms.ts` is the transitional public CMS loader. It is restored to readable UTF-8 and will be split into typed modules next.
- `admin.ts` is the transitional admin panel controller. It is restored to readable UTF-8 and will be split into typed modules next.
- `types.ts` contains the shared CMS, media, news, visit and admin section contracts.
- `site-config.ts` contains the public Supabase URL and anon key.

Next migration step: split `admin.ts` into `auth`, `content`, `media`, `news`, `gallery`, `schedule` and `stats` modules, then remove `// @ts-nocheck` module by module.
