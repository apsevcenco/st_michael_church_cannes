# Frontend TypeScript Structure

This folder contains the TypeScript source used by Vite.

- `app.ts` is typed public UI behavior: language blocking, back button, hero slideshow and mobile navigation.
- `cms.ts` is the transitional public CMS loader. It is restored to readable UTF-8 and will be split into typed modules next.
- `admin.ts` is the transitional admin panel controller. It is restored to readable UTF-8 and will be split into typed modules next.
- `adminAuth.ts` contains typed Supabase Auth login, logout, session restore and admin access checks.
- `adminContent.ts` contains typed content-section editing: block tabs, text form, loading, saving and deleting.
- `adminConfig.ts` contains admin section configuration, upload limits, storage constants and upload validation.
- `adminMedia.ts` contains typed media editing: purpose selector, uploads to Supabase Storage, multi-image galleries and deletion.
- `adminNews.ts` contains typed parish news editing: calendar date, text, news photos, saving and deletion.
- `adminStats.ts` contains typed visit statistics: totals, unique sessions, popular pages and recent visits.
- `shared.ts` contains reusable HTML, URL and date helpers used by public CMS and admin code.
- `types.ts` contains the shared CMS, media, news, visit and admin section contracts.
- `site-config.ts` contains the public Supabase URL and anon key.

Next migration step: split `admin.ts` into `auth`, `content`, `media`, `news`, `gallery`, `schedule` and `stats` modules, then remove `// @ts-nocheck` module by module.
