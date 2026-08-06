import { escapeHtml } from "./shared";
import type { AdminSectionConfig, PageVisit } from "./types";

type SupabaseClientLike = any;

interface AdminStatsOptions {
  $: (id: string) => HTMLElement | null;
  setText: (id: string, text: string) => void;
  getClient: () => SupabaseClientLike | null;
  getSection: () => AdminSectionConfig;
}

interface StatsRow {
  label: string;
  value: string;
}

function requiredElement<T extends HTMLElement>(lookup: (id: string) => HTMLElement | null, id: string): T {
  const element = lookup(id);
  if (!element) throw new Error(`Missing admin stats element: ${id}`);
  return element as T;
}

function formatStatsDate(value: string | null | undefined): string {
  if (!value) return "";

  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function createAdminStats(options: AdminStatsOptions) {
  const renderRows = (targetId: string, rows: StatsRow[], emptyText: string): void => {
    const target = options.$(targetId);
    if (!target) return;

    if (!rows.length) {
      target.innerHTML = `<div class="admin-empty">${escapeHtml(emptyText)}</div>`;
      return;
    }

    target.innerHTML = rows.map((row) => `
      <div class="stats-row">
        <span>${escapeHtml(row.label)}</span>
        <strong>${escapeHtml(row.value)}</strong>
      </div>
    `).join("");
  };

  const load = async (): Promise<void> => {
    const client = options.getClient();
    if (!client || !options.getSection().statsManager) return;

    const since = new Date();
    since.setDate(since.getDate() - 30);

    const { data, error } = await client
      .from("page_visits")
      .select("created_at, visit_date, page_key, page_path, language, session_id")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false })
      .limit(5000);

    if (error) {
      options.setText("editor-status", `Ошибка чтения статистики: ${error.message}`);
      renderRows("stats-top-pages", [], "Статистика пока недоступна.");
      renderRows("stats-recent", [], "Статистика пока недоступна.");
      return;
    }

    const visits = (data || []) as PageVisit[];
    const today = new Date().toISOString().slice(0, 10);
    const uniqueSessions = new Set(visits.map((visit) => visit.session_id).filter(Boolean));
    const pages = new Map<string, number>();

    visits.forEach((visit) => {
      const label = visit.page_path || visit.page_key || "unknown";
      pages.set(label, (pages.get(label) || 0) + 1);
    });

    options.setText("stats-today", String(visits.filter((visit) => visit.visit_date === today).length));
    options.setText("stats-total", String(visits.length));
    options.setText("stats-unique", String(uniqueSessions.size));
    options.setText("stats-pages", String(pages.size));

    const topPages = Array.from(pages.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([label, value]) => ({ label, value: `${value}` }));

    const recent = visits.slice(0, 12).map((visit) => ({
      label: `${visit.page_path || visit.page_key || "unknown"} · ${visit.language || "ru"}`,
      value: formatStatsDate(visit.created_at)
    }));

    renderRows("stats-top-pages", topPages, "Посещений пока нет.");
    renderRows("stats-recent", recent, "Посещений пока нет.");
    options.setText("editor-status", "Статистика обновлена.");
  };

  const bindEvents = (): void => {
    requiredElement<HTMLButtonElement>(options.$, "refresh-stats-button").addEventListener("click", load);
  };

  return {
    bindEvents,
    load
  };
}
