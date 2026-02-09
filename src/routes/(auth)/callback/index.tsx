/**
 * OAuth Callback - Procesa la respuesta de Google OAuth
 * Establece sesión y redirige según estado de onboarding
 */

import { component$ } from '@builder.io/qwik';
import { type DocumentHead, routeLoader$ } from '@builder.io/qwik-city';
import { createServerSupabaseClient } from '~/lib/supabase/client.server';
import { getAuthGuardData } from '~/lib/auth/auth-guard';
import { Spinner } from '~/components/ui';

export const useOAuthCallback = routeLoader$(async (requestEvent) => {
  const url = new URL(requestEvent.url);
  const code = url.searchParams.get('code');

  if (!code) {
    throw requestEvent.redirect(302, '/login?error=no_code');
  }

  // Intercambiar código por sesión
  const supabase = createServerSupabaseClient(requestEvent);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    throw requestEvent.redirect(302, `/login?error=${encodeURIComponent(error.message)}`);
  }

  // Verificar estado de onboarding
  const data = await getAuthGuardData(requestEvent);
  if (data && !data.dbUser.hasCompletedOnboarding) {
    throw requestEvent.redirect(302, '/onboarding/step-1');
  }

  throw requestEvent.redirect(302, '/dashboard');
});

export default component$(() => {
  // El routeLoader siempre redirige, pero mostrar spinner por si acaso
  return (
    <div class="flex flex-col items-center justify-center gap-4 py-20">
      <Spinner size="lg" />
      <p class="text-sm text-neutral-600">Procesando autenticación...</p>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Autenticando... - Onucall',
};
