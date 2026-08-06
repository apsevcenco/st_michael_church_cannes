// @ts-nocheck

import "./site-config";
import { createAdminAuth } from "./adminAuth";
import { createAdminContent } from "./adminContent";
import { MEDIA_BUCKET, adminSections, fileExtension, slugify, validateUploadFile } from "./adminConfig";
import { createAdminMedia } from "./adminMedia";
import { escapeHtml } from "./shared";
import type { AdminSectionConfig, ContentSection, LanguageCode, MediaFile, ParishNews, ParishNewsPhoto } from "./types";

(function () {
  const sections = adminSections;

  let client = null;
  let activeSection = sections[0];
  let activeLanguage = "ru";
  let newsRecords = [];
  let newsPhotos = [];

  const $ = (id) => document.getElementById(id);

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

  const content = createAdminContent({
    $,
    setText,
    getClient: () => client,
    getSection: () => activeSection,
    getLanguage: () => activeLanguage
  });

  const media = createAdminMedia({
    $,
    setText,
    getClient: () => client,
    getSection: () => activeSection
  });

  function showWorkspace(email) {
    document.body.classList.remove("is-login");
    document.body.classList.add("is-authenticated");
    $("login-screen").hidden = true;
    $("admin-workspace").hidden = false;
    setText("admin-user-email", email || "");
    loadSectionData();
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
    if (editorGrid) editorGrid.hidden = activeSection.statsManager || (!content.hasEditor() && !media.hasEditor());
  }

  function selectSection(key) {
    activeSection = sections.find((section) => section.key === key) || sections[0];
    content.setSection(activeSection);
    content.clearForm();
    media.clearForm();
    renderSectionMenu();
    renderSectionHeader();
    content.renderBlockTabs();
    media.renderPurposes();
    loadSectionData();
  }

  function selectLanguage(language) {
    activeLanguage = language;
    content.clearForm();
    clearNewsForm();
    renderLanguageButtons();
    if (content.hasEditor()) content.loadRecords();
    if (activeSection.newsManager) loadNewsRecords();
  }

  async function loadSectionData() {
    if (!client || $("admin-workspace").hidden) return;
    renderSectionMenu();
    renderSectionHeader();
    content.renderBlockTabs();
    media.renderPurposes();
    renderLanguageButtons();
    const jobs = [];
    if (content.hasEditor()) jobs.push(content.loadRecords());
    else {
      content.clearRecords();
    }
    if (media.hasEditor()) jobs.push(media.loadRecords());
    else {
      media.clearRecords();
    }
    await Promise.all(jobs);
    if (activeSection.newsManager) await loadNewsRecords();
    if (activeSection.statsManager) await loadStats();
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
      const validation = validateUploadFile(file, activeSection);
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
    const auth = createAdminAuth({
      $,
      setText,
      getClient: () => client,
      setClient: (nextClient) => {
        client = nextClient;
      },
      onWorkspaceReady: showWorkspace
    });

    if (!auth.connect()) return;

    renderSectionMenu();
    renderSectionHeader();
    content.renderBlockTabs();
    media.renderPurposes();
    auth.bindEvents();
    content.bindEvents();
    media.bindEvents();
    auth.checkSession();

    document.querySelectorAll(".admin-language-switch button").forEach((button) => {
      button.addEventListener("click", () => selectLanguage(button.dataset.language));
    });

    $("news-form").addEventListener("submit", saveNews);
    $("clear-news-button").addEventListener("click", clearNewsForm);
    $("delete-news-button").addEventListener("click", deleteNews);
    $("refresh-stats-button").addEventListener("click", loadStats);
  });
})();
