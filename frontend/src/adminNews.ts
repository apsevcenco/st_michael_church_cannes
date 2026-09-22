import { MEDIA_BUCKET, fileExtension, slugify, validateUploadFile } from "./adminConfig";
import { buttonFeedback } from "./adminFeedback";
import { createRichTextEditor } from "./adminRichText";
import { translateBlock } from "./adminTranslate";
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
  const excerptEditor = createRichTextEditor(fields.excerpt);
  const bodyEditor = createRichTextEditor(fields.body);
  const richEditors = [excerptEditor, bodyEditor];

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
    excerptEditor.setValue("");
    bodyEditor.setValue("");
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
    excerptEditor.setValue(record.excerpt || "");
    bodyEditor.setValue(record.body || "");
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

  const ensureTranslationGroup = async (sourceId: string): Promise<string> => {
    const client = options.getClient();
    const current = newsRecords.find((item) => item.id === sourceId);
    const groupId = current?.translation_group_id || sourceId;
    if (!current?.translation_group_id) {
      const { error } = await client.from("parish_news").update({ translation_group_id: groupId }).eq("id", sourceId);
      if (error) throw new Error(error.message);
    }
    return groupId;
  };

  const copyPhotosToTranslation = async (sourceId: string, targetId: string): Promise<void> => {
    const client = options.getClient();
    const sourcePhotos = newsPhotos.filter((photo) => photo.news_id === sourceId);
    if (!sourcePhotos.length) return;

    const { data: existingPhotos } = await client.from("parish_news_photos").select("id").eq("news_id", targetId).limit(1);
    if (existingPhotos?.length) return;

    const rows = sourcePhotos.map((photo) => ({
      news_id: targetId,
      title: photo.title || photo.file_name || "",
      description: photo.description || "",
      file_url: photo.file_url,
      storage_path: photo.storage_path || null,
      file_name: photo.file_name || null,
      mime_type: photo.mime_type || null,
      file_size: photo.file_size || null,
      sort_order: photo.sort_order || 0,
    }));

    const { error } = await client.from("parish_news_photos").insert(rows);
    if (error) throw new Error(error.message);
  };

  const saveTranslatedNews = async (language: LanguageCode, groupId: string, translated: Record<string, string>): Promise<void> => {
    const client = options.getClient();
    const sourceId = fields.id.value;
    const nextPayload = {
      translation_group_id: groupId,
      language,
      title: translated.title || "",
      excerpt: translated.excerpt || "",
      body: translated.body || "",
      event_date: fields.date.value,
      status: fields.status.value,
      updated_at: new Date().toISOString(),
    };

    const { data: existing, error: findError } = await client
      .from("parish_news")
      .select("id")
      .eq("translation_group_id", groupId)
      .eq("language", language)
      .maybeSingle();

    if (findError) throw new Error(findError.message);

    if (existing?.id) {
      const { error } = await client.from("parish_news").update(nextPayload).eq("id", existing.id);
      if (error) throw new Error(error.message);
      await copyPhotosToTranslation(sourceId, existing.id);
      return;
    }

    const { data, error } = await client.from("parish_news").insert(nextPayload).select("id").single();
    if (error) throw new Error(error.message);
    await copyPhotosToTranslation(sourceId, data.id);
  };

  const translateCurrentNews = async (event: Event): Promise<void> => {
    const feedback = buttonFeedback(event, requiredElement<HTMLButtonElement>(options.$, "translate-news-button"));
    feedback.start("Перевод...");
    richEditors.forEach((editor) => editor.syncToTextarea());
    const client = options.getClient();
    if (!client || !isNewsSection()) {
      feedback.fail("Недоступно");
      return;
    }
    if (options.getLanguage() !== "ru") {
      options.setText("editor-status", "Автоперевод новости запускается из русской вкладки RU.");
      feedback.fail("Откройте RU");
      return;
    }
    if (!fields.id.value) {
      options.setText("editor-status", "Сначала сохраните русскую новость, затем запускайте перевод.");
      feedback.fail("Сохраните RU");
      return;
    }

    try {
      const groupId = await ensureTranslationGroup(fields.id.value);
      const translations = await translateBlock(client, "ru", "Новость прихода", {
        title: fields.title.value.trim(),
        excerpt: fields.excerpt.value.trim(),
        body: fields.body.value.trim(),
      });

      for (const language of ["fr", "en"] as LanguageCode[]) {
        if (translations[language]) await saveTranslatedNews(language, groupId, translations[language] || {});
      }

      await loadRecords();
      options.setText("editor-status", "Новость переведена на FR/EN. Откройте языковые вкладки, чтобы проверить и поправить текст.");
      feedback.success("Переведено");
    } catch (error) {
      options.setText("editor-status", `Ошибка перевода новости: ${error instanceof Error ? error.message : "неизвестная ошибка"}`);
      feedback.fail("Ошибка");
    }
  };

  const save = async (event: Event): Promise<void> => {
    event.preventDefault();
    const feedback = buttonFeedback(event, requiredElement<HTMLButtonElement>(options.$, "save-news-button"));
    feedback.start();
    richEditors.forEach((editor) => editor.syncToTextarea());
    const client = options.getClient();
    if (!client || !isNewsSection()) {
      feedback.fail("Недоступно");
      return;
    }

    const nextPayload = payload();
    if (!nextPayload.title || !nextPayload.event_date) {
      options.setText("editor-status", "У новости должны быть дата и заголовок.");
      feedback.fail("Заполните поля");
      return;
    }

    let id = fields.id.value;
    if (id) {
      const { error } = await client.from("parish_news").update(nextPayload).eq("id", id);
      if (error) {
        options.setText("editor-status", `Ошибка сохранения новости: ${error.message}`);
        feedback.fail("Ошибка");
        return;
      }
    } else {
      const { data, error } = await client.from("parish_news").insert(nextPayload).select("id").single();
      if (error) {
        options.setText("editor-status", `Ошибка создания новости: ${error.message}`);
        feedback.fail("Ошибка");
        return;
      }
      id = data.id;
      fields.id.value = id;
      await client.from("parish_news").update({ translation_group_id: id }).eq("id", id);
    }

    const photosOk = await uploadPhotos(id);
    if (!photosOk) {
      feedback.fail("Ошибка фото");
      return;
    }

    await loadRecords();
    clearForm();
    options.setText("editor-status", "Новость сохранена.");
    feedback.success();
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
    requiredElement<HTMLButtonElement>(options.$, "translate-news-button").addEventListener("click", translateCurrentNews);
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
