import { createRichTextEditor } from "./adminRichText";
import { escapeHtml } from "./shared";
import type { AdminSectionConfig, ContentSection, LanguageCode } from "./types";

type SupabaseClientLike = any;

interface AdminContentOptions {
  $: (id: string) => HTMLElement | null;
  setText: (id: string, text: string) => void;
  getClient: () => SupabaseClientLike | null;
  getSection: () => AdminSectionConfig;
  getLanguage: () => LanguageCode;
}

interface ContentFields {
  id: HTMLInputElement;
  section: HTMLInputElement;
  title: HTMLInputElement;
  summary: HTMLTextAreaElement;
  body: HTMLTextAreaElement;
  status: HTMLSelectElement;
}

function requiredElement<T extends HTMLElement>(lookup: (id: string) => HTMLElement | null, id: string): T {
  const element = lookup(id);
  if (!element) throw new Error(`Missing admin content element: ${id}`);
  return element as T;
}

export function createAdminContent(options: AdminContentOptions) {
  let activeBlock = "hero";
  let contentRecords: ContentSection[] = [];

  const fields: ContentFields = {
    id: requiredElement(options.$, "content-id"),
    section: requiredElement(options.$, "content-section"),
    title: requiredElement(options.$, "content-title"),
    summary: requiredElement(options.$, "content-summary"),
    body: requiredElement(options.$, "content-body"),
    status: requiredElement(options.$, "content-status")
  };
  const summaryEditor = createRichTextEditor(fields.summary);
  const bodyEditor = createRichTextEditor(fields.body);
  const richEditors = [summaryEditor, bodyEditor];

  const hasEditor = (): boolean => {
    const section = options.getSection();
    return Array.isArray(section.blocks) && section.blocks.length > 0;
  };

  const setSection = (section: AdminSectionConfig): void => {
    activeBlock = hasEditor() ? section.blocks[0][0] : "";
  };

  const payload = () => {
    const section = options.getSection();
    return {
      page_key: section.key,
      language: options.getLanguage(),
      section_key: activeBlock,
      title: fields.title.value.trim(),
      summary: fields.summary.value.trim(),
      body: fields.body.value.trim(),
      status: fields.status.value,
      sort_order: hasEditor() ? section.blocks.findIndex(([key]) => key === activeBlock) : 0,
      updated_at: new Date().toISOString()
    };
  };

  const clearForm = (): void => {
    fields.id.value = "";
    fields.section.value = activeBlock;
    fields.title.value = "";
    fields.summary.value = "";
    fields.body.value = "";
    summaryEditor.setValue("");
    bodyEditor.setValue("");
    fields.status.value = "published";
  };

  const fillForm = (record: ContentSection): void => {
    fields.id.value = record.id || "";
    fields.section.value = record.section_key || activeBlock;
    fields.title.value = record.title || "";
    fields.summary.value = record.summary || "";
    fields.body.value = record.body || "";
    summaryEditor.setValue(record.summary || "");
    bodyEditor.setValue(record.body || "");
    fields.status.value = record.status || "published";
  };

  const fillFromExisting = (): void => {
    const record = contentRecords.find((item) => item.section_key === activeBlock);
    if (record) fillForm(record);
  };

  const selectBlock = (key: string): void => {
    if (!hasEditor()) return;
    activeBlock = key;
    clearForm();
    renderBlockTabs();
    fillFromExisting();
  };

  const renderBlockTabs = (): void => {
    const panel = options.$("content-panel");
    const tabs = requiredElement(options.$, "content-block-tabs");
    if (panel) panel.hidden = !hasEditor();
    tabs.innerHTML = "";
    if (!hasEditor()) return;

    options.getSection().blocks.forEach(([key, label]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = key === activeBlock ? "active" : "";
      button.textContent = label;
      button.addEventListener("click", () => selectBlock(key));
      tabs.appendChild(button);
    });
  };

  const renderRecords = (): void => {
    const list = options.$("content-list");
    if (!list || !hasEditor()) return;
    list.innerHTML = "";

    if (!contentRecords.length) {
      list.innerHTML = '<div class="admin-empty">Для этого языка пока нет сохраненных текстов.</div>';
      return;
    }

    const section = options.getSection();
    contentRecords.forEach((record) => {
      const label = (section.blocks.find(([key]) => key === record.section_key) || [record.section_key, record.section_key])[1];
      const button = document.createElement("button");
      button.type = "button";
      button.className = "admin-row";
      button.innerHTML = `<strong>${escapeHtml(label)}</strong><br><span>${escapeHtml(record.title || "Без заголовка")} · ${escapeHtml(record.status)}</span>`;
      button.addEventListener("click", () => {
        activeBlock = record.section_key;
        renderBlockTabs();
        fillForm(record);
      });
      list.appendChild(button);
    });
  };

  const clearRecords = (): void => {
    contentRecords = [];
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
      .from("content_sections")
      .select("*")
      .eq("page_key", section.key)
      .eq("language", options.getLanguage())
      .order("sort_order", { ascending: true });

    if (error) {
      contentRecords = [];
      renderRecords();
      options.setText("editor-status", `Ошибка чтения текстов: ${error.message}`);
      return;
    }

    contentRecords = data || [];
    renderRecords();
    fillFromExisting();
    options.setText("editor-status", `Раздел «${section.title}» загружен.`);
  };

  const save = async (event: Event): Promise<void> => {
    event.preventDefault();
    richEditors.forEach((editor) => editor.syncToTextarea());
    const client = options.getClient();
    if (!client || !hasEditor()) return;

    const existing = contentRecords.find((item) => item.section_key === activeBlock);
    const id = fields.id.value || existing?.id;
    const query = id
      ? client.from("content_sections").update(payload()).eq("id", id)
      : client.from("content_sections").insert(payload());

    const { error } = await query;
    if (error) {
      options.setText("editor-status", `Ошибка сохранения текста: ${error.message}`);
      return;
    }

    await loadRecords();
    options.setText("editor-status", "Текст сохранен.");
  };

  const remove = async (): Promise<void> => {
    const client = options.getClient();
    const id = fields.id.value;
    if (!client || !id) return;

    const { error } = await client.from("content_sections").delete().eq("id", id);
    if (error) {
      options.setText("editor-status", `Ошибка удаления текста: ${error.message}`);
      return;
    }

    clearForm();
    await loadRecords();
    options.setText("editor-status", "Текст удален.");
  };

  const bindEvents = (): void => {
    requiredElement<HTMLFormElement>(options.$, "content-form").addEventListener("submit", save);
    requiredElement<HTMLButtonElement>(options.$, "clear-content-button").addEventListener("click", clearForm);
    requiredElement<HTMLButtonElement>(options.$, "delete-content-button").addEventListener("click", remove);
  };

  return {
    bindEvents,
    clearForm,
    clearRecords,
    hasEditor,
    loadRecords,
    renderBlockTabs,
    renderRecords,
    setSection
  };
}
