// @ts-nocheck

import "./site-config";
import { createAdminAuth } from "./adminAuth";
import { createAdminContent } from "./adminContent";
import { adminSections } from "./adminConfig";
import { createAdminMedia } from "./adminMedia";
import { createAdminNews } from "./adminNews";
import { escapeHtml } from "./shared";
import type { AdminSectionConfig, ContentSection, LanguageCode, MediaFile, ParishNews, ParishNewsPhoto } from "./types";

(function () {
  const sections = adminSections;

  let client = null;
  let activeSection = sections[0];
  let activeLanguage = "ru";

  const $ = (id) => document.getElementById(id);

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

  const news = createAdminNews({
    $,
    setText,
    getClient: () => client,
    getSection: () => activeSection,
    getLanguage: () => activeLanguage
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
    news.clearForm();
    renderLanguageButtons();
    if (content.hasEditor()) content.loadRecords();
    if (activeSection.newsManager) news.loadRecords();
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
    if (activeSection.newsManager) await news.loadRecords();
    if (activeSection.statsManager) await loadStats();
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
    news.bindEvents();
    auth.checkSession();

    document.querySelectorAll(".admin-language-switch button").forEach((button) => {
      button.addEventListener("click", () => selectLanguage(button.dataset.language));
    });

    $("refresh-stats-button").addEventListener("click", loadStats);
  });
})();
