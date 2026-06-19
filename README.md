# Сайт прихода Архангела Михаила в Каннах

Прототип сайта православного прихода Архистратига Михаила в Каннах с подготовкой к деплою на Render.

## Структура

- `frontend/` — статический сайт.
- `backend/` — Node backend API.
- `render.yaml` — Render Blueprint для frontend и backend.
- `frontend/structure.md` — рекомендуемая структура полноценного сайта.

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
