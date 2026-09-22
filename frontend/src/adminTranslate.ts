import type { LanguageCode } from "./types";

type SupabaseClientLike = any;
export type TranslationFields = Record<string, string>;
export type TranslationResult = Partial<Record<LanguageCode, TranslationFields>>;

export function translationTargets(sourceLanguage: LanguageCode): LanguageCode[] {
  return (["fr", "en"] as LanguageCode[]).filter((language) => language !== sourceLanguage);
}

async function readErrorPayload(response: Response): Promise<string> {
  const text = await response.text().catch(() => "");
  if (!text) return `HTTP ${response.status}`;

  try {
    const json = JSON.parse(text);
    return json.error || json.message || text.slice(0, 240);
  } catch {
    return text.slice(0, 240);
  }
}

export async function translateBlock(
  client: SupabaseClientLike,
  sourceLanguage: LanguageCode,
  context: string,
  fields: TranslationFields,
): Promise<TranslationResult> {
  if (!client) throw new Error("Supabase недоступен.");
  const targets = translationTargets(sourceLanguage);
  if (!targets.length) throw new Error("Нет языков для перевода.");
  if (!Object.values(fields).some((value) => String(value || "").trim())) {
    throw new Error("В блоке нет текста для перевода.");
  }

  const sessionResult = await client.auth.getSession();
  const accessToken = sessionResult?.data?.session?.access_token;
  if (!accessToken) throw new Error("Сессия администратора не найдена. Войдите заново.");

  const backendUrl = window.ST_MICHAEL_BACKEND_URL || "https://st-michael-church-cannes-backend.onrender.com";
  const response = await fetch(`${backendUrl.replace(/\/$/, "")}/api/translate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      sourceLanguage,
      targets,
      context,
      fields,
    }),
  }).catch((error) => {
    throw new Error(`Backend недоступен: ${error instanceof Error ? error.message : "network error"}`);
  });

  if (!response.ok) {
    throw new Error(await readErrorPayload(response));
  }

  const payload = await response.json().catch(() => ({}));
  if (!payload.ok) {
    throw new Error(payload.error || "Ошибка автоматического перевода.");
  }

  return payload.translations || {};
}
