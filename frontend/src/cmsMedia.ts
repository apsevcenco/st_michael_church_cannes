import { escapeHtml, safePublicUrl } from "./shared";
import type { MediaFile } from "./types";

const PDFJS_SCRIPT_URL = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js";
const PDFJS_WORKER_URL = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

function loadPdfJs(): Promise<any> {
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

async function renderPdfPages(pdfUrl: string, pagesContainer: HTMLElement): Promise<void> {
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
    if (!context) continue;

    pagesContainer.appendChild(canvas);
    await page.render({ canvasContext: context, viewport }).promise;
  }
}

function isImageMedia(item: MediaFile): boolean {
  const mimeType = String(item.mime_type || "");
  const fileName = String(item.file_name || item.file_url || "").toLowerCase();
  return mimeType.startsWith("image/") || /\.(jpe?g|png|webp|gif)(\?|#|$)/.test(fileName);
}

function renderScheduleImage(imageUrl: string, pagesContainer: HTMLElement, title?: string | null): void {
  pagesContainer.innerHTML = "";

  const image = document.createElement("img");
  image.className = "schedule-image-page";
  image.src = imageUrl;
  image.alt = title || "Расписание богослужений";
  image.loading = "lazy";
  pagesContainer.appendChild(image);
}

export async function applySchedulePdf(media: MediaFile[]): Promise<void> {
  const pdf = media.find((item) => item.purpose === "schedule_pdf" && item.file_url);
  const pdfUrl = safePublicUrl(pdf?.file_url);
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
  } catch {
    pages.innerHTML = '<p class="empty-public-message">Не удалось показать PDF на странице.</p>';
  }
}

export function applyDocuments(media: MediaFile[]): void {
  const documents = media
    .map((item) => ({ ...item, safe_url: safePublicUrl(item.file_url) }))
    .filter((item) => item.safe_url && !(item.mime_type || "").startsWith("image/") && item.purpose !== "schedule_pdf");

  if (!documents.length) return;

  let target = document.querySelector("[data-cms-documents]");
  if (!target) {
    const section = document.createElement("section");
    section.className = "section cms-documents";
    section.setAttribute("data-cms-documents", "");
    document.querySelector("main")?.appendChild(section);
    target = section;
  }

  target.insertAdjacentHTML(
    "beforeend",
    `
      <div class="document-list">
        ${documents
          .map(
            (item) => `
          <a class="info-card document-card" href="${escapeHtml(item.safe_url)}" target="_blank" rel="noopener">
            <h2>${escapeHtml(item.title || item.file_name || "Документ")}</h2>
            ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
          </a>
        `
          )
          .join("")}
      </div>
    `
  );
}

export function applyGallery(media: MediaFile[]): void {
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
    document.querySelector("main")?.appendChild(section);
  }

  gallery.innerHTML = images
    .map(
      (item) => `
      <figure class="photo-card">
        <img src="${escapeHtml(item.safe_url)}" alt="${escapeHtml(item.description || item.title || "")}" loading="lazy">
        <figcaption>${escapeHtml(item.title || item.description || "")}</figcaption>
      </figure>
    `
    )
    .join("");
}

export function setupLightbox(): void {
  const images = Array.from(document.querySelectorAll<HTMLImageElement>(".photo-gallery img, .news-photo-strip img, .news-card-image"));
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
  if (!lightboxImage) return;

  const show = (nextIndex: number) => {
    index = (nextIndex + images.length) % images.length;
    lightboxImage.src = images[index].src;
    lightboxImage.alt = images[index].alt || "";
    overlay.classList.add("is-open");
  };

  images.forEach((image, imageIndex) => {
    image.addEventListener("click", () => show(imageIndex));
    image.closest("figure")?.classList.add("is-clickable");
  });

  overlay.querySelector(".lightbox-close")?.addEventListener("click", () => overlay.classList.remove("is-open"));
  overlay.querySelector(".lightbox-prev")?.addEventListener("click", () => show(index - 1));
  overlay.querySelector(".lightbox-next")?.addEventListener("click", () => show(index + 1));
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
