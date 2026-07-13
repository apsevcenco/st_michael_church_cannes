(function () {
  const MEDIA_BUCKET = "parish-media";

  const sections = [
    {
      key: "home",
      title: "Главная",
      description: "Главный экран, вводный текст, основные фотографии и быстрые ссылки.",
      blocks: [
        ["hero", "Верхний экран"],
        ["body", "Основной текст"],
        ["notice", "Объявление"]
      ],
      media: [
        ["home_hero", "Фото главной страницы"],
        ["page_gallery", "Галерея главной"]
      ]
    },
    {
      key: "history",
      title: "История",
      description: "История прихода, исторические фотографии и изображения для галереи.",
      blocks: [
        ["hero", "Верхний экран"],
        ["body", "Полная история"],
        ["details", "Дополнительный блок"]
      ],
      media: [
        ["history_gallery", "Фото для истории"],
        ["document", "Исторический документ"]
      ]
    },
    {
      key: "schedule",
      title: "Богослужения",
      description: "Текстовое расписание, объявления и PDF-файлы расписаний.",
      blocks: [
        ["hero", "Верхний экран"],
        ["body", "Текст расписания"],
        ["notice", "Важное объявление"]
      ],
      media: [
        ["schedule_pdf", "PDF расписания"],
        ["document", "Документ"]
      ]
    },
    {
      key: "sacraments",
      title: "Таинства",
      description: "Общая страница раздела о таинствах и церковных требах.",
      blocks: [
        ["hero", "Верхний экран"],
        ["body", "Общий текст"],
        ["details", "Дополнительный блок"]
      ],
      media: [["page_gallery", "Фото раздела"]]
    },
    {
      key: "baptism",
      title: "Крещение",
      description: "Текст о подготовке к Крещению и необходимые материалы.",
      blocks: [
        ["hero", "Верхний экран"],
        ["body", "Основной текст"],
        ["details", "Порядок подготовки"]
      ],
      media: [["document", "Документ для Крещения"]]
    },
    {
      key: "wedding",
      title: "Венчание",
      description: "Текст о Венчании, подготовке и необходимых документах.",
      blocks: [
        ["hero", "Верхний экран"],
        ["body", "Основной текст"],
        ["details", "Порядок подготовки"]
      ],
      media: [["document", "Документ для Венчания"]]
    },
    {
      key: "confession",
      title: "Исповедь",
      description: "Полный текст о таинстве Исповеди.",
      blocks: [
        ["hero", "Верхний экран"],
        ["body", "Основной текст"],
        ["details", "Дополнительные факты"]
      ],
      media: [["document", "Материал для Исповеди"]]
    },
    {
      key: "communion",
      title: "Причастие",
      description: "Полный текст о таинстве Причастия.",
      blocks: [
        ["hero", "Верхний экран"],
        ["body", "Основной текст"],
        ["details", "Дополнительные факты"]
      ],
      media: [["document", "Материал для Причастия"]]
    },
    {
      key: "notes",
      title: "Записки",
      description: "Тексты о записках, поминовении, правилах подачи имен.",
      blocks: [
        ["hero", "Верхний экран"],
        ["body", "Основной текст"],
        ["details", "Правила написания"]
      ],
      media: [["document", "Бланк или документ"]]
    },
    {
      key: "meeting",
      title: "Беседа",
      description: "Запись на беседу со священником и пояснительный текст.",
      blocks: [
        ["hero", "Верхний экран"],
        ["body", "Основной текст"],
        ["contacts", "Как записаться"]
      ],
      media: [["document", "Документ"]]
    },
    {
      key: "help",
      title: "Помощь",
      description: "Пожертвования, банковские реквизиты, документы и ссылки оплаты.",
      blocks: [
        ["hero", "Верхний экран"],
        ["body", "Основной текст"],
        ["donation", "Банковские реквизиты"],
        ["details", "Онлайн-пожертвование"]
      ],
      media: [
        ["donation_file", "Файл с реквизитами"],
        ["document", "Документ"]
      ]
    },
    {
      key: "contacts",
      title: "Контакты",
      description: "Адрес, телефон, email, карта и контактный текст.",
      blocks: [
        ["hero", "Верхний экран"],
        ["contacts", "Контактные данные"],
        ["details", "Карта и маршрут"]
      ],
      media: [["document", "Документ"]]
    },
    {
      key: "visit",
      title: "Посетителям",
      description: "Адрес, правила посещения, маршрут и информация для гостей.",
      blocks: [
        ["hero", "Верхний экран"],
        ["body", "Основной текст"],
        ["details", "Правила посещения"]
      ],
      media: [["document", "Документ"]]
    },
    {
      key: "news",
      title: "Новости",
      description: "Приходские новости, объявления и изображения.",
      blocks: [
        ["hero", "Верхний экран"],
        ["body", "Новость или объявление"],
        ["notice", "Важная новость"]
      ],
      media: [
        ["page_gallery", "Фото новости"],
        ["document", "Документ"]
      ]
    }
  ];

  let client = null;
  let activeSection = sections[0];
  let activeLanguage = "ru";
  let activeBlock = "hero";
  let contentRecords = [];
  let mediaRecords = [];

  const $ = (id) => document.getElementById(id);

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

  function showLogin() {
    $("login-screen").hidden = false;
    $("admin-workspace").hidden = true;
  }

  function showWorkspace(email) {
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
    if (user) showWorkspace(user.email);
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
    const tabs = $("content-block-tabs");
    tabs.innerHTML = "";
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
    mediaFields.purpose.innerHTML = "";
    activeSection.media.forEach(([key, label]) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = label;
      mediaFields.purpose.appendChild(option);
    });
    $("media-panel").hidden = activeSection.media.length === 0;
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
  }

  function selectSection(key) {
    activeSection = sections.find((section) => section.key === key) || sections[0];
    activeBlock = activeSection.blocks[0][0];
    clearContentForm();
    clearMediaForm();
    renderSectionMenu();
    renderSectionHeader();
    renderBlockTabs();
    renderMediaPurposes();
    loadSectionData();
  }

  function selectBlock(key) {
    activeBlock = key;
    clearContentForm();
    renderBlockTabs();
    fillContentFromExisting();
  }

  function selectLanguage(language) {
    activeLanguage = language;
    clearContentForm();
    renderLanguageButtons();
    loadContentRecords();
  }

  async function loadSectionData() {
    if (!client || $("admin-workspace").hidden) return;
    renderSectionMenu();
    renderSectionHeader();
    renderBlockTabs();
    renderMediaPurposes();
    renderLanguageButtons();
    await Promise.all([loadContentRecords(), loadMediaRecords()]);
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
      sort_order: activeSection.blocks.findIndex(([key]) => key === activeBlock),
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
    if (!client) return;
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
    if (!client) return;

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
  }

  function fillMediaForm(record) {
    mediaFields.id.value = record.id || "";
    mediaFields.purpose.value = record.purpose || activeSection.media[0][0];
    mediaFields.file.value = "";
    mediaFields.title.value = record.title || "";
    mediaFields.description.value = record.description || "";
    mediaFields.sort.value = record.sort_order || 0;
    mediaFields.status.value = record.status || "published";
  }

  async function loadMediaRecords() {
    if (!client || !activeSection.media.length) {
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
      button.className = "admin-row admin-media-row";
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
    if (!client) return;

    const file = mediaFields.file.files[0];
    const current = mediaRecords.find((record) => record.id === mediaFields.id.value);
    let publicUrl = current ? current.file_url : "";
    let storagePath = current ? current.storage_path : "";

    if (file) {
      const extension = file.name.includes(".") ? file.name.split(".").pop() : "bin";
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
    if (!client || !id) return;

    const record = mediaRecords.find((item) => item.id === id);
    if (record && record.storage_path) {
      await client.storage.from(MEDIA_BUCKET).remove([record.storage_path]);
    }

    const { error } = await client.from("media_files").delete().eq("id", id);
    if (error) {
      setText("editor-status", `Ошибка удаления файла: ${error.message}`);
      return;
    }

    clearMediaForm();
    await loadMediaRecords();
    setText("editor-status", "Файл удален.");
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

      showWorkspace(data.user.email);
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
  });
})();
