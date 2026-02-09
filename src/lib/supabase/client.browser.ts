import { createBrowserClient } from '@supabase/ssr';

// Browser-side Supabase client (uses PUBLIC_ env vars)
export const supabaseBrowser = createBrowserClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
);
