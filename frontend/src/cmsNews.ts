import { escapeHtml, formatPublicDate, paragraphsToHtml, safePublicUrl } from "./shared";
import type { LanguageCode, ParishNews, ParishNewsPhoto } from "./types";

type SupabaseClient = {
  from: (table: string) => any;
};

type PhotosByNews = Record<string, ParishNewsPhoto[]>;

function groupPhotos(photos: ParishNewsPhoto[] = []): PhotosByNews {
  return photos.reduce<PhotosByNews>((groups, photo) => {
    const key = photo.news_id;
    if (!groups[key]) groups[key] = [];
    groups[key].push(photo);
    return groups;
  }, {});
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
        ${item.excerpt ? `<p>${escapeHtml(item.excerpt)}</p>` : ""}
        ${item.body ? `<details><summary>${language === "fr" ? "Lire la suite" : language === "en" ? "Read more" : "Читать полностью"}</summary>${paragraphsToHtml(item.body)}</details>` : ""}
        ${safePhotos.length > 1 ? `<div class="news-photo-strip">${safePhotos.map((photo) => `<img src="${escapeHtml(photo.safe_url)}" alt="${escapeHtml(photo.description || item.title)}" loading="lazy">`).join("")}</div>` : ""}
      </article>
    `;
}

export async function loadNews(client: SupabaseClient, language: LanguageCode): Promise<void> {
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
