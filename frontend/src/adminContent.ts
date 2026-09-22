import { createRichTextEditor } from "./adminRichText";
import { buttonFeedback } from "./adminFeedback";
import { translateBlock } from "./adminTranslate";
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

  const currentSortOrder = (): number => {
    return hasEditor() ? options.getSection().blocks.findIndex(([key]) => key === activeBlock) : 0;
  };

  const payload = (language: LanguageCode = options.getLanguage(), overrides: Partial<ContentSection> = {}) => {
    const section = options.getSection();
    return {
      page_key: section.key,
      language,
      section_key: activeBlock,
      title: fields.title.value.trim(),
      summary: fields.summary.value.trim(),
      body: fields.body.value.trim(),
      status: fields.status.value,
      sort_order: currentSortOrder(),
      updated_at: new Date().toISOString(),
      ...overrides
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

  const saveTranslatedBlock = async (language: LanguageCode, translated: Record<string, string>): Promise<void> => {
    const client = options.getClient();
    const section = options.getSection();
    const nextPayload = payload(language, {
      title: translated.title || "",
      summary: translated.summary || "",
      body: translated.body || "",
    });

    const { data: existing, error: findError } = await client
      .from("content_sections")
      .select("id")
      .eq("page_key", section.key)
      .eq("section_key", activeBlock)
      .eq("language", language)
      .maybeSingle();

    if (findError) throw new Error(findError.message);

    const { error } = existing?.id
      ? await client.from("content_sections").update(nextPayload).eq("id", existing.id)
      : await client.from("content_sections").insert(nextPayload);

    if (error) throw new Error(error.message);
  };

  const translateCurrentBlock = async (event: Event): Promise<void> => {
    const feedback = buttonFeedback(event, requiredElement<HTMLButtonElement>(options.$, "translate-content-button"));
    feedback.start("Перевод...");
    richEditors.forEach((editor) => editor.syncToTextarea());
    const client = options.getClient();
    if (!client || !hasEditor()) {
      feedback.fail("Недоступно");
      return;
    }
    if (options.getLanguage() !== "ru") {
      options.setText("editor-status", "Автоперевод запускается из русской вкладки RU.");
      feedback.fail("Откройте RU");
      return;
    }

    try {
      const translations = await translateBlock(client, "ru", `${options.getSection().title}: ${activeBlock}`, {
        title: fields.title.value.trim(),
        summary: fields.summary.value.trim(),
        body: fields.body.value.trim(),
      });

      for (const language of ["fr", "en"] as LanguageCode[]) {
        if (translations[language]) await saveTranslatedBlock(language, translations[language] || {});
      }

      await loadRecords();
      options.setText("editor-status", "Блок переведен на FR/EN. Откройте языковые вкладки, чтобы проверить и поправить текст.");
      feedback.success("Переведено");
    } catch (error) {
      options.setText("editor-status", `Ошибка перевода: ${error instanceof Error ? error.message : "неизвестная ошибка"}`);
      feedback.fail("Ошибка");
    }
  };

  const save = async (event: Event): Promise<void> => {
    event.preventDefault();
    const feedback = buttonFeedback(event, requiredElement<HTMLButtonElement>(options.$, "save-content-button"));
    feedback.start();
    richEditors.forEach((editor) => editor.syncToTextarea());
    const client = options.getClient();
    if (!client || !hasEditor()) {
      feedback.fail("Недоступно");
      return;
    }

    const existing = contentRecords.find((item) => item.section_key === activeBlock);
    const id = fields.id.value || existing?.id;
    const query = id
      ? client.from("content_sections").update(payload()).eq("id", id)
      : client.from("content_sections").insert(payload());

    const { error } = await query;
    if (error) {
      options.setText("editor-status", `Ошибка сохранения текста: ${error.message}`);
      feedback.fail("Ошибка");
      return;
    }

    await loadRecords();
    options.setText("editor-status", "Текст сохранен.");
    feedback.success();
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
    requiredElement<HTMLButtonElement>(options.$, "translate-content-button").addEventListener("click", translateCurrentBlock);
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
