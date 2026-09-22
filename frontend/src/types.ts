export type LanguageCode = "ru" | "fr" | "en";

export type PublishStatus = "draft" | "published";

export type SectionKey =
  | "hero"
  | "body"
  | "details"
  | "contacts"
  | "donation";

export interface ContentSection {
  id: string;
  page_key: string;
  section_key: SectionKey | string;
  language: LanguageCode;
  title: string | null;
  summary: string | null;
  body: string | null;
  status: PublishStatus;
  sort_order: number;
}

export interface MediaFile {
  id: string;
  page_key: string;
  purpose: string;
  file_name: string | null;
  file_url: string | null;
  storage_path?: string | null;
  mime_type: string | null;
  file_size?: number | null;
  title: string | null;
  description: string | null;
  status: PublishStatus;
  sort_order: number;
}

export interface ParishNews {
  id: string;
  translation_group_id?: string | null;
  language: LanguageCode;
  event_date: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  status: PublishStatus;
  sort_order: number;
}

export interface ParishNewsPhoto {
  id: string;
  news_id: string;
  title?: string | null;
  file_url: string | null;
  storage_path?: string | null;
  file_name?: string | null;
  mime_type?: string | null;
  file_size?: number | null;
  description: string | null;
  sort_order: number;
}

export interface PageVisit {
  id: string;
  page_key: string;
  page_path: string;
  language: LanguageCode;
  session_id: string | null;
  visitor_id?: string | null;
  referrer: string | null;
  user_agent: string | null;
  visit_date?: string | null;
  created_at: string;
  is_new_session?: boolean | null;
  first_seen_at?: string | null;
  landing_page?: string | null;
  timezone?: string | null;
  visitor_language?: string | null;
  country_code?: string | null;
  country_name?: string | null;
  device_type?: string | null;
  browser_name?: string | null;
  os_name?: string | null;
  screen_width?: number | null;
  screen_height?: number | null;
}

export interface AdminSectionConfig {
  key: string;
  title: string;
  description: string;
  blocks: Array<[string, string]>;
  media: Array<[string, string]>;
  imagesOnly?: boolean;
  pdfOnly?: boolean;
  scheduleFileOnly?: boolean;
  newsManager?: boolean;
  statsManager?: boolean;
}
