import type { AdminSectionConfig } from "./types";

export const MEDIA_BUCKET = "parish-media";

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const ALLOWED_DOCUMENT_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]);
const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "pdf", "doc", "docx", "xls", "xlsx"]);

export const adminSections: AdminSectionConfig[] = [
  {
    key: "home",
    title: "Главная",
    description: "Главная страница. Новости на ней берутся из раздела «Новости».",
    blocks: [
      ["hero", "Верхний экран"],
      ["body", "Вводный текст"]
    ],
    media: []
  },
  {
    key: "history",
    title: "История",
    description: "Текст истории храма и фотографии, которые показываются на странице истории.",
    blocks: [
      ["hero", "Заголовок страницы"],
      ["body", "Текст истории"],
      ["details", "Дополнительный блок"]
    ],
    media: [["history_gallery", "Фотографии истории"]],
    imagesOnly: true
  },
  {
    key: "gallery",
    title: "Галерея",
    description: "Отдельная фотогалерея прихода. Здесь загружаются только фотографии.",
    blocks: [
      ["hero", "Заголовок страницы"],
      ["body", "Вводный текст"]
    ],
    media: [["gallery", "Фотографии галереи"]],
    imagesOnly: true
  },
  {
    key: "schedule",
    title: "Богослужения",
    description: "Текст расписания и один PDF-файл расписания, который открывается на странице богослужений.",
    blocks: [
      ["hero", "Заголовок страницы"],
      ["body", "Текст расписания"]
    ],
    media: [["schedule_pdf", "PDF расписания богослужений"]],
    scheduleFileOnly: true
  },
  {
    key: "sacraments",
    title: "Таинства",
    description: "Общая страница с кнопками перехода к таинствам и требам. Тексты редактируются в отдельных разделах ниже.",
    blocks: [],
    media: []
  },
  {
    key: "baptism",
    title: "Крещение",
    description: "Страница Крещения: заголовок, основной текст и порядок подготовки.",
    blocks: [
      ["hero", "Заголовок страницы"],
      ["body", "Основной текст"],
      ["details", "Порядок подготовки"]
    ],
    media: [["document", "Документ для Крещения"]]
  },
  {
    key: "wedding",
    title: "Венчание",
    description: "Страница Венчания: заголовок, основной текст и порядок подготовки.",
    blocks: [
      ["hero", "Заголовок страницы"],
      ["body", "Основной текст"],
      ["details", "Порядок подготовки"]
    ],
    media: [["document", "Документ для Венчания"]]
  },
  {
    key: "confession",
    title: "Исповедь",
    description: "Страница Исповеди: заголовок, основной текст и дополнительные пояснения.",
    blocks: [
      ["hero", "Заголовок страницы"],
      ["body", "Основной текст"],
      ["details", "Дополнительные пояснения"]
    ],
    media: [["document", "Материал для Исповеди"]]
  },
  {
    key: "communion",
    title: "Причастие",
    description: "Страница Причастия: заголовок, основной текст и дополнительные пояснения.",
    blocks: [
      ["hero", "Заголовок страницы"],
      ["body", "Основной текст"],
      ["details", "Дополнительные пояснения"]
    ],
    media: [["document", "Материал для Причастия"]]
  },
  {
    key: "notes",
    title: "Записки",
    description: "Страница записок: текст о поминовении, правила подачи имен и бланк при необходимости.",
    blocks: [
      ["hero", "Заголовок страницы"],
      ["body", "Основной текст"],
      ["details", "Правила написания"]
    ],
    media: [["document", "Бланк или документ"]]
  },
  {
    key: "meeting",
    title: "Беседа",
    description: "Страница записи на беседу со священником.",
    blocks: [
      ["hero", "Заголовок страницы"],
      ["body", "Основной текст"],
      ["contacts", "Как записаться"]
    ],
    media: [["document", "Документ"]]
  },
  {
    key: "help",
    title: "Помочь храму",
    description: "Банковские реквизиты, текст онлайн-пожертвования и файл с реквизитами.",
    blocks: [
      ["hero", "Заголовок страницы"],
      ["donation", "Банковские реквизиты"],
      ["details", "Онлайн-пожертвование"]
    ],
    media: [["donation_file", "Файл с реквизитами"]]
  },
  {
    key: "contacts",
    title: "Контакты",
    description: "Адрес, телефон, email, карта и маршрут.",
    blocks: [
      ["hero", "Заголовок страницы"],
      ["contacts", "Контактные данные"],
      ["details", "Карта и маршрут"]
    ],
    media: []
  },
  {
    key: "visit",
    title: "Посетителям",
    description: "Информация для гостей храма: как добраться и как подготовиться к посещению.",
    blocks: [
      ["hero", "Заголовок страницы"],
      ["body", "Основной текст"],
      ["details", "Правила посещения"]
    ],
    media: []
  },
  {
    key: "news",
    title: "Новости",
    description: "Календарные новости прихода с датой, текстом и фотографиями. Последние три показываются на главной.",
    blocks: [],
    media: [],
    newsManager: true
  },
  {
    key: "stats",
    title: "Статистика",
    description: "Базовая статистика посещений сайта за последние 30 дней.",
    blocks: [],
    media: [],
    statsManager: true
  }
];

export interface UploadValidationResult {
  ok: boolean;
  message?: string;
}

export function fileExtension(file: File | null | undefined): string {
  const extension = String(file?.name ? file.name.split(".").pop() : "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  return ALLOWED_EXTENSIONS.has(extension) ? extension : "";
}

export function slugify(value: string): string {
  return String(value || "file")
    .toLowerCase()
    .replace(/[^a-z0-9а-яё._-]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function validateUploadFile(file: File | null | undefined, section: AdminSectionConfig): UploadValidationResult {
  if (!file) return { ok: true };

  const extension = fileExtension(file);
  if (!extension) return { ok: false, message: "Недопустимое расширение файла." };

  if (section.imagesOnly || file.type.startsWith("image/")) {
    if (!ALLOWED_IMAGE_TYPES.has(file.type) || !extension) {
      return { ok: false, message: "Можно загружать только JPG, PNG, WEBP или GIF." };
    }
    if (file.size > MAX_IMAGE_SIZE) return { ok: false, message: "Фото слишком большое. Максимум 8 МБ." };
    return { ok: true };
  }

  if (section.scheduleFileOnly) {
    const isScheduleFile = (file.type === "application/pdf" && extension === "pdf") || file.type.startsWith("image/");
    if (!isScheduleFile) return { ok: false, message: "В расписание можно загрузить только PDF или изображение." };
    if (file.size > MAX_DOCUMENT_SIZE) return { ok: false, message: "Файл слишком большой. Максимум 20 МБ." };
    return { ok: true };
  }

  if (section.pdfOnly) {
    if (!(file.type === "application/pdf" && extension === "pdf")) return { ok: false, message: "В этот раздел можно загрузить только PDF." };
    if (file.size > MAX_DOCUMENT_SIZE) return { ok: false, message: "PDF слишком большой. Максимум 20 МБ." };
    return { ok: true };
  }

  if (!ALLOWED_DOCUMENT_TYPES.has(file.type)) return { ok: false, message: "Разрешены только изображения, PDF, DOC/DOCX и XLS/XLSX." };
  if (file.size > MAX_DOCUMENT_SIZE) return { ok: false, message: "Файл слишком большой. Максимум 20 МБ." };
  return { ok: true };
}
