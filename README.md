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

## Языки

Сайт доступен на русском, французском и английском языках.

- Русские страницы: `schedule.html`, `baptism.html` и так далее.
- Французские страницы: `schedule-fr.html`, `baptism-fr.html` и так далее, главная `fr.html`.
- Английские страницы: `schedule-en.html`, `baptism-en.html` и так далее, главная `en.html`.

Переключатель языков в шапке ведёт на соответствующую страницу текущего раздела.

## Админ-панель

Админ-панель доступна по адресу:

- локально: `frontend/admin.html`
- на Render: `/admin.html`

Для Supabase:

1. Настроить GitHub Secrets по инструкции `docs/supabase-github.md`.
2. Запустить GitHub Actions workflow `Supabase migrations`.
3. Создать пользователя в Supabase Auth.
4. Открыть `/admin.html`.
5. Ввести Supabase URL и anon public key или прописать их в `frontend/assets/site-config.js`.
6. Войти email/паролем пользователя Supabase Auth.

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
