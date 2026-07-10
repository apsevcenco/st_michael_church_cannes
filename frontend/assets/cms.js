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
    return file
      .replace(/\.html$/, "")
      .replace(/-(fr|en)$/, "");
  }

  function languageFromLocation() {
    const file = window.location.pathname.split("/").pop() || "index.html";
    if (file.endsWith("-fr.html") || file === "fr.html") return "fr";
    if (file.endsWith("-en.html") || file === "en.html") return "en";
    return document.documentElement.lang || "ru";
  }

  function paragraphsToHtml(text) {
    return String(text || "")
      .split(/\n{2,}/)
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => `<p>${part.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replace(/\n/g, "<br>")}</p>`)
      .join("");
  }

  function applyHero(record) {
    const hero = document.querySelector(".page-hero");
    if (!hero || !record) return;
    const h1 = hero.querySelector("h1");
    const text = hero.querySelector("p:last-child");
    if (h1 && record.title) h1.textContent = record.title;
    if (text && record.summary) text.textContent = record.summary;
  }

  function applyBody(record) {
    if (!record || !record.body) return;
    const target =
      document.querySelector("[data-cms-body]") ||
      document.querySelector(".history-article") ||
      document.querySelector(".section.two-columns > div:first-child") ||
      document.querySelector("main .section:not(.page-hero)");

    if (!target) return;
    const title = record.title ? `<h2>${record.title.replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</h2>` : "";
    target.innerHTML = `${title}${paragraphsToHtml(record.body)}`;
  }

  function applySchedulePdf(media) {
    const pdf = media.find((item) => item.purpose === "schedule_pdf" && item.file_url);
    if (!pdf) return;
    const poster = document.querySelector(".schedule-poster");
    if (!poster) return;
    const link = document.createElement("a");
    link.className = "button primary cms-media-button";
    link.href = pdf.file_url;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = pdf.title || "Открыть PDF расписания";
    poster.appendChild(link);
  }

  function applyGallery(media) {
    const images = media.filter((item) => item.file_url && item.mime_type && item.mime_type.startsWith("image/"));
    if (!images.length) return;
    let gallery = document.querySelector(".photo-gallery");
    if (!gallery) {
      const section = document.createElement("section");
      section.className = "section";
      gallery = document.createElement("div");
      gallery.className = "photo-gallery";
      section.appendChild(gallery);
      document.querySelector("main").appendChild(section);
    }

    gallery.innerHTML = images.map((item) => `
      <figure class="photo-card">
        <img src="${item.file_url}" alt="${item.description || item.title || ""}">
        <figcaption>${item.title || item.description || ""}</figcaption>
      </figure>
    `).join("");
  }

  async function loadCms() {
    if (!window.supabase || !window.ST_MICHAEL_SUPABASE_URL || !window.ST_MICHAEL_SUPABASE_ANON_KEY) return;

    const pageKey = pageKeyFromLocation();
    const language = languageFromLocation();
    const client = window.supabase.createClient(window.ST_MICHAEL_SUPABASE_URL, window.ST_MICHAEL_SUPABASE_ANON_KEY);

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

    const mediaFiles = media || [];
    applySchedulePdf(mediaFiles);
    applyGallery(mediaFiles);
  }

  document.addEventListener("DOMContentLoaded", loadCms);
})();
