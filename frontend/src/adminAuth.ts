type SupabaseClientLike = any;

interface AdminUser {
  id: string;
  email?: string;
}

interface AdminAuthOptions {
  $: (id: string) => HTMLElement | null;
  setText: (id: string, text: string) => void;
  getClient: () => SupabaseClientLike | null;
  setClient: (client: SupabaseClientLike) => void;
  onWorkspaceReady: (email?: string) => void;
}

function requiredElement<T extends HTMLElement>(lookup: (id: string) => HTMLElement | null, id: string): T {
  const element = lookup(id);
  if (!element) throw new Error(`Missing admin element: ${id}`);
  return element as T;
}

export function createAdminAuth(options: AdminAuthOptions) {
  const showLogin = (): void => {
    document.body.classList.add("is-login");
    document.body.classList.remove("is-authenticated");
    requiredElement(options.$, "login-screen").hidden = false;
    requiredElement(options.$, "admin-workspace").hidden = true;
  };

  const isCurrentUserAdmin = async (user: AdminUser | null | undefined): Promise<boolean> => {
    const client = options.getClient();
    if (!client || !user) return false;

    const { data, error } = await client
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    return !error && Boolean(data);
  };

  const requireAdminSession = async (user: AdminUser | null | undefined): Promise<boolean> => {
    const client = options.getClient();
    if (await isCurrentUserAdmin(user)) return true;
    await client?.auth.signOut();
    options.setText("auth-status", "Доступ запрещен: пользователь не добавлен в список администраторов.");
    showLogin();
    return false;
  };

  const connect = (): boolean => {
    if (!window.supabase || !window.ST_MICHAEL_SUPABASE_URL || !window.ST_MICHAEL_SUPABASE_ANON_KEY) {
      options.setText("auth-status", "Не удалось подключить сайт к Supabase. Проверьте настройки проекта.");
      return false;
    }

    options.setClient(window.supabase.createClient(window.ST_MICHAEL_SUPABASE_URL, window.ST_MICHAEL_SUPABASE_ANON_KEY));
    return true;
  };

  const checkSession = async (): Promise<void> => {
    const client = options.getClient();
    if (!client) return;

    const { data } = await client.auth.getSession();
    const user = data.session?.user as AdminUser | undefined;
    if (user && await requireAdminSession(user)) {
      options.onWorkspaceReady(user.email);
    } else {
      showLogin();
    }
  };

  const bindEvents = (): void => {
    requiredElement<HTMLFormElement>(options.$, "login-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const client = options.getClient();
      if (!client) return;

      const email = requiredElement<HTMLInputElement>(options.$, "admin-email").value.trim();
      const password = requiredElement<HTMLInputElement>(options.$, "admin-password").value;
      const { data, error } = await client.auth.signInWithPassword({ email, password });

      if (error) {
        options.setText("auth-status", `Ошибка входа: ${error.message}`);
        return;
      }

      if (await requireAdminSession(data.user)) options.onWorkspaceReady(data.user?.email);
    });

    requiredElement<HTMLButtonElement>(options.$, "logout-button").addEventListener("click", async () => {
      await options.getClient()?.auth.signOut();
      showLogin();
    });
  };

  return {
    bindEvents,
    checkSession,
    connect,
    showLogin
  };
}
