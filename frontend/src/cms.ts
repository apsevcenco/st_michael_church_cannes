// @ts-nocheck

import "./site-config";
import { applyBody, applyExtraBlocks, applyHero, applyNamedBlocks } from "./cmsContent";
import { applyDocuments, applyGallery, applySchedulePdf, setupLightbox } from "./cmsMedia";
import { languageFromLocation, pageKeyFromLocation } from "./cmsRouting";
import { trackVisit } from "./cmsVisits";
import { escapeHtml, formatPublicDate, paragraphsToHtml, safePublicUrl } from "./shared";
import type { LanguageCode, ParishNews, ParishNewsPhoto } from "./types";

(function () {
  function groupPhotos(photos) {
    return (photos || []).reduce((groups, photo) => {
      const key = photo.news_id;
      if (!groups[key]) groups[key] = [];
      groups[key].push(photo);
      return groups;
    }, {});
  }

  function renderNewsCard(item, photos, language) {
    const safePhotos = (photos || [])
      .map((photo) => ({ ...photo, safe_url: safePublicUrl(photo.file_url) }))
      .filter((photo) => photo.safe_url);
    const firstPhoto = safePhotos[0];
    return `
      <article class="news-card">
        ${firstPhoto ? `<img class="news-card-image" src="${escapeHtml(firstPhoto.safe_url)}" alt="${escapeHtml(firstPhoto.description || item.title)}" loading="lazy">` : ""}
        <time>${escapeHtml(formatPublicDate(item.event_date, language))}</time>
        <h3>${escapeHtml(item.title)}</h3>
        ${item.excerpt ? `<p>${escapeHtml(item.excerpt)}</p>` : ""}
        ${item.body ? `<details><summary>${language === "fr" ? "Lire la suite" : language === "en" ? "Read more" : "Читать полностью"}</summary>${paragraphsToHtml(item.body)}</details>` : ""}
        ${safePhotos.length > 1 ? `<div class="news-photo-strip">${safePhotos.map((photo) => `<img src="${escapeHtml(photo.safe_url)}" alt="${escapeHtml(photo.description || item.title)}" loading="lazy">`).join("")}</div>` : ""}
      </article>
    `;
  }

  async function loadNews(client, language) {
    const hasHomeNews = document.querySelector("[data-home-news]");
    const hasNewsList = document.querySelector("[data-news-list]");
    if (!hasHomeNews && !hasNewsList) return;

    const [{ data: news }, { data: photos }] = await Promise.all([
      client
        .from("parish_news")
        .select("*")
        .eq("language", language)
        .eq("status", "published")
        .order("event_date", { ascending: false })
        .order("sort_order", { ascending: true }),
      client
        .from("parish_news_photos")
        .select("*")
        .order("sort_order", { ascending: true })
    ]);

    const items = news || [];
    const photosByNews = groupPhotos(photos || []);

    if (hasHomeNews) {
      hasHomeNews.innerHTML = items.slice(0, 3).map((item) => renderNewsCard(item, photosByNews[item.id] || [], language)).join("");
    }

    if (hasNewsList) {
      if (!items.length) {
        hasNewsList.innerHTML = `<p class="empty-public-message">${language === "fr" ? "Les nouvelles seront publiées prochainement." : language === "en" ? "News will be published soon." : "Новости будут опубликованы в ближайшее время."}</p>`;
      } else {
        hasNewsList.innerHTML = items.map((item) => renderNewsCard(item, photosByNews[item.id] || [], language)).join("");
      }
    }
  }

  async function loadCms() {
    if (!window.supabase || !window.ST_MICHAEL_SUPABASE_URL || !window.ST_MICHAEL_SUPABASE_ANON_KEY) return;

    const pageKey = pageKeyFromLocation();
    const language = languageFromLocation();
    const client = window.supabase.createClient(window.ST_MICHAEL_SUPABASE_URL, window.ST_MICHAEL_SUPABASE_ANON_KEY);
    trackVisit(client, pageKey, language);

    const [{ data: sections }, { data: media }] = await Promise.all([
      client
        .from("content_sections")
        .select("*")
        .eq("page_key", pageKey)
        .eq("language", language)
        .eq("status", "published")
        .order("sort_order", { ascending: true }),
      client
        .from("media_files")
        .select("*")
        .eq("page_key", pageKey)
        .eq("status", "published")
        .order("sort_order", { ascending: true })
    ]);

    const content = sections || [];
    applyHero(content.find((item) => item.section_key === "hero"));
    applyBody(content.find((item) => item.section_key === "body"));
    applyNamedBlocks(content);
    applyExtraBlocks(content);

    const mediaFiles = media || [];
    await applySchedulePdf(mediaFiles);
    applyDocuments(mediaFiles);
    applyGallery(mediaFiles);
    await loadNews(client, language);
    setupLightbox();
  }

  document.addEventListener("DOMContentLoaded", loadCms);
})();
