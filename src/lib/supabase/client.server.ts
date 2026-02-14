import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { RequestEventCommon } from '@builder.io/qwik-city';
import { ENV } from '../env.server';

/**
 * Creates a Supabase client for server-side operations (SSR)
 * Usa getAll/setAll (v0.5+) para manejo robusto de cookies multi-chunk
 * 
 * @param requestEvent - Acepta cualquier tipo de RequestEvent (loader, action, middleware)
 */
export function createServerSupabaseClient(requestEvent: RequestEventCommon) {
  return createServerClient(
    ENV.PUBLIC_SUPABASE_URL,
    ENV.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          // Qwik Cookie.getAll() devuelve Record<string, CookieValue | null>
          // Filtramos valores null para evitar errores al acceder a .value
          const allCookies = requestEvent.cookie.getAll();
          return Object.entries(allCookies)
            .filter(([_, cookie]) => cookie !== null)
            .map(([name, cookie]) => ({
              name,
              value: cookie!.value,
            }));
        },
        setAll(
          cookies: { name: string; value: string; options: CookieOptions }[],
        ) {
          cookies.forEach(({ name, value, options }) => {
            requestEvent.cookie.set(
              name,
              value,
              options as Record<string, unknown>,
            );
          });
        },
      },
    },
  );
}
