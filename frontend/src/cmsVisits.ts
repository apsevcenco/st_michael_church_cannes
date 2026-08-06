import type { LanguageCode } from "./types";

type SupabaseQuery = {
  insert: (payload: Record<string, unknown>) => Promise<unknown>;
};

type SupabaseClient = {
  from: (table: string) => SupabaseQuery;
};

function visitorSessionId(): string {
  const key = "st_michael_visit_session";
  let value = "";

  try {
    value = window.localStorage.getItem(key) || "";
    if (!value) {
      value = window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
      window.localStorage.setItem(key, value);
    }
  } catch {
    value = "";
  }

  return value;
}

export async function trackVisit(client: SupabaseClient, pageKey: string, language: LanguageCode): Promise<void> {
  const file = window.location.pathname.split("/").pop() || "index.html";
  if (file === "admin.html") return;

  try {
    await client.from("page_visits").insert({
      page_key: pageKey,
      page_path: window.location.pathname,
      language,
      session_id: visitorSessionId(),
      referrer: document.referrer ? document.referrer.slice(0, 500) : "",
      user_agent: navigator.userAgent ? navigator.userAgent.slice(0, 500) : ""
    });
  } catch {
    // Statistics must never block public page rendering.
  }
}
