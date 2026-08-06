import { escapeHtml, paragraphsToHtml } from "./shared";
import type { ContentSection } from "./types";

export function applyHero(record?: ContentSection): void {
  const hero = document.querySelector(".page-hero");
  if (!hero || !record) return;

  const h1 = hero.querySelector("h1");
  const text = hero.querySelector("p:not(.section-label)");

  if (h1 && Object.prototype.hasOwnProperty.call(record, "title")) h1.textContent = record.title || "";
  if (text && Object.prototype.hasOwnProperty.call(record, "summary")) text.textContent = record.summary || "";
}

export function applyBody(record?: ContentSection): void {
  if (!record) return;

  const target =
    document.querySelector("[data-cms-body]") ||
    document.querySelector(".history-article") ||
    document.querySelector(".section.two-columns > div:first-child");

  if (!target) return;
  target.innerHTML = paragraphsToHtml(record.body);
}

export function applyNamedBlocks(records: ContentSection[]): void {
  document.querySelectorAll("[data-cms-section]").forEach((target) => {
    const key = target.getAttribute("data-cms-section");
    const record = records.find((item) => item.section_key === key);
    if (!record) return;

    const title = target.querySelector("[data-cms-title]");
    const body = target.querySelector("[data-cms-text]");

    if (title && Object.prototype.hasOwnProperty.call(record, "title")) {
      title.textContent = record.title || "";
      title.toggleAttribute("hidden", !record.title);
    }

    if (body && Object.prototype.hasOwnProperty.call(record, "body")) body.innerHTML = paragraphsToHtml(record.body);
  });
}

export function applyExtraBlocks(records: ContentSection[]): void {
  const target = document.querySelector("[data-cms-extra]");
  if (!target) return;

  const extras = records.filter((item) => {
    return !["hero", "body"].includes(item.section_key) && (item.title || item.summary || item.body);
  });

  if (!extras.length) return;

  target.innerHTML = extras
    .map(
      (item) => `
      <article class="info-card">
        ${item.title ? `<h2>${escapeHtml(item.title)}</h2>` : ""}
        ${item.summary ? `<p>${escapeHtml(item.summary)}</p>` : ""}
        ${item.body ? paragraphsToHtml(item.body) : ""}
      </article>
    `
    )
    .join("");
}
