import "./site-config";
import { applyBody, applyExtraBlocks, applyHero, applyNamedBlocks } from "./cmsContent";
import { fallbackSections, mergeFallbackSections } from "./cmsFallbacks";
import { applyDocuments, applyGallery, applySchedulePdf, setupLightbox } from "./cmsMedia";
import { loadNews } from "./cmsNews";
import { languageFromLocation, pageKeyFromLocation } from "./cmsRouting";
import { trackVisit } from "./cmsVisits";
import type { ContentSection, MediaFile } from "./types";

(function () {
  async function loadCms(): Promise<void> {
    if (!window.supabase || !window.ST_MICHAEL_SUPABASE_URL || !window.ST_MICHAEL_SUPABASE_ANON_KEY) return;

    const pageKey = pageKeyFromLocation();
    const language = languageFromLocation();
    const client = window.supabase.createClient(window.ST_MICHAEL_SUPABASE_URL, window.ST_MICHAEL_SUPABASE_ANON_KEY);
    const fallbackContent = fallbackSections(pageKey, language);
    trackVisit(client, pageKey, language);

    let sections: ContentSection[] = [];
    let media: MediaFile[] = [];

    try {
      const [{ data: cmsSections }, { data: cmsMedia }] = await Promise.all([
        client
          .from("content_sections")
          .select("*")
          .eq("page_key", pageKey)
          .eq("language", language)
          .eq("status", "published")
          .order("sort_order", { ascending: true }),
        client.from("media_files").select("*").eq("page_key", pageKey).eq("status", "published").order("sort_order", { ascending: true })
      ]);

      sections = (cmsSections || []) as ContentSection[];
      media = (cmsMedia || []) as MediaFile[];
    } catch {
      sections = [];
      media = [];
    }

    const content = mergeFallbackSections(fallbackContent, sections);
    applyHero(content.find((item) => item.section_key === "hero"));
    applyBody(content.find((item) => item.section_key === "body"));
    applyNamedBlocks(content);
    applyExtraBlocks(content);

    const mediaFiles = media;
    await applySchedulePdf(mediaFiles);
    applyDocuments(mediaFiles);
    applyGallery(mediaFiles);
    await loadNews(client, language);
    setupLightbox();
  }

  document.addEventListener("DOMContentLoaded", loadCms);
})();
