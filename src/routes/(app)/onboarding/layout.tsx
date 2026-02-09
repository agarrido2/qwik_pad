/**
 * Onboarding Layout - Auth guard + progress bar
 * Solo accesible para usuarios autenticados que NO han completado onboarding
 */

import { component$, Slot } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { getAuthGuardData } from '~/lib/auth/auth-guard';

// Auth guard: redirige si no autenticado o ya completó onboarding
export const useOnboardingGuard = routeLoader$(async (requestEvent) => {
  const data = await getAuthGuardData(requestEvent);

  if (!data) {
    throw requestEvent.redirect(302, '/login');
  }

  if (data.dbUser.hasCompletedOnboarding) {
    throw requestEvent.redirect(302, '/dashboard');
  }

  return {
    userId: data.authUser.id,
    email: data.authUser.email ?? '',
    fullName: data.dbUser.fullName ?? '',
  };
});

export default component$(() => {
  return (
    <div class="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50/30 px-4">
      <div class="w-full max-w-2xl">
        {/* Logo */}
        <div class="mb-8 flex justify-center">
          <a href="/" class="text-2xl font-bold text-primary-600">
            Onucall
          </a>
        </div>
        <Slot />
      </div>
    </div>
  );
});
