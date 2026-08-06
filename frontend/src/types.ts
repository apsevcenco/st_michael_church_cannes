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
  referrer: string | null;
  user_agent: string | null;
  visit_date?: string | null;
  created_at: string;
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
