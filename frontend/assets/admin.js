(function () {
  const MEDIA_BUCKET = "parish-media";

  const tableMap = {
    services: "services",
    news: "news",
    pages: "pages"
  };

  let client = null;
  let activePanel = "content";
  let legacyTab = "services";
  let contentRecords = [];
  let mediaRecords = [];
  let legacyRecords = [];

  const $ = (id) => document.getElementById(id);

  const legacyFields = {
    id: $("record-id"),
    type: $("record-type"),
    date: $("record-date"),
    title: $("record-title"),
    body: $("record-body"),
    sort: $("record-sort")
  };

  const contentFields = {
    id: $("content-id"),
    page: $("content-page"),
    language: $("content-language"),
    section: $("content-section"),
    sort: $("content-sort"),
    title: $("content-title"),
    summary: $("content-summary"),
    body: $("content-body"),
    status: $("content-status")
  };

  const mediaFields = {
    id: $("media-id"),
    purpose: $("media-purpose"),
    page: $("media-page"),
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

  function getStoredConfig() {
    return {
      url: window.ST_MICHAEL_SUPABASE_URL || localStorage.getItem("ST_MICHAEL_SUPABASE_URL") || "",
      key: window.ST_MICHAEL_SUPABASE_ANON_KEY || localStorage.getItem("ST_MICHAEL_SUPABASE_ANON_KEY") || ""
    };
  }

  function connect(url, key) {
    if (!url || !key || !window.supabase) {
      setText("connection-status", "Нет URL/key или не загрузилась библиотека Supabase.");
      return;
    }

    client = window.supabase.createClient(url, key);
    localStorage.setItem("ST_MICHAEL_SUPABASE_URL", url);
    localStorage.setItem("ST_MICHAEL_SUPABASE_ANON_KEY", key);
    setText("connection-status", "Supabase подключен.");
    refreshSession();
    loadActivePanel();
  }

  async function refreshSession() {
    if (!client) return;
    const { data } = await client.auth.getSession();
    const email = data.session && data.session.user ? data.session.user.email : null;
    setText("auth-status", email ? `Вход выполнен: ${email}` : "Ожидание входа.");
  }

  function switchPanel(panel) {
    activePanel = panel;
    document.querySelectorAll(".admin-tabs button").forEach((button) => {
      button.classList.toggle("active", button.dataset.tab === panel);
    });
    document.querySelectorAll(".admin-tab-panel").forEach((node) => {
      node.classList.toggle("active", node.dataset.panel === panel);
    });
    loadActivePanel();
  }

  function loadActivePanel() {
    if (activePanel === "content") loadContentRecords();
    if (activePanel === "media") loadMediaRecords();
    if (activePanel === "legacy") loadLegacyRecords();
  }

  function contentPayload() {
    return {
      page_key: contentFields.page.value,
      language: contentFields.language.value,
      section_key: contentFields.section.value,
      title: contentFields.title.value.trim(),
      summary: contentFields.summary.value.trim(),
      body: contentFields.body.value.trim(),
      status: contentFields.status.value,
      sort_order: Number(contentFields.sort.value || 0),
      updated_at: new Date().toISOString()
    };
  }

  function fillContentForm(record) {
    contentFields.id.value = record.id || "";
    contentFields.page.value = record.page_key || "home";
    contentFields.language.value = record.language || "ru";
    contentFields.section.value = record.section_key || "hero";
    contentFields.sort.value = record.sort_order || 0;
    contentFields.title.value = record.title || "";
    contentFields.summary.value = record.summary || "";
    contentFields.body.value = record.body || "";
    contentFields.status.value = record.status || "published";
  }

  function clearContentForm() {
    fillContentForm({ sort_order: 0, status: "published" });
  }

  async function loadContentRecords() {
    if (!client) return;
    const { data, error } = await client
      .from("content_sections")
      .select("*")
      .order("page_key", { ascending: true })
      .order("language", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error) {
      contentRecords = [];
      renderContentRecords();
      setText("editor-status", `Ошибка чтения content_sections: ${error.message}`);
      return;
    }

    contentRecords = data || [];
    renderContentRecords();
    setText("editor-status", `Текстовых блоков загружено: ${contentRecords.length}`);
  }

  function renderContentRecords() {
    const list = $("content-list");
    if (!list) return;
    list.innerHTML = "";

    contentRecords.forEach((record) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "admin-row";
      button.innerHTML = `<strong>${escapeHtml(record.title || "Без заголовка")}</strong><br><span>${escapeHtml(record.page_key)} / ${escapeHtml(record.language)} / ${escapeHtml(record.section_key)} / ${escapeHtml(record.status)}</span>`;
      button.addEventListener("click", () => fillContentForm(record));
      list.appendChild(button);
    });
  }

  async function saveContent(event) {
    event.preventDefault();
    if (!client) {
      setText("editor-status", "Сначала подключите Supabase.");
      return;
    }

    const payload = contentPayload();
    const query = contentFields.id.value
      ? client.from("content_sections").update(payload).eq("id", contentFields.id.value)
      : client.from("content_sections").insert(payload);

    const { error } = await query;
    if (error) {
      setText("editor-status", `Ошибка сохранения текста: ${error.message}`);
      return;
    }

    clearContentForm();
    await loadContentRecords();
    setText("editor-status", "Текст сохранен.");
  }

  async function deleteContent() {
    if (!client || !contentFields.id.value) return;
    const { error } = await client.from("content_sections").delete().eq("id", contentFields.id.value);
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
      page_key: mediaFields.page.value,
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

  function fillMediaForm(record) {
    mediaFields.id.value = record.id || "";
    mediaFields.purpose.value = record.purpose || "schedule_pdf";
    mediaFields.page.value = record.page_key || "schedule";
    mediaFields.title.value = record.title || "";
    mediaFields.description.value = record.description || "";
    mediaFields.sort.value = record.sort_order || 0;
    mediaFields.status.value = record.status || "published";
    mediaFields.file.value = "";
  }

  function clearMediaForm() {
    fillMediaForm({ sort_order: 0, status: "published" });
  }

  async function loadMediaRecords() {
    if (!client) return;
    const { data, error } = await client
      .from("media_files")
      .select("*")
      .order("page_key", { ascending: true })
      .order("purpose", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error) {
      mediaRecords = [];
      renderMediaRecords();
      setText("editor-status", `Ошибка чтения media_files: ${error.message}`);
      return;
    }

    mediaRecords = data || [];
    renderMediaRecords();
    setText("editor-status", `Медиафайлов загружено: ${mediaRecords.length}`);
  }

  function renderMediaRecords() {
    const list = $("media-list");
    if (!list) return;
    list.innerHTML = "";

    mediaRecords.forEach((record) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "admin-row admin-media-row";
      const preview = record.mime_type && record.mime_type.startsWith("image/") && record.file_url
        ? `<img src="${escapeHtml(record.file_url)}" alt="">`
        : `<span class="admin-file-chip">${escapeHtml(record.mime_type || "file")}</span>`;
      button.innerHTML = `${preview}<span><strong>${escapeHtml(record.title || record.file_name || "Без названия")}</strong><br><small>${escapeHtml(record.page_key)} / ${escapeHtml(record.purpose)} / ${escapeHtml(record.status)}</small></span>`;
      button.addEventListener("click", () => fillMediaForm(record));
      list.appendChild(button);
    });
  }

  async function saveMedia(event) {
    event.preventDefault();
    if (!client) {
      setText("editor-status", "Сначала подключите Supabase.");
      return;
    }

    const file = mediaFields.file.files[0];
    const current = mediaRecords.find((record) => record.id === mediaFields.id.value);
    let publicUrl = current ? current.file_url : "";
    let storagePath = current ? current.storage_path : "";

    if (file) {
      const extension = file.name.includes(".") ? file.name.split(".").pop() : "bin";
      const safeName = slugify(file.name.replace(/\.[^.]+$/, ""));
      storagePath = `${mediaFields.page.value}/${mediaFields.purpose.value}/${Date.now()}-${safeName}.${extension}`;
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
      setText("editor-status", `Ошибка сохранения медиа: ${error.message}`);
      return;
    }

    clearMediaForm();
    await loadMediaRecords();
    setText("editor-status", "Файл сохранен.");
  }

  async function deleteMedia() {
    if (!client || !mediaFields.id.value) return;
    const record = mediaRecords.find((item) => item.id === mediaFields.id.value);

    if (record && record.storage_path) {
      await client.storage.from(MEDIA_BUCKET).remove([record.storage_path]);
    }

    const { error } = await client.from("media_files").delete().eq("id", mediaFields.id.value);
    if (error) {
      setText("editor-status", `Ошибка удаления медиа: ${error.message}`);
      return;
    }

    clearMediaForm();
    await loadMediaRecords();
    setText("editor-status", "Медиа удалено.");
  }

  function legacyPayload() {
    return {
      item_date: legacyFields.date.value.trim(),
      title: legacyFields.title.value.trim(),
      body: legacyFields.body.value.trim(),
      sort_order: Number(legacyFields.sort.value || 0),
      updated_at: new Date().toISOString()
    };
  }

  function fillLegacyForm(record) {
    legacyFields.id.value = record.id || "";
    legacyFields.type.value = legacyTab;
    legacyFields.date.value = record.item_date || record.slug || record.date || "";
    legacyFields.title.value = record.title || "";
    legacyFields.body.value = record.body || record.content || record.description || "";
    legacyFields.sort.value = record.sort_order || 0;
  }

  function clearLegacyForm() {
    fillLegacyForm({ sort_order: 0 });
  }

  async function loadLegacyRecords() {
    if (!client) return;
    const table = tableMap[legacyTab];
    const { data, error } = await client.from(table).select("*").order("sort_order", { ascending: true });

    if (error) {
      legacyRecords = [];
      renderLegacyRecords();
      setText("editor-status", `Ошибка чтения таблицы ${table}: ${error.message}`);
      return;
    }

    legacyRecords = data || [];
    renderLegacyRecords();
    setText("editor-status", `Старых записей загружено: ${legacyRecords.length}`);
  }

  function renderLegacyRecords() {
    const list = $("records-list");
    if (!list) return;
    list.innerHTML = "";

    legacyRecords.forEach((record) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "admin-row";
      button.innerHTML = `<strong>${escapeHtml(record.title || "Без названия")}</strong><br><span>${escapeHtml(record.item_date || record.slug || "")}</span>`;
      button.addEventListener("click", () => fillLegacyForm(record));
      list.appendChild(button);
    });
  }

  async function saveLegacy(event) {
    event.preventDefault();
    if (!client) {
      setText("editor-status", "Сначала подключите Supabase.");
      return;
    }

    legacyTab = legacyFields.type.value;
    const table = tableMap[legacyTab];
    const payload = legacyPayload();
    const query = legacyFields.id.value
      ? client.from(table).update(payload).eq("id", legacyFields.id.value)
      : client.from(table).insert(payload);

    const { error } = await query;
    if (error) {
      setText("editor-status", `Ошибка сохранения: ${error.message}`);
      return;
    }

    clearLegacyForm();
    await loadLegacyRecords();
    setText("editor-status", "Запись сохранена.");
  }

  async function deleteLegacy() {
    if (!client || !legacyFields.id.value) return;
    const table = tableMap[legacyTab];
    const { error } = await client.from(table).delete().eq("id", legacyFields.id.value);

    if (error) {
      setText("editor-status", `Ошибка удаления: ${error.message}`);
      return;
    }

    clearLegacyForm();
    await loadLegacyRecords();
    setText("editor-status", "Запись удалена.");
  }

  document.addEventListener("DOMContentLoaded", () => {
    const config = getStoredConfig();
    $("supabase-url").value = config.url;
    $("supabase-key").value = config.key;
    if (config.url && config.key) connect(config.url, config.key);

    $("connection-form").addEventListener("submit", (event) => {
      event.preventDefault();
      connect($("supabase-url").value.trim(), $("supabase-key").value.trim());
    });

    $("login-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!client) return;
      const { error } = await client.auth.signInWithPassword({
        email: $("admin-email").value.trim(),
        password: $("admin-password").value
      });
      setText("auth-status", error ? `Ошибка входа: ${error.message}` : "Вход выполнен.");
      refreshSession();
    });

    $("logout-button").addEventListener("click", async () => {
      if (!client) return;
      await client.auth.signOut();
      refreshSession();
    });

    document.querySelectorAll(".admin-tabs button").forEach((button) => {
      button.addEventListener("click", () => switchPanel(button.dataset.tab));
    });

    legacyFields.type.addEventListener("change", () => {
      legacyTab = legacyFields.type.value;
      loadLegacyRecords();
    });

    $("content-form").addEventListener("submit", saveContent);
    $("new-content-button").addEventListener("click", clearContentForm);
    $("delete-content-button").addEventListener("click", deleteContent);

    $("media-form").addEventListener("submit", saveMedia);
    $("new-media-button").addEventListener("click", clearMediaForm);
    $("delete-media-button").addEventListener("click", deleteMedia);

    $("legacy-form").addEventListener("submit", saveLegacy);
    $("new-record-button").addEventListener("click", clearLegacyForm);
    $("delete-record-button").addEventListener("click", deleteLegacy);
  });
})();
