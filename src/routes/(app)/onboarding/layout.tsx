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

  if (data.dbUser.onboardingCompleted) {
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
    <div class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50/30">
      {/* Hero Section */}
      <div class="border-b border-primary-100 bg-white/80 backdrop-blur-sm">
        <div class="content-container py-8">
          <div class="mx-auto max-w-3xl text-center">
            <a href="/" class="mb-4 inline-block text-2xl font-bold text-primary-600">
              Onucall
            </a>
            <h1 class="mb-3 text-3xl font-bold text-neutral-900">
              Configura tu Asistente de Voz IA
            </h1>
            <p class="text-lg text-neutral-600">
              En solo 3 pasos, personalizaremos tu agente IA para que hable como tu marca 
              y entienda las necesidades de tus clientes. ¡Es rápido y esencial para obtener 
              los mejores resultados!
            </p>
            <div class="mt-4 flex items-center justify-center gap-2 text-sm text-neutral-500">
              <svg class="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Tus datos están seguros y solo los usamos para personalizar tu experiencia
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div class="content-container py-12">
        <div class="mx-auto max-w-2xl">
          <Slot />
        </div>
      </div>
    </div>
  );
});
