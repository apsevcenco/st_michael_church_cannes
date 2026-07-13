# Supabase through GitHub Actions

This repository stores Supabase migrations in `supabase/migrations/`.

GitHub workflow:

- `.github/workflows/supabase-migrations.yml`

## GitHub secrets

Open the GitHub repository:

`Settings` -> `Secrets and variables` -> `Actions` -> `New repository secret`

Add:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_DB_PASSWORD`

Where to find them:

- `SUPABASE_ACCESS_TOKEN`: Supabase Dashboard -> Account -> Access Tokens.
- `SUPABASE_PROJECT_REF`: Supabase project URL or Project Settings -> General -> Reference ID.
- `SUPABASE_DB_PASSWORD`: database password for this Supabase project.

## Run migrations

GitHub -> `Actions` -> `Supabase migrations` -> `Run workflow`.

The current migrations create and protect:

- legacy tables: `services`, `news`, `pages`;
- CMS tables: `content_sections`, `media_files`;
- news tables: `parish_news`, `parish_news_photos`;
- admin allowlist table: `admin_users`;
- public storage bucket: `parish-media`.

## Admin access after hardening

After migrations are applied, `/admin.html` allows only Supabase Auth users that are also listed in `public.admin_users`.

Run this in Supabase SQL Editor as the project owner:

```sql
insert into public.admin_users (user_id, email)
select id, email
from auth.users
where email = 'YOUR_ADMIN_EMAIL@example.com'
on conflict (user_id) do update set email = excluded.email;
```

Replace the email with the exact email used to log in to the admin panel.

More notes: `docs/security-audit.md`.
