import { MEDIA_BUCKET, fileExtension, slugify, validateUploadFile } from "./adminConfig";
import { escapeHtml } from "./shared";
import type { AdminSectionConfig, LanguageCode, ParishNews, ParishNewsPhoto } from "./types";

type SupabaseClientLike = any;
type StoredNewsPhoto = ParishNewsPhoto & { storage_path?: string | null };

interface AdminNewsOptions {
  $: (id: string) => HTMLElement | null;
  setText: (id: string, text: string) => void;
  getClient: () => SupabaseClientLike | null;
  getSection: () => AdminSectionConfig;
  getLanguage: () => LanguageCode;
}

interface NewsFields {
  id: HTMLInputElement;
  date: HTMLInputElement;
  title: HTMLInputElement;
  excerpt: HTMLTextAreaElement;
  body: HTMLTextAreaElement;
  status: HTMLSelectElement;
  photos: HTMLInputElement;
}

function requiredElement<T extends HTMLElement>(lookup: (id: string) => HTMLElement | null, id: string): T {
  const element = lookup(id);
  if (!element) throw new Error(`Missing admin news element: ${id}`);
  return element as T;
}

export function createAdminNews(options: AdminNewsOptions) {
  let newsRecords: ParishNews[] = [];
  let newsPhotos: StoredNewsPhoto[] = [];

  const fields: NewsFields = {
    id: requiredElement(options.$, "news-id"),
    date: requiredElement(options.$, "news-date"),
    title: requiredElement(options.$, "news-title"),
    excerpt: requiredElement(options.$, "news-excerpt"),
    body: requiredElement(options.$, "news-body"),
    status: requiredElement(options.$, "news-status"),
    photos: requiredElement(options.$, "news-photos")
  };

  const isNewsSection = (): boolean => options.getSection().newsManager === true;

  const payload = () => ({
    language: options.getLanguage(),
    title: fields.title.value.trim(),
    excerpt: fields.excerpt.value.trim(),
    body: fields.body.value.trim(),
    event_date: fields.date.value,
    status: fields.status.value,
    updated_at: new Date().toISOString()
  });

  const clearForm = (): void => {
    fields.id.value = "";
    fields.date.value = new Date().toISOString().slice(0, 10);
    fields.title.value = "";
    fields.excerpt.value = "";
    fields.body.value = "";
    fields.status.value = "published";
    fields.photos.value = "";
    renderRecords();
  };

  const fillForm = (record: ParishNews): void => {
    fields.id.value = record.id || "";
    fields.date.value = record.event_date || new Date().toISOString().slice(0, 10);
    fields.title.value = record.title || "";
    fields.excerpt.value = record.excerpt || "";
    fields.body.value = record.body || "";
    fields.status.value = record.status || "published";
    fields.photos.value = "";
    renderRecords();
    options.setText("editor-status", `Выбрана новость: ${record.title}.`);
  };

  const renderRecords = (): void => {
    const list = options.$("news-list");
    if (!list) return;
    list.innerHTML = "";

    if (!newsRecords.length) {
      list.innerHTML = '<div class="admin-empty">Новостей пока нет.</div>';
      return;
    }

    newsRecords.forEach((record) => {
      const count = newsPhotos.filter((photo) => photo.news_id === record.id).length;
      const button = document.createElement("button");
      button.type = "button";
      button.className = `admin-row${record.id === fields.id.value ? " is-selected" : ""}`;
      button.innerHTML = `<strong>${escapeHtml(record.title)}</strong><br><span>${escapeHtml(record.event_date)} · ${escapeHtml(record.status)} · фото: ${count}</span>`;
      button.addEventListener("click", () => fillForm(record));
      list.appendChild(button);
    });
  };

  const clearRecords = (): void => {
    newsRecords = [];
    newsPhotos = [];
    renderRecords();
  };

  const loadRecords = async (): Promise<void> => {
    const client = options.getClient();
    if (!client || !isNewsSection()) return;

    const [{ data: news, error }, { data: photos }] = await Promise.all([
      client
        .from("parish_news")
        .select("*")
        .eq("language", options.getLanguage())
        .order("event_date", { ascending: false }),
      client
        .from("parish_news_photos")
        .select("*")
        .order("sort_order", { ascending: true })
    ]);

    if (error) {
      clearRecords();
      options.setText("editor-status", `Ошибка чтения новостей: ${error.message}`);
      return;
    }

    newsRecords = news || [];
    newsPhotos = photos || [];
    renderRecords();
    if (!fields.id.value) clearForm();
  };

  const uploadPhotos = async (newsId: string): Promise<boolean> => {
    const client = options.getClient();
    const files = Array.from(fields.photos.files || []);
    if (!client || !files.length) return true;

    const rows = [];
    for (const [index, file] of files.entries()) {
      const validation = validateUploadFile(file, options.getSection());
      if (!validation.ok) {
        options.setText("editor-status", validation.message || "Файл не прошел проверку.");
        return false;
      }
      if (!file.type.startsWith("image/")) {
        options.setText("editor-status", "К новости можно загружать только фотографии.");
        return false;
      }

      const extension = fileExtension(file);
      const safeName = slugify(file.name.replace(/\.[^.]+$/, ""));
      const path = `news/${newsId}/${Date.now()}-${index}-${safeName}.${extension}`;
      const { error: uploadError } = await client.storage.from(MEDIA_BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: false
      });
      if (uploadError) {
        options.setText("editor-status", `Ошибка загрузки фото новости: ${uploadError.message}`);
        return false;
      }

      const { data } = client.storage.from(MEDIA_BUCKET).getPublicUrl(path);
      rows.push({
        news_id: newsId,
        title: file.name,
        file_url: data.publicUrl,
        storage_path: path,
        file_name: file.name,
        mime_type: file.type,
        file_size: file.size,
        sort_order: index
      });
    }

    const { error } = await client.from("parish_news_photos").insert(rows);
    if (error) {
      options.setText("editor-status", `Ошибка сохранения фото новости: ${error.message}`);
      return false;
    }
    return true;
  };

  const save = async (event: Event): Promise<void> => {
    event.preventDefault();
    const client = options.getClient();
    if (!client || !isNewsSection()) return;

    const nextPayload = payload();
    if (!nextPayload.title || !nextPayload.event_date) {
      options.setText("editor-status", "У новости должны быть дата и заголовок.");
      return;
    }

    let id = fields.id.value;
    if (id) {
      const { error } = await client.from("parish_news").update(nextPayload).eq("id", id);
      if (error) {
        options.setText("editor-status", `Ошибка сохранения новости: ${error.message}`);
        return;
      }
    } else {
      const { data, error } = await client.from("parish_news").insert(nextPayload).select("id").single();
      if (error) {
        options.setText("editor-status", `Ошибка создания новости: ${error.message}`);
        return;
      }
      id = data.id;
      fields.id.value = id;
    }

    const photosOk = await uploadPhotos(id);
    if (!photosOk) return;

    await loadRecords();
    clearForm();
    options.setText("editor-status", "Новость сохранена.");
  };

  const remove = async (): Promise<void> => {
    const client = options.getClient();
    const id = fields.id.value;
    if (!client || !id) {
      options.setText("editor-status", "Сначала выберите новость в списке.");
      return;
    }

    const record = newsRecords.find((item) => item.id === id);
    if (!window.confirm(`Удалить новость «${record ? record.title : ""}»?`)) return;

    const photos = newsPhotos.filter((photo) => photo.news_id === id && photo.storage_path);
    if (photos.length) {
      await client.storage.from(MEDIA_BUCKET).remove(photos.map((photo) => photo.storage_path));
    }

    const { error } = await client.from("parish_news").delete().eq("id", id);
    if (error) {
      options.setText("editor-status", `Ошибка удаления новости: ${error.message}`);
      return;
    }

    clearForm();
    await loadRecords();
    options.setText("editor-status", "Новость удалена.");
  };

  const bindEvents = (): void => {
    requiredElement<HTMLFormElement>(options.$, "news-form").addEventListener("submit", save);
    requiredElement<HTMLButtonElement>(options.$, "clear-news-button").addEventListener("click", clearForm);
    requiredElement<HTMLButtonElement>(options.$, "delete-news-button").addEventListener("click", remove);
  };

  return {
    bindEvents,
    clearForm,
    clearRecords,
    loadRecords,
    renderRecords
  };
}
