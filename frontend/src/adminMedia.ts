import { buttonFeedback } from "./adminFeedback";
import { MEDIA_BUCKET, fileExtension, slugify, validateUploadFile } from "./adminConfig";
import { escapeHtml } from "./shared";
import type { AdminSectionConfig, MediaFile } from "./types";

type SupabaseClientLike = any;
type StoredMediaFile = MediaFile & { storage_path?: string | null };

interface AdminMediaOptions {
  $: (id: string) => HTMLElement | null;
  setText: (id: string, text: string) => void;
  getClient: () => SupabaseClientLike | null;
  getSection: () => AdminSectionConfig;
}

interface MediaFields {
  id: HTMLInputElement;
  purpose: HTMLSelectElement;
  file: HTMLInputElement;
  title: HTMLInputElement;
  description: HTMLTextAreaElement;
  sort: HTMLInputElement;
  status: HTMLSelectElement;
}

function requiredElement<T extends HTMLElement>(lookup: (id: string) => HTMLElement | null, id: string): T {
  const element = lookup(id);
  if (!element) throw new Error(`Missing admin media element: ${id}`);
  return element as T;
}

function isPdfFile(file: File | null | undefined): boolean {
  return Boolean(file && (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")));
}

export function createAdminMedia(options: AdminMediaOptions) {
  let mediaRecords: StoredMediaFile[] = [];

  const fields: MediaFields = {
    id: requiredElement(options.$, "media-id"),
    purpose: requiredElement(options.$, "media-purpose"),
    file: requiredElement(options.$, "media-file"),
    title: requiredElement(options.$, "media-title"),
    description: requiredElement(options.$, "media-description"),
    sort: requiredElement(options.$, "media-sort"),
    status: requiredElement(options.$, "media-status")
  };

  const hasEditor = (): boolean => {
    const section = options.getSection();
    return Array.isArray(section.media) && section.media.length > 0;
  };

  const payload = (publicUrl: string, storagePath: string, file?: File) => {
    const section = options.getSection();
    return {
      page_key: section.key,
      purpose: fields.purpose.value,
      title: fields.title.value.trim() || (file ? file.name : ""),
      description: fields.description.value.trim(),
      file_url: publicUrl,
      storage_path: storagePath,
      file_name: file ? file.name : undefined,
      mime_type: file ? file.type : undefined,
      file_size: file ? file.size : undefined,
      status: fields.status.value,
      sort_order: Number(fields.sort.value || 0),
      updated_at: new Date().toISOString()
    };
  };

  const renderPurposes = (): void => {
    const panel = options.$("media-panel");
    const section = options.getSection();
    if (panel) panel.hidden = !hasEditor();
    fields.purpose.innerHTML = "";

    if (!hasEditor()) {
      fields.file.accept = "";
      fields.file.multiple = false;
      return;
    }

    section.media.forEach(([key, label]) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = label;
      fields.purpose.appendChild(option);
    });

    fields.file.accept = section.scheduleFileOnly
      ? "image/*,.pdf,application/pdf"
      : section.pdfOnly
        ? ".pdf,application/pdf"
        : section.imagesOnly
          ? "image/*"
          : "image/*,.pdf,.doc,.docx,.xls,.xlsx";
    fields.file.multiple = Boolean(section.imagesOnly);
  };

  const clearForm = (): void => {
    fields.id.value = "";
    fields.file.value = "";
    fields.title.value = "";
    fields.description.value = "";
    fields.sort.value = "0";
    fields.status.value = "published";
    renderRecords();
  };

  const fillForm = (record: StoredMediaFile): void => {
    fields.id.value = record.id || "";
    fields.purpose.value = record.purpose || (hasEditor() ? options.getSection().media[0][0] : "");
    fields.file.value = "";
    fields.title.value = record.title || "";
    fields.description.value = record.description || "";
    fields.sort.value = String(record.sort_order || 0);
    fields.status.value = record.status || "published";
    renderRecords();
    options.setText("editor-status", `Выбрано: ${record.title || record.file_name || "фото/файл"}.`);
  };

  const renderRecords = (): void => {
    const list = options.$("media-list");
    if (!list) return;
    list.innerHTML = "";

    if (!mediaRecords.length) {
      list.innerHTML = '<div class="admin-empty">Для этого раздела пока нет загруженных файлов.</div>';
      return;
    }

    const section = options.getSection();
    mediaRecords.forEach((record) => {
      const label = (section.media.find(([key]) => key === record.purpose) || [record.purpose, record.purpose])[1];
      const button = document.createElement("button");
      button.type = "button";
      button.className = `admin-row admin-media-row${record.id === fields.id.value ? " is-selected" : ""}`;
      const preview = record.mime_type && record.mime_type.startsWith("image/") && record.file_url
        ? `<img src="${escapeHtml(record.file_url)}" alt="">`
        : `<span class="admin-file-chip">${escapeHtml(record.mime_type || "file")}</span>`;
      button.innerHTML = `${preview}<span><strong>${escapeHtml(record.title || record.file_name || "Без названия")}</strong><br><small>${escapeHtml(label)} · ${escapeHtml(record.status)}</small></span>`;
      button.addEventListener("click", () => fillForm(record));
      list.appendChild(button);
    });
  };

  const clearRecords = (): void => {
    mediaRecords = [];
    renderRecords();
  };

  const loadRecords = async (): Promise<void> => {
    const client = options.getClient();
    const section = options.getSection();
    if (!client || !hasEditor()) {
      clearRecords();
      return;
    }

    const { data, error } = await client
      .from("media_files")
      .select("*")
      .eq("page_key", section.key)
      .order("purpose", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error) {
      mediaRecords = [];
      renderRecords();
      options.setText("editor-status", `Ошибка чтения файлов: ${error.message}`);
      return;
    }

    mediaRecords = data || [];
    renderRecords();
  };

  const saveMultipleImages = async (files: File[]): Promise<boolean> => {
    const client = options.getClient();
    const section = options.getSection();
    if (!client) return false;

    const startSort = Number(fields.sort.value || mediaRecords.length || 0);
    const rows = [];
    for (const [index, uploadFile] of files.entries()) {
      const validation = validateUploadFile(uploadFile, section);
      if (!validation.ok) {
        options.setText("editor-status", validation.message || "Файл не прошел проверку.");
        return false;
      }
      if (!uploadFile.type.startsWith("image/")) {
        options.setText("editor-status", "В раздел «Галерея» можно загружать только фотографии.");
        return false;
      }

      const extension = fileExtension(uploadFile);
      const safeName = slugify(uploadFile.name.replace(/\.[^.]+$/, ""));
      const path = `${section.key}/${fields.purpose.value}/${Date.now()}-${index}-${safeName}.${extension}`;
      const { error: uploadError } = await client.storage.from(MEDIA_BUCKET).upload(path, uploadFile, {
        cacheControl: "3600",
        upsert: false
      });
      if (uploadError) {
        options.setText("editor-status", `Ошибка загрузки файла: ${uploadError.message}`);
        return false;
      }

      const { data } = client.storage.from(MEDIA_BUCKET).getPublicUrl(path);
      rows.push({
        page_key: section.key,
        purpose: fields.purpose.value,
        title: fields.title.value.trim() || uploadFile.name,
        description: fields.description.value.trim(),
        file_url: data.publicUrl,
        storage_path: path,
        file_name: uploadFile.name,
        mime_type: uploadFile.type,
        file_size: uploadFile.size,
        status: fields.status.value,
        sort_order: startSort + index,
        updated_at: new Date().toISOString()
      });
    }

    const { error } = await client.from("media_files").insert(rows);
    if (error) {
      options.setText("editor-status", `Ошибка сохранения файлов: ${error.message}`);
      return false;
    }

    clearForm();
    await loadRecords();
    options.setText("editor-status", `Загружено фотографий: ${rows.length}.`);
    return true;
  };

  const save = async (event: Event): Promise<void> => {
    event.preventDefault();
    const feedback = buttonFeedback(event, requiredElement<HTMLButtonElement>(options.$, "save-media-button"));
    feedback.start("Сохраняем...");
    const client = options.getClient();
    const section = options.getSection();
    if (!client || !hasEditor()) {
      feedback.fail("Недоступно");
      return;
    }

    const files = Array.from(fields.file.files || []);
    const file = files[0];
    const current = mediaRecords.find((record) => record.id === fields.id.value);
    let publicUrl = current ? current.file_url || "" : "";
    let storagePath = current ? current.storage_path || "" : "";

    if (section.imagesOnly && !fields.id.value && files.length > 1) {
      const ok = await saveMultipleImages(files);
      if (ok) feedback.success("Загружено");
      else feedback.fail("Ошибка");
      return;
    }

    if (file) {
      const validation = validateUploadFile(file, section);
      if (!validation.ok) {
        options.setText("editor-status", validation.message || "Файл не прошел проверку.");
        feedback.fail("Проверьте файл");
        return;
      }
      if (section.imagesOnly && !file.type.startsWith("image/")) {
        options.setText("editor-status", "В раздел «Галерея» можно загружать только фотографии.");
        feedback.fail("Не фото");
        return;
      }
      if (section.pdfOnly && !isPdfFile(file)) {
        options.setText("editor-status", "В расписание можно загрузить только PDF-файл.");
        feedback.fail("Не PDF");
        return;
      }

      const extension = fileExtension(file);
      const safeName = slugify(file.name.replace(/\.[^.]+$/, ""));
      storagePath = `${section.key}/${fields.purpose.value}/${Date.now()}-${safeName}.${extension}`;
      const { error: uploadError } = await client.storage.from(MEDIA_BUCKET).upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false
      });

      if (uploadError) {
        options.setText("editor-status", `Ошибка загрузки файла: ${uploadError.message}`);
        feedback.fail("Ошибка загрузки");
        return;
      }

      const { data } = client.storage.from(MEDIA_BUCKET).getPublicUrl(storagePath);
      publicUrl = data.publicUrl;
    }

    if (!publicUrl) {
      options.setText("editor-status", "Выберите файл для загрузки.");
      feedback.fail("Выберите файл");
      return;
    }

    const query = fields.id.value
      ? client.from("media_files").update(payload(publicUrl, storagePath, file)).eq("id", fields.id.value)
      : client.from("media_files").insert(payload(publicUrl, storagePath, file));

    const { error } = await query;
    if (error) {
      options.setText("editor-status", `Ошибка сохранения файла: ${error.message}`);
      feedback.fail("Ошибка");
      return;
    }

    clearForm();
    await loadRecords();
    options.setText("editor-status", "Файл сохранен.");
    feedback.success("Сохранено");
  };

  const remove = async (): Promise<void> => {
    const client = options.getClient();
    const id = fields.id.value;
    if (!client) return;
    if (!id) {
      options.setText("editor-status", "Сначала выберите фото или файл в списке ниже.");
      return;
    }

    const record = mediaRecords.find((item) => item.id === id);
    const name = record ? (record.title || record.file_name || "этот файл") : "этот файл";
    if (!window.confirm(`Удалить «${name}»?`)) return;

    let storageWarning = "";
    if (record?.storage_path) {
      const { error: storageError } = await client.storage.from(MEDIA_BUCKET).remove([record.storage_path]);
      if (storageError) storageWarning = ` Файл в хранилище не удалён: ${storageError.message}`;
    }

    const { error } = await client.from("media_files").delete().eq("id", id);
    if (error) {
      options.setText("editor-status", `Ошибка удаления файла: ${error.message}`);
      return;
    }

    clearForm();
    await loadRecords();
    options.setText("editor-status", `Файл удалён из сайта.${storageWarning}`);
  };

  const bindEvents = (): void => {
    requiredElement<HTMLFormElement>(options.$, "media-form").addEventListener("submit", save);
    requiredElement<HTMLButtonElement>(options.$, "clear-media-button").addEventListener("click", clearForm);
    requiredElement<HTMLButtonElement>(options.$, "delete-media-button").addEventListener("click", remove);
  };

  return {
    bindEvents,
    clearForm,
    clearRecords,
    hasEditor,
    loadRecords,
    renderPurposes,
    renderRecords
  };
}
