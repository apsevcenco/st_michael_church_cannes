# Supabase через GitHub Actions

Этот репозиторий содержит миграцию:

- `supabase/migrations/20260619193000_initial_admin_tables.sql`

И workflow:

- `.github/workflows/supabase-migrations.yml`

## Что нужно добавить в GitHub Secrets

Открой GitHub repository:

`Settings` -> `Secrets and variables` -> `Actions` -> `New repository secret`

Добавь три секрета:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_DB_PASSWORD`

Где взять:

- `SUPABASE_ACCESS_TOKEN`: Supabase Dashboard -> Account -> Access Tokens.
- `SUPABASE_PROJECT_REF`: в URL проекта Supabase или Project Settings -> General -> Reference ID.
- `SUPABASE_DB_PASSWORD`: пароль базы проекта Supabase.

## Как запустить

GitHub -> `Actions` -> `Supabase migrations` -> `Run workflow`.

После успешного запуска появятся таблицы:

- `services`
- `news`
- `pages`

После этого можно открыть `/admin.html`, подключить Supabase URL и anon public key, затем войти пользователем Supabase Auth.
