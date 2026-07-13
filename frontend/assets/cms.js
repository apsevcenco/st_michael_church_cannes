(function () {
  const pageMap = {
    "index.html": "home",
    "": "home",
    "fr.html": "home",
    "en.html": "home"
  };

  function pageKeyFromLocation() {
    const file = window.location.pathname.split("/").pop() || "index.html";
    if (pageMap[file] !== undefined) return pageMap[file];
    return file.replace(/\.html$/, "").replace(/-(fr|en)$/, "");
  }

  function languageFromLocation() {
    const file = window.location.pathname.split("/").pop() || "index.html";
    if (file.endsWith("-fr.html") || file === "fr.html") return "fr";
    if (file.endsWith("-en.html") || file === "en.html") return "en";
    return document.documentElement.lang || "ru";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function safePublicUrl(value) {
    if (!value) return "";
    try {
      const url = new URL(value, window.location.origin);
      if (!["https:", "http:"].includes(url.protocol)) return "";
      if (url.protocol === "http:" && url.hostname !== window.location.hostname) return "";
      return url.href;
    } catch (_) {
      return "";
    }
  }

  function visitorSessionId() {
    const key = "st_michael_visit_session";
    let value = "";
    try {
      value = window.localStorage.getItem(key) || "";
      if (!value) {
        value = window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
        window.localStorage.setItem(key, value);
      }
    } catch (_) {
      value = "";
    }
    return value;
  }

  async function trackVisit(client, pageKey, language) {
    const file = window.location.pathname.split("/").pop() || "index.html";
    if (file === "admin.html") return;

    try {
      await client.from("page_visits").insert({
        page_key: pageKey,
        page_path: window.location.pathname,
        language,
        session_id: visitorSessionId(),
        referrer: document.referrer ? document.referrer.slice(0, 500) : "",
        user_agent: navigator.userAgent ? navigator.userAgent.slice(0, 500) : ""
      });
    } catch (_) {
      // Statistics must never block public page rendering.
    }
  }

  function paragraphsToHtml(text) {
    return String(text || "")
      .split(/\n{2,}/)
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => `<p>${escapeHtml(part).replace(/\n/g, "<br>")}</p>`)
      .join("");
  }

  function formatDate(value, language) {
    if (!value) return "";
    try {
      return new Intl.DateTimeFormat(language === "en" ? "en-GB" : language === "fr" ? "fr-FR" : "ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(new Date(`${value}T00:00:00`));
    } catch (_) {
      return value;
    }
  }

  function applyHero(record) {
    const hero = document.querySelector(".page-hero");
    if (!hero || !record) return;
    const h1 = hero.querySelector("h1");
    const text = hero.querySelector("p:not(.section-label)");
    if (h1 && Object.prototype.hasOwnProperty.call(record, "title")) h1.textContent = record.title || "";
    if (text && Object.prototype.hasOwnProperty.call(record, "summary")) text.textContent = record.summary || "";
  }

  function applyBody(record) {
    if (!record) return;
    const target =
      document.querySelector("[data-cms-body]") ||
      document.querySelector(".history-article") ||
      document.querySelector(".section.two-columns > div:first-child");

    if (!target) return;
    target.innerHTML = paragraphsToHtml(record.body);
  }

  function applyNamedBlocks(records) {
    document.querySelectorAll("[data-cms-section]").forEach((target) => {
      const key = target.getAttribute("data-cms-section");
      const record = records.find((item) => item.section_key === key);
      if (!record) return;

      const title = target.querySelector("[data-cms-title]");
      const body = target.querySelector("[data-cms-text]");
      if (title && Object.prototype.hasOwnProperty.call(record, "title")) {
        title.textContent = record.title || "";
        title.hidden = !record.title;
      }
      if (body && Object.prototype.hasOwnProperty.call(record, "body")) body.innerHTML = paragraphsToHtml(record.body);
    });
  }

  function applyExtraBlocks(records) {
    const target = document.querySelector("[data-cms-extra]");
    if (!target) return;

    const extras = records.filter((item) => {
      return !["hero", "body"].includes(item.section_key) && (item.title || item.summary || item.body);
    });
    if (!extras.length) return;

    target.innerHTML = extras.map((item) => `
      <article class="info-card">
        ${item.title ? `<h2>${escapeHtml(item.title)}</h2>` : ""}
        ${item.summary ? `<p>${escapeHtml(item.summary)}</p>` : ""}
        ${item.body ? paragraphsToHtml(item.body) : ""}
      </article>
    `).join("");
  }

  function applySchedulePdf(media) {
    const pdf = media.find((item) => item.purpose === "schedule_pdf" && item.file_url);
    const pdfUrl = safePublicUrl(pdf && pdf.file_url);
    if (!pdf || !pdfUrl) return;

    const target = document.querySelector("[data-cms-documents]") || document.querySelector(".schedule-poster");
    if (!target) return;

    target.querySelector(".pdf-viewer")?.remove();
    target.querySelector(".cms-media-button")?.remove();

    const viewer = document.createElement("div");
    viewer.className = "pdf-viewer";

    const frame = document.createElement("iframe");
    frame.className = "pdf-viewer-frame";
    frame.title = pdf.title || "?????????? ????????????";
    frame.src = pdfUrl;
    frame.loading = "lazy";
    viewer.appendChild(frame);

    const fallback = document.createElement("p");
    fallback.className = "pdf-viewer-fallback";
    fallback.textContent = "???? PDF ?? ???????????? ? ????????, ???????? ??? ? ????? ???????.";
    viewer.appendChild(fallback);

    const link = document.createElement("a");
    link.className = "button primary cms-media-button";
    link.href = pdfUrl;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = pdf.title || "??????? PDF ?????????? ????????????";
    viewer.appendChild(link);

    target.appendChild(viewer);
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
        <time>${escapeHtml(formatDate(item.event_date, language))}</time>
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
