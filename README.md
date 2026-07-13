# Сайт прихода Архангела Михаила в Каннах

Статический сайт православного прихода Архангела Михаила в Каннах с админ-панелью на Supabase и деплоем на Render.

## Структура

- `frontend/` — публичный сайт и админ-панель.
- `frontend/assets/` — стили, скрипты, изображения и шрифт.
- `backend/` — небольшой Node API для health-check и служебной информации.
- `supabase/migrations/` — миграции таблиц CMS, медиа, новостей и прав доступа.
- `render.yaml` — Render Blueprint для frontend и backend.

## Публичный сайт

Основные страницы:

- `index.html` — главная.
- `history.html` — история.
- `gallery.html` — галерея.
- `schedule.html` — богослужения.
- `sacraments.html` — таинства и требы.
- `help.html` — помощь храму.
- `contacts.html` — контакты.
- `news.html` — новости.

Французская и английская версии временно закрыты на уровне общего скрипта `frontend/assets/app.js`.

## Админ-панель

Админ-панель доступна по адресу:

- локально: `frontend/admin.html`;
- на Render: `/admin.html`.

Вход выполняется через Supabase Auth по email и паролю. Экран подключения Supabase из админки убран; параметры проекта задаются в `frontend/assets/site-config.js`.

Админ-панель управляет:

- текстами разделов через `content_sections`;
- фотографиями, PDF и документами через `media_files` и bucket `parish-media`;
- новостями через `parish_news` и `parish_news_photos`;
- галереей и историческими фотографиями;
- банковскими реквизитами и блоком помощи храму.

## Supabase

Для применения миграций через GitHub Actions нужны secrets:

- `SUPABASE_ACCESS_TOKEN`;
- `SUPABASE_DB_PASSWORD`;
- `SUPABASE_PROJECT_REF`.

Workflow: `.github/workflows/supabase-migrations.yml`.

Security hardening:

- admin edit access is restricted by `public.admin_users`;
- Supabase Auth login alone is not enough to manage the site;
- setup and audit notes are in `docs/security-audit.md`;
- after applying migrations, add the real admin email to `public.admin_users`.

## Render

Blueprint поднимает два сервиса:

- `st-michael-church-cannes-frontend` — Static Site из папки `frontend`;
- `st-michael-church-cannes-backend` — Node Web Service из папки `backend`.

Backend endpoints:

- `GET /healthz`;
- `GET /api/site`;
- `GET /api/services`.

Актуальное расписание богослужений публикуется на сайте через CMS или PDF в разделе `Богослужения`.

## Дизайн

В проекте подключён локальный церковнославянский титульный шрифт `Oglavie` из коллекции Slavonic Computing Initiative. Шрифт SCI распространяется по SIL Open Font License.

Текущая визуальная гамма:

- пергаментный фон;
- старое золото;
- бордовый акцент;
- кипарисовый зелёный;
- лазурный синий;
- декоративные рамки и мягкие церковные орнаменты.
