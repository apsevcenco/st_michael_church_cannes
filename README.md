# Сайт прихода Архангела Михаила в Каннах

Прототип сайта православного прихода Архистратига Михаила в Каннах с подготовкой к деплою на Render.

## Структура

- `frontend/` — статический сайт.
- `backend/` — Node backend API.
- `render.yaml` — Render Blueprint для frontend и backend.
- `frontend/structure.md` — рекомендуемая структура полноценного сайта.

## Дизайн

Для крупных заголовков подключен локальный церковнославянский титульный шрифт `Oglavie` из коллекции Slavonic Computing Initiative. Шрифты SCI распространяются под SIL Open Font License.

## Страницы

Основные разделы сайта реализованы отдельными HTML-страницами: расписание, таинства, история, посетителям, помощь, новости, контакты, а также страницы крещения, венчания, исповеди, причастия, записок и беседы со священником.

## Админ-панель

Админ-панель доступна по адресу:

- локально: `frontend/admin.html`
- на Render: `/admin.html`

Для Supabase:

1. Выполнить SQL из `supabase/schema.sql` в Supabase SQL Editor.
2. Создать пользователя в Supabase Auth.
3. Открыть `/admin.html`.
4. Ввести Supabase URL и anon public key или прописать их в `frontend/assets/site-config.js`.
5. Войти email/паролем пользователя Supabase Auth.

Панель умеет читать, создавать, редактировать и удалять записи в таблицах `services`, `news`, `pages`.

## Render

Blueprint поднимает два сервиса:

- `st-michael-church-cannes-frontend` — Static Site из папки `frontend`.
- `st-michael-church-cannes-backend` — Node Web Service из папки `backend`.

Backend endpoints:

- `GET /healthz`
- `GET /api/site`
- `GET /api/services`

## Перед публикацией

Нужно заменить прототипные данные на официальные:

- актуальное расписание богослужений;
- контакты канцелярии;
- реквизиты для пожертвований;
- юридическое наименование прихода;
- разрешенные фотографии и материалы.
