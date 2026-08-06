// @ts-nocheck

import "./site-config";
import { applyBody, applyExtraBlocks, applyHero, applyNamedBlocks } from "./cmsContent";
import { languageFromLocation, pageKeyFromLocation } from "./cmsRouting";
import { trackVisit } from "./cmsVisits";
import { escapeHtml, formatPublicDate, paragraphsToHtml, safePublicUrl } from "./shared";
import type { LanguageCode, MediaFile, ParishNews, ParishNewsPhoto } from "./types";

(function () {
  const PDFJS_SCRIPT_URL = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js";
  const PDFJS_WORKER_URL = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

  function loadPdfJs() {
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);

    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-pdfjs="true"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(window.pdfjsLib));
        existing.addEventListener("error", reject);
        return;
      }

      const script = document.createElement("script");
      script.src = PDFJS_SCRIPT_URL;
      script.async = true;
      script.dataset.pdfjs = "true";
      script.onload = () => resolve(window.pdfjsLib);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async function renderPdfPages(pdfUrl, pagesContainer) {
    const pdfjsLib = await loadPdfJs();
    pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;

    const loadingTask = pdfjsLib.getDocument({ url: pdfUrl });
    const pdfDocument = await loadingTask.promise;
    const maxWidth = Math.min(pagesContainer.clientWidth || 920, 1100);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    pagesContainer.innerHTML = "";

    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
      const page = await pdfDocument.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1 });
      const cssScale = Math.min(maxWidth / baseViewport.width, 1.65);
      const viewport = page.getViewport({ scale: cssScale * pixelRatio });

      const canvas = document.createElement("canvas");
      canvas.className = "pdf-page-canvas";
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.width = `${Math.floor(viewport.width / pixelRatio)}px`;
      canvas.style.height = `${Math.floor(viewport.height / pixelRatio)}px`;

      const context = canvas.getContext("2d");
      pagesContainer.appendChild(canvas);
      await page.render({ canvasContext: context, viewport }).promise;
    }
  }

  function isImageMedia(item) {
    const mimeType = String(item && item.mime_type ? item.mime_type : "");
    const fileName = String(item && (item.file_name || item.file_url) ? (item.file_name || item.file_url) : "").toLowerCase();
    return mimeType.startsWith("image/") || /\.(jpe?g|png|webp|gif)(\?|#|$)/.test(fileName);
  }

  function renderScheduleImage(imageUrl, pagesContainer, title) {
    pagesContainer.innerHTML = "";
    const image = document.createElement("img");
    image.className = "schedule-image-page";
    image.src = imageUrl;
    image.alt = title || "Расписание богослужений";
    image.loading = "lazy";
    pagesContainer.appendChild(image);
  }

  async function applySchedulePdf(media) {
    const pdf = media.find((item) => item.purpose === "schedule_pdf" && item.file_url);
    const pdfUrl = safePublicUrl(pdf && pdf.file_url);
    if (!pdf || !pdfUrl) return;

    const target = document.querySelector("[data-cms-documents]") || document.querySelector(".schedule-poster");
    if (!target) return;

    target.querySelector(".pdf-viewer")?.remove();
    target.querySelector(".cms-media-button")?.remove();

    const viewer = document.createElement("div");
    viewer.className = "pdf-viewer";

    const pages = document.createElement("div");
    pages.className = "pdf-pages";
    pages.textContent = "Загружаем расписание...";
    viewer.appendChild(pages);

    const fallback = document.createElement("p");
    fallback.className = "pdf-viewer-fallback";
    fallback.textContent = "Если расписание не отобразилось, откройте PDF в новой вкладке.";
    viewer.appendChild(fallback);

    const link = document.createElement("a");
    link.className = "button primary cms-media-button";
    link.href = pdfUrl;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = pdf.title || "Открыть PDF расписания богослужений";
    viewer.appendChild(link);

    target.appendChild(viewer);

    try {
      if (isImageMedia(pdf)) {
        renderScheduleImage(pdfUrl, pages, pdf.title);
      } else {
        await renderPdfPages(pdfUrl, pages);
      }
    } catch (_) {
      pages.innerHTML = '<p class="empty-public-message">Не удалось показать PDF на странице.</p>';
    }
  }
  function applyDocuments(media) {
    const documents = media
      .map((item) => ({ ...item, safe_url: safePublicUrl(item.file_url) }))
      .filter((item) => item.safe_url && !(item.mime_type || "").startsWith("image/") && item.purpose !== "schedule_pdf");
    if (!documents.length) return;

    let target = document.querySelector("[data-cms-documents]");
    if (!target) {
      const section = document.createElement("section");
      section.className = "section cms-documents";
      section.setAttribute("data-cms-documents", "");
      document.querySelector("main").appendChild(section);
      target = section;
    }

    target.insertAdjacentHTML("beforeend", `
      <div class="document-list">
        ${documents.map((item) => `
          <a class="info-card document-card" href="${escapeHtml(item.safe_url)}" target="_blank" rel="noopener">
            <h2>${escapeHtml(item.title || item.file_name || "Документ")}</h2>
            ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
          </a>
        `).join("")}
      </div>
    `);
  }

  function applyGallery(media) {
    const images = media
      .map((item) => ({ ...item, safe_url: safePublicUrl(item.file_url) }))
      .filter((item) => item.safe_url && (item.mime_type || "").startsWith("image/"));
    if (!images.length) return;

    let gallery = document.querySelector("[data-cms-gallery]") || document.querySelector(".photo-gallery");
    if (!gallery) {
      const section = document.createElement("section");
      section.className = "section";
      gallery = document.createElement("div");
      gallery.className = "photo-gallery";
      gallery.setAttribute("data-cms-gallery", "");
      section.appendChild(gallery);
      document.querySelector("main").appendChild(section);
    }

    gallery.innerHTML = images.map((item) => `
      <figure class="photo-card">
        <img src="${escapeHtml(item.safe_url)}" alt="${escapeHtml(item.description || item.title || "")}" loading="lazy">
        <figcaption>${escapeHtml(item.title || item.description || "")}</figcaption>
      </figure>
    `).join("");
  }

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

  function setupLightbox() {
    const images = Array.from(document.querySelectorAll(".photo-gallery img, .news-photo-strip img, .news-card-image"));
    if (!images.length || document.querySelector(".lightbox")) return;

    let index = 0;
    const overlay = document.createElement("div");
    overlay.className = "lightbox";
    overlay.innerHTML = `
      <button class="lightbox-close" type="button" aria-label="Close">×</button>
      <button class="lightbox-prev" type="button" aria-label="Previous">‹</button>
      <img alt="">
      <button class="lightbox-next" type="button" aria-label="Next">›</button>
    `;
    document.body.appendChild(overlay);

    const lightboxImage = overlay.querySelector("img");
    const show = (nextIndex) => {
      index = (nextIndex + images.length) % images.length;
      lightboxImage.src = images[index].src;
      lightboxImage.alt = images[index].alt || "";
      overlay.classList.add("is-open");
    };

    images.forEach((image, imageIndex) => {
      image.addEventListener("click", () => show(imageIndex));
      image.closest("figure")?.classList.add("is-clickable");
    });

    overlay.querySelector(".lightbox-close").addEventListener("click", () => overlay.classList.remove("is-open"));
    overlay.querySelector(".lightbox-prev").addEventListener("click", () => show(index - 1));
    overlay.querySelector(".lightbox-next").addEventListener("click", () => show(index + 1));
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) overlay.classList.remove("is-open");
    });
    document.addEventListener("keydown", (event) => {
      if (!overlay.classList.contains("is-open")) return;
      if (event.key === "Escape") overlay.classList.remove("is-open");
      if (event.key === "ArrowLeft") show(index - 1);
      if (event.key === "ArrowRight") show(index + 1);
    });
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
    applySchedulePdf(mediaFiles);
    applyDocuments(mediaFiles);
    applyGallery(mediaFiles);
    await loadNews(client, language);
    setupLightbox();
  }

  document.addEventListener("DOMContentLoaded", loadCms);
})();
