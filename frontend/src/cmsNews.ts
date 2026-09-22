import { escapeHtml, formatPublicDate, richTextToHtml, safePublicUrl } from "./shared";
import type { LanguageCode, ParishNews, ParishNewsPhoto } from "./types";

type SupabaseClient = {
  from: (table: string) => any;
};

type PhotosByNews = Record<string, ParishNewsPhoto[]>;

const readMoreLabels: Record<LanguageCode, string> = {
  ru: "Читать полностью",
  fr: "Lire la suite",
  en: "Read more",
};

const notFoundLabels: Record<LanguageCode, string> = {
  ru: "Новость не найдена или еще не опубликована.",
  fr: "L'actualité est introuvable ou n'est pas encore publiée.",
  en: "The news item was not found or is not published yet.",
};

function groupPhotos(photos: ParishNewsPhoto[] = []): PhotosByNews {
  return photos.reduce<PhotosByNews>((groups, photo) => {
    const key = photo.news_id;
    if (!groups[key]) groups[key] = [];
    groups[key].push(photo);
    return groups;
  }, {});
}

function newsDetailUrl(id: string, language: LanguageCode): string {
  const suffix = language === "ru" ? "" : `-${language}`;
  return `news-detail${suffix}.html?id=${encodeURIComponent(id)}`;
}

function syncDetailLanguageLinks(id: string): void {
  document.querySelectorAll<HTMLAnchorElement>(".church-lang-switch a").forEach((link) => {
    const href = link.getAttribute("href") || "";
    if (!href.startsWith("news-detail")) return;
    link.href = `${href.split("?")[0]}?id=${encodeURIComponent(id)}`;
  });
}

function renderNewsCard(item: ParishNews, photos: ParishNewsPhoto[], language: LanguageCode): string {
  const safePhotos = (photos || [])
    .map((photo) => ({ ...photo, safe_url: safePublicUrl(photo.file_url) }))
    .filter((photo) => photo.safe_url);
  const firstPhoto = safePhotos[0];

  return `
      <article class="news-card">
        ${firstPhoto ? `<img class="news-card-image" src="${escapeHtml(firstPhoto.safe_url)}" alt="${escapeHtml(firstPhoto.description || item.title)}" loading="lazy">` : ""}
        <time>${escapeHtml(formatPublicDate(item.event_date, language))}</time>
        <h3>${escapeHtml(item.title)}</h3>
        ${item.excerpt ? richTextToHtml(item.excerpt) : ""}
        <a class="text-link news-read-more" href="${escapeHtml(newsDetailUrl(item.id, language))}">${escapeHtml(readMoreLabels[language])}</a>
        ${safePhotos.length > 1 ? `<div class="news-photo-strip">${safePhotos.map((photo) => `<img src="${escapeHtml(photo.safe_url)}" alt="${escapeHtml(photo.description || item.title)}" loading="lazy">`).join("")}</div>` : ""}
      </article>
    `;
}

function renderNewsDetail(item: ParishNews, photos: ParishNewsPhoto[], language: LanguageCode): void {
  const titleNode = document.querySelector<HTMLElement>("[data-news-detail-title]");
  const dateNode = document.querySelector<HTMLElement>("[data-news-detail-date]");
  const bodyNode = document.querySelector<HTMLElement>("[data-news-detail-body]");
  const photosNode = document.querySelector<HTMLElement>("[data-news-detail-photos]");

  if (titleNode) titleNode.textContent = item.title;
  if (dateNode) dateNode.textContent = formatPublicDate(item.event_date, language);
  if (bodyNode) bodyNode.innerHTML = richTextToHtml(item.body || item.excerpt || "");

  if (photosNode) {
    const safePhotos = (photos || [])
      .map((photo) => ({ ...photo, safe_url: safePublicUrl(photo.file_url) }))
      .filter((photo) => photo.safe_url);

    photosNode.innerHTML = safePhotos
      .map(
        (photo) => `
          <figure class="photo-card">
            <img src="${escapeHtml(photo.safe_url)}" alt="${escapeHtml(photo.description || item.title)}" loading="lazy">
            ${photo.description ? `<figcaption>${escapeHtml(photo.description)}</figcaption>` : ""}
          </figure>
        `,
      )
      .join("");
  }
}

async function resolveTranslatedNewsDetail(client: SupabaseClient, id: string, language: LanguageCode): Promise<ParishNews | null> {
  const { data: direct } = await client
    .from("parish_news")
    .select("*")
    .eq("id", id)
    .eq("language", language)
    .eq("status", "published")
    .maybeSingle();

  if (direct) return direct as ParishNews;

  const { data: source } = await client
    .from("parish_news")
    .select("id, translation_group_id")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  const groupId = source?.translation_group_id || source?.id;
  if (!groupId) return null;

  const { data: translated } = await client
    .from("parish_news")
    .select("*")
    .eq("translation_group_id", groupId)
    .eq("language", language)
    .eq("status", "published")
    .maybeSingle();

  return (translated || null) as ParishNews | null;
}

async function loadNewsDetail(client: SupabaseClient, language: LanguageCode): Promise<void> {
  const detailNode = document.querySelector<HTMLElement>("[data-news-detail]");
  if (!detailNode) return;

  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) {
    detailNode.innerHTML = `<p class="empty-public-message">${escapeHtml(notFoundLabels[language])}</p>`;
    return;
  }
  syncDetailLanguageLinks(id);

  const item = await resolveTranslatedNewsDetail(client, id, language);
  if (!item) {
    detailNode.innerHTML = `<p class="empty-public-message">${escapeHtml(notFoundLabels[language])}</p>`;
    return;
  }

  const { data: photos } = await client
    .from("parish_news_photos")
    .select("*")
    .eq("news_id", item.id)
    .order("sort_order", { ascending: true });

  renderNewsDetail(item, (photos || []) as ParishNewsPhoto[], language);
}

export async function loadNews(client: SupabaseClient, language: LanguageCode): Promise<void> {
  const hasHomeNews = document.querySelector("[data-home-news]");
  const hasNewsList = document.querySelector("[data-news-list]");
  const hasNewsDetail = document.querySelector("[data-news-detail]");

  if (hasNewsDetail) {
    await loadNewsDetail(client, language);
  }

  if (!hasHomeNews && !hasNewsList) return;

  const [{ data: news }, { data: photos }] = await Promise.all([
    client
      .from("parish_news")
      .select("*")
      .eq("language", language)
      .eq("status", "published")
      .order("event_date", { ascending: false })
      .order("sort_order", { ascending: true }),
    client.from("parish_news_photos").select("*").order("sort_order", { ascending: true })
  ]);

  const items = (news || []) as ParishNews[];
  const photosByNews = groupPhotos((photos || []) as ParishNewsPhoto[]);

  if (hasHomeNews) {
    hasHomeNews.innerHTML = items
      .slice(0, 3)
      .map((item) => renderNewsCard(item, photosByNews[item.id] || [], language))
      .join("");
  }

  if (hasNewsList) {
    if (!items.length) {
      hasNewsList.innerHTML = `<p class="empty-public-message">${language === "fr" ? "Les nouvelles seront publiées prochainement." : language === "en" ? "News will be published soon." : "Новости будут опубликованы в ближайшее время."}</p>`;
    } else {
      hasNewsList.innerHTML = items.map((item) => renderNewsCard(item, photosByNews[item.id] || [], language)).join("");
    }
  }
}
