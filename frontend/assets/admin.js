(function () {
  const tableMap = {
    services: "services",
    news: "news",
    pages: "pages"
  };

  let client = null;
  let activeTab = "services";
  let records = [];

  const $ = (id) => document.getElementById(id);

  const fields = {
    id: $("record-id"),
    type: $("record-type"),
    date: $("record-date"),
    title: $("record-title"),
    body: $("record-body"),
    sort: $("record-sort")
  };

  function setText(id, text) {
    const node = $(id);
    if (node) node.textContent = text;
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
    setText("connection-status", "Supabase подключён.");
    refreshSession();
    loadRecords();
  }

  async function refreshSession() {
    if (!client) return;
    const { data } = await client.auth.getSession();
    const email = data.session && data.session.user ? data.session.user.email : null;
    setText("auth-status", email ? `Вход выполнен: ${email}` : "Ожидание входа.");
  }

  function readForm() {
    return {
      id: fields.id.value || undefined,
      item_date: fields.date.value.trim(),
      title: fields.title.value.trim(),
      body: fields.body.value.trim(),
      sort_order: Number(fields.sort.value || 0),
      updated_at: new Date().toISOString()
    };
  }

  function fillForm(record) {
    fields.id.value = record.id || "";
    fields.type.value = activeTab;
    fields.date.value = record.item_date || record.slug || record.date || "";
    fields.title.value = record.title || "";
    fields.body.value = record.body || record.content || record.description || "";
    fields.sort.value = record.sort_order || 0;
  }

  function clearForm() {
    fillForm({ sort_order: 0 });
  }

  async function loadRecords() {
    if (!client) return;
    const table = tableMap[activeTab];
    const { data, error } = await client.from(table).select("*").order("sort_order", { ascending: true });

    if (error) {
      records = [];
      renderRecords();
      setText("editor-status", `Ошибка чтения таблицы ${table}: ${error.message}`);
      return;
    }

    records = data || [];
    renderRecords();
    setText("editor-status", `Загружено записей: ${records.length}`);
  }

  function renderRecords() {
    const list = $("records-list");
    if (!list) return;

    list.innerHTML = "";
    records.forEach((record) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "admin-row";
      button.innerHTML = `<strong>${record.title || "Без названия"}</strong><br><span>${record.item_date || record.slug || ""}</span>`;
      button.addEventListener("click", () => fillForm(record));
      list.appendChild(button);
    });
  }

  async function saveRecord(event) {
    event.preventDefault();
    if (!client) {
      setText("editor-status", "Сначала подключите Supabase.");
      return;
    }

    activeTab = fields.type.value;
    const table = tableMap[activeTab];
    const payload = readForm();
    const query = payload.id
      ? client.from(table).update(payload).eq("id", payload.id)
      : client.from(table).insert(payload);

    const { error } = await query;
    if (error) {
      setText("editor-status", `Ошибка сохранения: ${error.message}`);
      return;
    }

    clearForm();
    await loadRecords();
    setText("editor-status", "Сохранено.");
  }

  async function deleteRecord() {
    if (!client || !fields.id.value) return;
    const table = tableMap[activeTab];
    const { error } = await client.from(table).delete().eq("id", fields.id.value);

    if (error) {
      setText("editor-status", `Ошибка удаления: ${error.message}`);
      return;
    }

    clearForm();
    await loadRecords();
    setText("editor-status", "Удалено.");
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
      button.addEventListener("click", () => {
        document.querySelectorAll(".admin-tabs button").forEach((node) => node.classList.remove("active"));
        button.classList.add("active");
        activeTab = button.dataset.tab;
        fields.type.value = activeTab;
        clearForm();
        loadRecords();
      });
    });

    fields.type.addEventListener("change", () => {
      activeTab = fields.type.value;
      loadRecords();
    });

    $("editor-form").addEventListener("submit", saveRecord);
    $("new-record-button").addEventListener("click", clearForm);
    $("delete-record-button").addEventListener("click", deleteRecord);
  });
})();
