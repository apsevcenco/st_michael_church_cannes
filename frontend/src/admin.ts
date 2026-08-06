// @ts-nocheck

import "./site-config";
import type { AdminSectionConfig, ContentSection, LanguageCode, MediaFile, ParishNews, ParishNewsPhoto } from "./types";

(function () {
  const MEDIA_BUCKET = "parish-media";
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

  const sections = [
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

  let client = null;
  let activeSection = sections[0];
  let activeLanguage = "ru";
  let activeBlock = "hero";
  let contentRecords = [];
  let mediaRecords = [];
  let newsRecords = [];
  let newsPhotos = [];

  const $ = (id) => document.getElementById(id);

  const hasContentEditor = () => Array.isArray(activeSection.blocks) && activeSection.blocks.length > 0;
  const hasMediaEditor = () => Array.isArray(activeSection.media) && activeSection.media.length > 0;
  const isPdfFile = (file) => {
    return file && (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));
  };

  const contentFields = {
    id: $("content-id"),
    section: $("content-section"),
    title: $("content-title"),
    summary: $("content-summary"),
    body: $("content-body"),
    status: $("content-status")
  };

  const mediaFields = {
    id: $("media-id"),
    purpose: $("media-purpose"),
    file: $("media-file"),
    title: $("media-title"),
    description: $("media-description"),
    sort: $("media-sort"),
    status: $("media-status")
  };

  const newsFields = {
    id: $("news-id"),
    date: $("news-date"),
    title: $("news-title"),
    excerpt: $("news-excerpt"),
    body: $("news-body"),
    status: $("news-status"),
    photos: $("news-photos")
  };

  function setText(id, text) {
    const node = $(id);
    if (node) node.textContent = text;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function slugify(value) {
    return String(value || "file")
      .toLowerCase()
      .replace(/[^a-z0-9а-яё._-]+/gi, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function fileExtension(file) {
    const extension = String(file && file.name ? file.name.split(".").pop() : "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    return ALLOWED_EXTENSIONS.has(extension) ? extension : "";
  }

  function isImageFile(file) {
    return Boolean(file && ALLOWED_IMAGE_TYPES.has(file.type) && fileExtension(file));
  }

  function isDocumentFile(file) {
    return Boolean(file && ALLOWED_DOCUMENT_TYPES.has(file.type) && fileExtension(file));
  }

  function validateUploadFile(file) {
    if (!file) return { ok: true };
    const extension = fileExtension(file);
    if (!extension) return { ok: false, message: "Недопустимое расширение файла." };

    if (activeSection.imagesOnly || file.type.startsWith("image/")) {
      if (!isImageFile(file)) return { ok: false, message: "Можно загружать только JPG, PNG, WEBP или GIF." };
      if (file.size > MAX_IMAGE_SIZE) return { ok: false, message: "Фото слишком большое. Максимум 8 МБ." };
      return { ok: true };
    }

    if (activeSection.scheduleFileOnly) {
      if (!(file.type === "application/pdf" && extension === "pdf")) return { ok: false, message: "В расписание можно загрузить только PDF или изображение." };
      if (file.size > MAX_DOCUMENT_SIZE) return { ok: false, message: "PDF слишком большой. Максимум 20 МБ." };
      return { ok: true };
    }

    if (activeSection.pdfOnly) {
      if (!(file.type === "application/pdf" && extension === "pdf")) return { ok: false, message: "В этот раздел можно загрузить только PDF." };
      if (file.size > MAX_DOCUMENT_SIZE) return { ok: false, message: "PDF слишком большой. Максимум 20 МБ." };
      return { ok: true };
    }

    if (!isDocumentFile(file)) return { ok: false, message: "Разрешены только изображения, PDF, DOC/DOCX и XLS/XLSX." };
    if (file.size > MAX_DOCUMENT_SIZE) return { ok: false, message: "Файл слишком большой. Максимум 20 МБ." };
    return { ok: true };
  }

  async function isCurrentUserAdmin(user) {
    if (!client || !user) return false;
    const { data, error } = await client
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    return !error && Boolean(data);
  }

  async function requireAdminSession(user) {
    if (await isCurrentUserAdmin(user)) return true;
    await client.auth.signOut();
    setText("auth-status", "Доступ запрещен: пользователь не добавлен в список администраторов.");
    showLogin();
    return false;
  }

  function showLogin() {
    document.body.classList.add("is-login");
    document.body.classList.remove("is-authenticated");
    $("login-screen").hidden = false;
    $("admin-workspace").hidden = true;
  }

  function showWorkspace(email) {
    document.body.classList.remove("is-login");
    document.body.classList.add("is-authenticated");
    $("login-screen").hidden = true;
    $("admin-workspace").hidden = false;
    setText("admin-user-email", email || "");
    loadSectionData();
  }

  function connect() {
    if (!window.supabase || !window.ST_MICHAEL_SUPABASE_URL || !window.ST_MICHAEL_SUPABASE_ANON_KEY) {
      setText("auth-status", "Не удалось подключить сайт к Supabase. Проверьте настройки проекта.");
      return false;
    }

    client = window.supabase.createClient(window.ST_MICHAEL_SUPABASE_URL, window.ST_MICHAEL_SUPABASE_ANON_KEY);
    return true;
  }

  async function checkSession() {
    if (!client) return;
    const { data } = await client.auth.getSession();
    const user = data.session && data.session.user;
    if (user && await requireAdminSession(user)) showWorkspace(user.email);
    else showLogin();
  }

  function renderSectionMenu() {
    const menu = $("section-menu");
    menu.innerHTML = "";
    sections.forEach((section) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = section.key === activeSection.key ? "active" : "";
      button.textContent = section.title;
      button.addEventListener("click", () => selectSection(section.key));
      menu.appendChild(button);
    });
  }

  function renderBlockTabs() {
    const panel = $("content-panel");
    const tabs = $("content-block-tabs");
    if (panel) panel.hidden = !hasContentEditor();
    tabs.innerHTML = "";
    if (!hasContentEditor()) return;
    activeSection.blocks.forEach(([key, label]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = key === activeBlock ? "active" : "";
      button.textContent = label;
      button.addEventListener("click", () => selectBlock(key));
      tabs.appendChild(button);
    });
  }

  function renderMediaPurposes() {
    const panel = $("media-panel");
    if (panel) panel.hidden = !hasMediaEditor();
    mediaFields.purpose.innerHTML = "";
    if (!hasMediaEditor()) {
      mediaFields.file.accept = "";
      mediaFields.file.multiple = false;
      return;
    }
    activeSection.media.forEach(([key, label]) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = label;
      mediaFields.purpose.appendChild(option);
    });
    mediaFields.file.accept = activeSection.scheduleFileOnly ? "image/*,.pdf,application/pdf" : activeSection.pdfOnly ? ".pdf,application/pdf" : activeSection.imagesOnly ? "image/*" : "image/*,.pdf,.doc,.docx,.xls,.xlsx";
    mediaFields.file.multiple = Boolean(activeSection.imagesOnly);
  }

  function renderLanguageButtons() {
    document.querySelectorAll(".admin-language-switch button").forEach((button) => {
      button.classList.toggle("active", button.dataset.language === activeLanguage);
    });
  }

  function renderSectionHeader() {
    setText("section-kicker", "Раздел сайта");
    setText("section-title", activeSection.title);
    setText("section-description", activeSection.description);
    const newsPanel = $("news-admin-panel");
    if (newsPanel) newsPanel.hidden = !activeSection.newsManager;
    const statsPanel = $("stats-admin-panel");
    if (statsPanel) statsPanel.hidden = !activeSection.statsManager;
    const editorGrid = document.querySelector(".admin-editor-grid");
    if (editorGrid) editorGrid.hidden = activeSection.statsManager || (!hasContentEditor() && !hasMediaEditor());
  }

  function selectSection(key) {
    activeSection = sections.find((section) => section.key === key) || sections[0];
    activeBlock = hasContentEditor() ? activeSection.blocks[0][0] : "";
    clearContentForm();
    clearMediaForm();
    renderSectionMenu();
    renderSectionHeader();
    renderBlockTabs();
    renderMediaPurposes();
    loadSectionData();
  }

  function selectBlock(key) {
    if (!hasContentEditor()) return;
    activeBlock = key;
    clearContentForm();
    renderBlockTabs();
    fillContentFromExisting();
  }

  function selectLanguage(language) {
    activeLanguage = language;
    clearContentForm();
    clearNewsForm();
    renderLanguageButtons();
    if (hasContentEditor()) loadContentRecords();
    if (activeSection.newsManager) loadNewsRecords();
  }

  async function loadSectionData() {
    if (!client || $("admin-workspace").hidden) return;
    renderSectionMenu();
    renderSectionHeader();
    renderBlockTabs();
    renderMediaPurposes();
    renderLanguageButtons();
    const jobs = [];
    if (hasContentEditor()) jobs.push(loadContentRecords());
    else {
      contentRecords = [];
      renderContentRecords();
    }
    if (hasMediaEditor()) jobs.push(loadMediaRecords());
    else {
      mediaRecords = [];
      renderMediaRecords();
    }
    await Promise.all(jobs);
    if (activeSection.newsManager) await loadNewsRecords();
    if (activeSection.statsManager) await loadStats();
  }

  function contentPayload() {
    return {
      page_key: activeSection.key,
      language: activeLanguage,
      section_key: activeBlock,
      title: contentFields.title.value.trim(),
      summary: contentFields.summary.value.trim(),
      body: contentFields.body.value.trim(),
      status: contentFields.status.value,
      sort_order: hasContentEditor() ? activeSection.blocks.findIndex(([key]) => key === activeBlock) : 0,
      updated_at: new Date().toISOString()
    };
  }

  function clearContentForm() {
    contentFields.id.value = "";
    contentFields.section.value = activeBlock;
    contentFields.title.value = "";
    contentFields.summary.value = "";
    contentFields.body.value = "";
    contentFields.status.value = "published";
  }

  function fillContentForm(record) {
    contentFields.id.value = record.id || "";
    contentFields.section.value = record.section_key || activeBlock;
    contentFields.title.value = record.title || "";
    contentFields.summary.value = record.summary || "";
    contentFields.body.value = record.body || "";
    contentFields.status.value = record.status || "published";
  }

  function fillContentFromExisting() {
    const record = contentRecords.find((item) => item.section_key === activeBlock);
    if (record) fillContentForm(record);
  }

  async function loadContentRecords() {
    if (!client || !hasContentEditor()) {
      contentRecords = [];
      renderContentRecords();
      return;
    }
    const { data, error } = await client
      .from("content_sections")
      .select("*")
      .eq("page_key", activeSection.key)
      .eq("language", activeLanguage)
      .order("sort_order", { ascending: true });

    if (error) {
      contentRecords = [];
      renderContentRecords();
      setText("editor-status", `Ошибка чтения текстов: ${error.message}`);
      return;
    }

    contentRecords = data || [];
    renderContentRecords();
    fillContentFromExisting();
    setText("editor-status", `Раздел «${activeSection.title}» загружен.`);
  }

  function renderContentRecords() {
    const list = $("content-list");
    if (!list || !hasContentEditor()) return;
    list.innerHTML = "";

    if (!contentRecords.length) {
      list.innerHTML = '<div class="admin-empty">Для этого языка пока нет сохраненных текстов.</div>';
      return;
    }

    contentRecords.forEach((record) => {
      const label = (activeSection.blocks.find(([key]) => key === record.section_key) || [record.section_key, record.section_key])[1];
      const button = document.createElement("button");
      button.type = "button";
      button.className = "admin-row";
      button.innerHTML = `<strong>${escapeHtml(label)}</strong><br><span>${escapeHtml(record.title || "Без заголовка")} · ${escapeHtml(record.status)}</span>`;
      button.addEventListener("click", () => {
        activeBlock = record.section_key;
        renderBlockTabs();
        fillContentForm(record);
      });
      list.appendChild(button);
    });
  }

  async function saveContent(event) {
    event.preventDefault();
    if (!client || !hasContentEditor()) return;

    const existing = contentRecords.find((item) => item.section_key === activeBlock);
    const id = contentFields.id.value || (existing && existing.id);
    const payload = contentPayload();
    const query = id
      ? client.from("content_sections").update(payload).eq("id", id)
      : client.from("content_sections").insert(payload);

    const { error } = await query;
    if (error) {
      setText("editor-status", `Ошибка сохранения текста: ${error.message}`);
      return;
    }

    await loadContentRecords();
    setText("editor-status", "Текст сохранен.");
  }

  async function deleteContent() {
    const id = contentFields.id.value;
    if (!client || !id) return;

    const { error } = await client.from("content_sections").delete().eq("id", id);
    if (error) {
      setText("editor-status", `Ошибка удаления текста: ${error.message}`);
      return;
    }

    clearContentForm();
    await loadContentRecords();
    setText("editor-status", "Текст удален.");
  }

  function mediaPayload(publicUrl, storagePath, file) {
    return {
      page_key: activeSection.key,
      purpose: mediaFields.purpose.value,
      title: mediaFields.title.value.trim() || (file ? file.name : ""),
      description: mediaFields.description.value.trim(),
      file_url: publicUrl,
      storage_path: storagePath,
      file_name: file ? file.name : undefined,
      mime_type: file ? file.type : undefined,
      file_size: file ? file.size : undefined,
      status: mediaFields.status.value,
      sort_order: Number(mediaFields.sort.value || 0),
      updated_at: new Date().toISOString()
    };
  }

  function clearMediaForm() {
    mediaFields.id.value = "";
    mediaFields.file.value = "";
    mediaFields.title.value = "";
    mediaFields.description.value = "";
    mediaFields.sort.value = "0";
    mediaFields.status.value = "published";
    renderMediaRecords();
  }

  function fillMediaForm(record) {
    mediaFields.id.value = record.id || "";
    mediaFields.purpose.value = record.purpose || (hasMediaEditor() ? activeSection.media[0][0] : "");
    mediaFields.file.value = "";
    mediaFields.title.value = record.title || "";
    mediaFields.description.value = record.description || "";
    mediaFields.sort.value = record.sort_order || 0;
    mediaFields.status.value = record.status || "published";
    renderMediaRecords();
    setText("editor-status", `Выбрано: ${record.title || record.file_name || "фото/файл"}.`);
  }

  async function loadMediaRecords() {
    if (!client || !hasMediaEditor()) {
      mediaRecords = [];
      renderMediaRecords();
      return;
    }

    const { data, error } = await client
      .from("media_files")
      .select("*")
      .eq("page_key", activeSection.key)
      .order("purpose", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error) {
      mediaRecords = [];
      renderMediaRecords();
      setText("editor-status", `Ошибка чтения файлов: ${error.message}`);
      return;
    }

    mediaRecords = data || [];
    renderMediaRecords();
  }

  function renderMediaRecords() {
    const list = $("media-list");
    if (!list) return;
    list.innerHTML = "";

    if (!mediaRecords.length) {
      list.innerHTML = '<div class="admin-empty">Для этого раздела пока нет загруженных файлов.</div>';
      return;
    }

    mediaRecords.forEach((record) => {
      const label = (activeSection.media.find(([key]) => key === record.purpose) || [record.purpose, record.purpose])[1];
      const button = document.createElement("button");
      button.type = "button";
      button.className = `admin-row admin-media-row${record.id === mediaFields.id.value ? " is-selected" : ""}`;
      const preview = record.mime_type && record.mime_type.startsWith("image/") && record.file_url
        ? `<img src="${escapeHtml(record.file_url)}" alt="">`
        : `<span class="admin-file-chip">${escapeHtml(record.mime_type || "file")}</span>`;
      button.innerHTML = `${preview}<span><strong>${escapeHtml(record.title || record.file_name || "Без названия")}</strong><br><small>${escapeHtml(label)} · ${escapeHtml(record.status)}</small></span>`;
      button.addEventListener("click", () => fillMediaForm(record));
      list.appendChild(button);
    });
  }

  async function saveMedia(event) {
    event.preventDefault();
    if (!client || !hasMediaEditor()) return;

    const files = Array.from(mediaFields.file.files || []);
    const file = files[0];
    const current = mediaRecords.find((record) => record.id === mediaFields.id.value);
    let publicUrl = current ? current.file_url : "";
    let storagePath = current ? current.storage_path : "";

    if (activeSection.imagesOnly && !mediaFields.id.value && files.length > 1) {
      const startSort = Number(mediaFields.sort.value || mediaRecords.length || 0);
      const rows = [];
      for (const [index, uploadFile] of files.entries()) {
        const validation = validateUploadFile(uploadFile);
        if (!validation.ok) {
          setText("editor-status", validation.message);
          return;
        }
        if (!uploadFile.type.startsWith("image/")) {
          setText("editor-status", "В раздел «Галерея» можно загружать только фотографии.");
          return;
        }
        const extension = fileExtension(uploadFile);
        const safeName = slugify(uploadFile.name.replace(/\.[^.]+$/, ""));
        const path = `${activeSection.key}/${mediaFields.purpose.value}/${Date.now()}-${index}-${safeName}.${extension}`;
        const { error: uploadError } = await client.storage.from(MEDIA_BUCKET).upload(path, uploadFile, {
          cacheControl: "3600",
          upsert: false
        });
        if (uploadError) {
          setText("editor-status", `Ошибка загрузки файла: ${uploadError.message}`);
          return;
        }
        const { data } = client.storage.from(MEDIA_BUCKET).getPublicUrl(path);
        rows.push({
          page_key: activeSection.key,
          purpose: mediaFields.purpose.value,
          title: mediaFields.title.value.trim() || uploadFile.name,
          description: mediaFields.description.value.trim(),
          file_url: data.publicUrl,
          storage_path: path,
          file_name: uploadFile.name,
          mime_type: uploadFile.type,
          file_size: uploadFile.size,
          status: mediaFields.status.value,
          sort_order: startSort + index,
          updated_at: new Date().toISOString()
        });
      }
      const { error } = await client.from("media_files").insert(rows);
      if (error) {
        setText("editor-status", `Ошибка сохранения файлов: ${error.message}`);
        return;
      }
      clearMediaForm();
      await loadMediaRecords();
      setText("editor-status", `Загружено фотографий: ${rows.length}.`);
      return;
    }

    if (file) {
      const validation = validateUploadFile(file);
      if (!validation.ok) {
        setText("editor-status", validation.message);
        return;
      }
      if (activeSection.imagesOnly && !file.type.startsWith("image/")) {
        setText("editor-status", "В раздел «Галерея» можно загружать только фотографии.");
        return;
      }
      if (activeSection.pdfOnly && !isPdfFile(file)) {
        setText("editor-status", "В расписание можно загрузить только PDF-файл.");
        return;
      }

      const extension = fileExtension(file);
      const safeName = slugify(file.name.replace(/\.[^.]+$/, ""));
      storagePath = `${activeSection.key}/${mediaFields.purpose.value}/${Date.now()}-${safeName}.${extension}`;
      const { error: uploadError } = await client.storage.from(MEDIA_BUCKET).upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false
      });

      if (uploadError) {
        setText("editor-status", `Ошибка загрузки файла: ${uploadError.message}`);
        return;
      }

      const { data } = client.storage.from(MEDIA_BUCKET).getPublicUrl(storagePath);
      publicUrl = data.publicUrl;
    }

    if (!publicUrl) {
      setText("editor-status", "Выберите файл для загрузки.");
      return;
    }

    const payload = mediaPayload(publicUrl, storagePath, file);
    const query = mediaFields.id.value
      ? client.from("media_files").update(payload).eq("id", mediaFields.id.value)
      : client.from("media_files").insert(payload);

    const { error } = await query;
    if (error) {
      setText("editor-status", `Ошибка сохранения файла: ${error.message}`);
      return;
    }

    clearMediaForm();
    await loadMediaRecords();
    setText("editor-status", "Файл сохранен.");
  }

  async function deleteMedia() {
    const id = mediaFields.id.value;
    if (!client) return;
    if (!id) {
      setText("editor-status", "Сначала выберите фото или файл в списке ниже.");
      return;
    }

    const record = mediaRecords.find((item) => item.id === id);
    const name = record ? (record.title || record.file_name || "этот файл") : "этот файл";
    if (!window.confirm(`Удалить «${name}»?`)) return;

    let storageWarning = "";
    if (record && record.storage_path) {
      const { error: storageError } = await client.storage.from(MEDIA_BUCKET).remove([record.storage_path]);
      if (storageError) storageWarning = ` Файл в хранилище не удалён: ${storageError.message}`;
    }

    const { error } = await client.from("media_files").delete().eq("id", id);
    if (error) {
      setText("editor-status", `Ошибка удаления файла: ${error.message}`);
      return;
    }

    clearMediaForm();
    await loadMediaRecords();
    setText("editor-status", `Файл удалён из сайта.${storageWarning}`);
  }

  function clearNewsForm() {
    if (!newsFields.id) return;
    newsFields.id.value = "";
    newsFields.date.value = new Date().toISOString().slice(0, 10);
    newsFields.title.value = "";
    newsFields.excerpt.value = "";
    newsFields.body.value = "";
    newsFields.status.value = "published";
    newsFields.photos.value = "";
    renderNewsRecords();
  }

  function fillNewsForm(record) {
    newsFields.id.value = record.id || "";
    newsFields.date.value = record.event_date || new Date().toISOString().slice(0, 10);
    newsFields.title.value = record.title || "";
    newsFields.excerpt.value = record.excerpt || "";
    newsFields.body.value = record.body || "";
    newsFields.status.value = record.status || "published";
    newsFields.photos.value = "";
    renderNewsRecords();
    setText("editor-status", `Выбрана новость: ${record.title}.`);
  }

  function newsPayload() {
    return {
      language: activeLanguage,
      title: newsFields.title.value.trim(),
      excerpt: newsFields.excerpt.value.trim(),
      body: newsFields.body.value.trim(),
      event_date: newsFields.date.value,
      status: newsFields.status.value,
      updated_at: new Date().toISOString()
    };
  }

  async function loadNewsRecords() {
    if (!client || activeSection.key !== "news") return;
    const [{ data: news, error }, { data: photos }] = await Promise.all([
      client
        .from("parish_news")
        .select("*")
        .eq("language", activeLanguage)
        .order("event_date", { ascending: false }),
      client
        .from("parish_news_photos")
        .select("*")
        .order("sort_order", { ascending: true })
    ]);

    if (error) {
      newsRecords = [];
      newsPhotos = [];
      renderNewsRecords();
      setText("editor-status", `Ошибка чтения новостей: ${error.message}`);
      return;
    }

    newsRecords = news || [];
    newsPhotos = photos || [];
    renderNewsRecords();
    if (!newsFields.id.value) clearNewsForm();
  }

  function renderNewsRecords() {
    const list = $("news-list");
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
      button.className = `admin-row${record.id === newsFields.id.value ? " is-selected" : ""}`;
      button.innerHTML = `<strong>${escapeHtml(record.title)}</strong><br><span>${escapeHtml(record.event_date)} · ${escapeHtml(record.status)} · фото: ${count}</span>`;
      button.addEventListener("click", () => fillNewsForm(record));
      list.appendChild(button);
    });
  }

  async function uploadNewsPhotos(newsId) {
    const files = Array.from(newsFields.photos.files || []);
    if (!files.length) return true;

    const rows = [];
    for (const [index, file] of files.entries()) {
      const validation = validateUploadFile(file);
      if (!validation.ok) {
        setText("editor-status", validation.message);
        return false;
      }
      if (!file.type.startsWith("image/")) {
        setText("editor-status", "К новости можно загружать только фотографии.");
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
        setText("editor-status", `Ошибка загрузки фото новости: ${uploadError.message}`);
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
      setText("editor-status", `Ошибка сохранения фото новости: ${error.message}`);
      return false;
    }
    return true;
  }

  async function saveNews(event) {
    event.preventDefault();
    if (!client || activeSection.key !== "news") return;

    const payload = newsPayload();
    if (!payload.title || !payload.event_date) {
      setText("editor-status", "У новости должны быть дата и заголовок.");
      return;
    }

    let id = newsFields.id.value;
    if (id) {
      const { error } = await client.from("parish_news").update(payload).eq("id", id);
      if (error) {
        setText("editor-status", `Ошибка сохранения новости: ${error.message}`);
        return;
      }
    } else {
      const { data, error } = await client.from("parish_news").insert(payload).select("id").single();
      if (error) {
        setText("editor-status", `Ошибка создания новости: ${error.message}`);
        return;
      }
      id = data.id;
      newsFields.id.value = id;
    }

    const photosOk = await uploadNewsPhotos(id);
    if (!photosOk) return;

    await loadNewsRecords();
    clearNewsForm();
    setText("editor-status", "Новость сохранена.");
  }

  async function deleteNews() {
    const id = newsFields.id.value;
    if (!client || !id) {
      setText("editor-status", "Сначала выберите новость в списке.");
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
      setText("editor-status", `Ошибка удаления новости: ${error.message}`);
      return;
    }

    clearNewsForm();
    await loadNewsRecords();
    setText("editor-status", "Новость удалена.");
  }

  function formatStatsDate(value) {
    if (!value) return "";
    try {
      return new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(value));
    } catch (_) {
      return value;
    }
  }

  function renderStatsRows(targetId, rows, emptyText) {
    const target = $(targetId);
    if (!target) return;
    if (!rows.length) {
      target.innerHTML = `<div class="admin-empty">${escapeHtml(emptyText)}</div>`;
      return;
    }
    target.innerHTML = rows.map((row) => `
      <div class="stats-row">
        <span>${escapeHtml(row.label)}</span>
        <strong>${escapeHtml(row.value)}</strong>
      </div>
    `).join("");
  }

  async function loadStats() {
    if (!client || !activeSection.statsManager) return;
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const { data, error } = await client
      .from("page_visits")
      .select("created_at, visit_date, page_key, page_path, language, session_id")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false })
      .limit(5000);

    if (error) {
      setText("editor-status", `Ошибка чтения статистики: ${error.message}`);
      renderStatsRows("stats-top-pages", [], "Статистика пока недоступна.");
      renderStatsRows("stats-recent", [], "Статистика пока недоступна.");
      return;
    }

    const visits = data || [];
    const today = new Date().toISOString().slice(0, 10);
    const uniqueSessions = new Set(visits.map((visit) => visit.session_id).filter(Boolean));
    const pages = new Map();

    visits.forEach((visit) => {
      const label = visit.page_path || visit.page_key || "unknown";
      pages.set(label, (pages.get(label) || 0) + 1);
    });

    setText("stats-today", String(visits.filter((visit) => visit.visit_date === today).length));
    setText("stats-total", String(visits.length));
    setText("stats-unique", String(uniqueSessions.size));
    setText("stats-pages", String(pages.size));

    const topPages = Array.from(pages.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([label, value]) => ({ label, value: `${value}` }));

    const recent = visits.slice(0, 12).map((visit) => ({
      label: `${visit.page_path || visit.page_key || "unknown"} · ${visit.language || "ru"}`,
      value: formatStatsDate(visit.created_at)
    }));

    renderStatsRows("stats-top-pages", topPages, "Посещений пока нет.");
    renderStatsRows("stats-recent", recent, "Посещений пока нет.");
    setText("editor-status", "Статистика обновлена.");
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!connect()) return;

    renderSectionMenu();
    renderSectionHeader();
    renderBlockTabs();
    renderMediaPurposes();
    checkSession();

    $("login-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const { data, error } = await client.auth.signInWithPassword({
        email: $("admin-email").value.trim(),
        password: $("admin-password").value
      });

      if (error) {
        setText("auth-status", `Ошибка входа: ${error.message}`);
        return;
      }

      if (await requireAdminSession(data.user)) showWorkspace(data.user.email);
    });

    $("logout-button").addEventListener("click", async () => {
      await client.auth.signOut();
      showLogin();
    });

    document.querySelectorAll(".admin-language-switch button").forEach((button) => {
      button.addEventListener("click", () => selectLanguage(button.dataset.language));
    });

    $("content-form").addEventListener("submit", saveContent);
    $("clear-content-button").addEventListener("click", clearContentForm);
    $("delete-content-button").addEventListener("click", deleteContent);

    $("media-form").addEventListener("submit", saveMedia);
    $("clear-media-button").addEventListener("click", clearMediaForm);
    $("delete-media-button").addEventListener("click", deleteMedia);

    $("news-form").addEventListener("submit", saveNews);
    $("clear-news-button").addEventListener("click", clearNewsForm);
    $("delete-news-button").addEventListener("click", deleteNews);
    $("refresh-stats-button").addEventListener("click", loadStats);
  });
})();
