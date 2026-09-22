export {};

declare global {
  interface Window {
    ST_MICHAEL_SUPABASE_URL?: string;
    ST_MICHAEL_SUPABASE_ANON_KEY?: string;
    ST_MICHAEL_BACKEND_URL?: string;
    supabase?: {
      createClient: (url: string, key: string) => any;
    };
    pdfjsLib?: any;
  }
}
