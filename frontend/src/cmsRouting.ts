import type { LanguageCode } from "./types";

const pageMap: Record<string, string> = {
  "": "home",
  "index.html": "home",
  "fr.html": "home",
  "en.html": "home"
};

export function pageKeyFromLocation(location: Location = window.location): string {
  const file = location.pathname.split("/").pop() || "index.html";
  if (pageMap[file] !== undefined) return pageMap[file];
  return file.replace(/\.html$/, "").replace(/-(fr|en)$/, "");
}

export function languageFromLocation(location: Location = window.location): LanguageCode {
  const file = location.pathname.split("/").pop() || "index.html";
  if (file.endsWith("-fr.html") || file === "fr.html") return "fr";
  if (file.endsWith("-en.html") || file === "en.html") return "en";

  const pageLanguage = document.documentElement.lang;
  if (pageLanguage === "fr" || pageLanguage === "en") return pageLanguage;
  return "ru";
}
