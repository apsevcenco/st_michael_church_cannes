export function escapeHtml(value: unknown): string {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function paragraphsToHtml(text: unknown): string {
  return String(text || "")
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => `<p>${escapeHtml(part).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function safePublicUrl(value: unknown): string {
  if (!value) return "";

  try {
    const url = new URL(String(value), window.location.origin);
    if (!["https:", "http:"].includes(url.protocol)) return "";
    if (url.protocol === "http:" && url.hostname !== window.location.hostname) return "";
    return url.href;
  } catch {
    return "";
  }
}

export function formatPublicDate(value: unknown, language: string): string {
  if (!value) return "";

  try {
    return new Intl.DateTimeFormat(language === "en" ? "en-GB" : language === "fr" ? "fr-FR" : "ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(new Date(`${value}T00:00:00`));
  } catch {
    return String(value);
  }
}
