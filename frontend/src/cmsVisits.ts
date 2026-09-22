import type { LanguageCode } from "./types";

type SupabaseQuery = {
  insert: (payload: Record<string, unknown>) => Promise<{ error?: { message?: string } } | unknown>;
};

type SupabaseClient = {
  from: (table: string) => SupabaseQuery;
};

interface VisitorSession {
  id: string;
  isNew: boolean;
  firstSeenAt: string;
  landingPage: string;
}

const SESSION_KEY = "st_michael_visit_session";
const FIRST_SEEN_KEY = "st_michael_first_seen_at";
const LANDING_PAGE_KEY = "st_michael_landing_page";

function safeStorageGet(key: string): string {
  try {
    return window.localStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

function safeStorageSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore browsers that block localStorage.
  }
}

function visitorSession(): VisitorSession {
  let id = safeStorageGet(SESSION_KEY);
  let firstSeenAt = safeStorageGet(FIRST_SEEN_KEY);
  let landingPage = safeStorageGet(LANDING_PAGE_KEY);
  const isNew = !id || !firstSeenAt;

  if (!id) {
    id = window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    safeStorageSet(SESSION_KEY, id);
  }

  if (!firstSeenAt) {
    firstSeenAt = new Date().toISOString();
    safeStorageSet(FIRST_SEEN_KEY, firstSeenAt);
  }

  if (!landingPage) {
    landingPage = window.location.pathname;
    safeStorageSet(LANDING_PAGE_KEY, landingPage);
  }

  return { id, isNew, firstSeenAt, landingPage };
}

function detectDevice(): string {
  const userAgent = navigator.userAgent || "";
  if (/ipad|tablet|kindle|silk/i.test(userAgent)) return "tablet";
  if (/mobi|android|iphone|ipod/i.test(userAgent)) return "mobile";
  return "desktop";
}

function detectBrowser(): string {
  const userAgent = navigator.userAgent || "";
  if (/edg\//i.test(userAgent)) return "Edge";
  if (/opr\//i.test(userAgent)) return "Opera";
  if (/firefox\//i.test(userAgent)) return "Firefox";
  if (/safari\//i.test(userAgent) && !/chrome\//i.test(userAgent)) return "Safari";
  if (/chrome\//i.test(userAgent)) return "Chrome";
  return "Other";
}

function detectOs(): string {
  const userAgent = navigator.userAgent || "";
  if (/windows/i.test(userAgent)) return "Windows";
  if (/iphone|ipad|ipod/i.test(userAgent)) return "iOS";
  if (/android/i.test(userAgent)) return "Android";
  if (/mac os|macintosh/i.test(userAgent)) return "macOS";
  if (/linux/i.test(userAgent)) return "Linux";
  return "Other";
}

function detectCountry(timezone: string, language: string): { code: string; name: string } {
  const normalizedLanguage = language.toLowerCase();
  const timezoneMap: Record<string, { code: string; name: string }> = {
    "Europe/Paris": { code: "FR", name: "Франция" },
    "Europe/Monaco": { code: "MC", name: "Монако" },
    "Europe/Moscow": { code: "RU", name: "Россия" },
    "Europe/Berlin": { code: "DE", name: "Германия" },
    "Europe/Rome": { code: "IT", name: "Италия" },
    "Europe/Madrid": { code: "ES", name: "Испания" },
    "Europe/London": { code: "GB", name: "Великобритания" },
    "Europe/Brussels": { code: "BE", name: "Бельгия" },
    "Europe/Zurich": { code: "CH", name: "Швейцария" },
    "America/New_York": { code: "US", name: "США" },
    "America/Los_Angeles": { code: "US", name: "США" },
    "Asia/Jerusalem": { code: "IL", name: "Израиль" }
  };

  if (timezoneMap[timezone]) return timezoneMap[timezone];
  if (normalizedLanguage.endsWith("-fr")) return { code: "FR", name: "Франция" };
  if (normalizedLanguage.endsWith("-ru")) return { code: "RU", name: "Россия" };
  if (normalizedLanguage.endsWith("-en")) return { code: "GB", name: "Англоязычные пользователи" };
  return { code: "", name: "Не определено" };
}

async function insertVisit(client: SupabaseClient, payload: Record<string, unknown>, fallback: Record<string, unknown>): Promise<void> {
  const result = await client.from("page_visits").insert(payload) as { error?: { message?: string } } | undefined;
  if (result?.error) {
    await client.from("page_visits").insert(fallback);
  }
}

export async function trackVisit(client: SupabaseClient, pageKey: string, language: LanguageCode): Promise<void> {
  const file = window.location.pathname.split("/").pop() || "index.html";
  if (file === "admin.html") return;

  const session = visitorSession();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  const visitorLanguage = navigator.language || "";
  const country = detectCountry(timezone, visitorLanguage);
  const referrer = document.referrer ? document.referrer.slice(0, 500) : "";
  const userAgent = navigator.userAgent ? navigator.userAgent.slice(0, 500) : "";
  const pagePath = window.location.pathname;

  const fallbackPayload = {
    page_key: pageKey,
    page_path: pagePath,
    language,
    session_id: session.id,
    referrer,
    user_agent: userAgent
  };

  const extendedPayload = {
    ...fallbackPayload,
    visitor_id: session.id,
    is_new_session: session.isNew,
    first_seen_at: session.firstSeenAt,
    landing_page: session.landingPage,
    timezone,
    visitor_language: visitorLanguage.slice(0, 40),
    country_code: country.code,
    country_name: country.name,
    device_type: detectDevice(),
    browser_name: detectBrowser(),
    os_name: detectOs(),
    screen_width: window.screen?.width || null,
    screen_height: window.screen?.height || null
  };

  try {
    await insertVisit(client, extendedPayload, fallbackPayload);
  } catch {
    // Statistics must never block public page rendering.
  }
}
