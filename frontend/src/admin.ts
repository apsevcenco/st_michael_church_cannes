// @ts-nocheck

import "./site-config";
import { createAdminAuth } from "./adminAuth";
import { createAdminContent } from "./adminContent";
import { adminSections } from "./adminConfig";
import { createAdminMedia } from "./adminMedia";
import { createAdminNews } from "./adminNews";
import { createAdminStats } from "./adminStats";
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

  const stats = createAdminStats({
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
    if (activeSection.statsManager) await stats.load();
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
    stats.bindEvents();
    auth.checkSession();

    document.querySelectorAll(".admin-language-switch button").forEach((button) => {
      button.addEventListener("click", () => selectLanguage(button.dataset.language));
    });

  });
})();
