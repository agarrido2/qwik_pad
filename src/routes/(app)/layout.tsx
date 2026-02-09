/**
 * App Layout - Auth guard + Organization context provider
 * Protege todas las rutas (app) excepto onboarding (que tiene su propio guard)
 */

import { component$, Slot, useContextProvider, useStore } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { getAuthGuardData } from '~/lib/auth/auth-guard';
import {
  OrganizationContext,
  type OrganizationContextValue,
} from '~/lib/context/organization.context';

/**
 * Auth guard global para rutas (app).
 * - Sin sesión → login
 * - Sin onboarding → onboarding (excepto si ya estamos en /onboarding)
 * - Con todo → cargar orgs y user data
 */
export const useAppGuard = routeLoader$(async (requestEvent) => {
  const data = await getAuthGuardData(requestEvent);

  if (!data) {
    throw requestEvent.redirect(302, '/login');
  }

  // Si no completó onboarding y NO está en /onboarding, redirigir
  const pathname = requestEvent.pathname;
  if (!data.dbUser.hasCompletedOnboarding && !pathname.startsWith('/onboarding')) {
    throw requestEvent.redirect(302, '/onboarding/step-1');
  }

  return {
    user: {
      id: data.authUser.id,
      email: data.authUser.email ?? '',
      fullName: data.dbUser.fullName ?? '',
      hasCompletedOnboarding: data.dbUser.hasCompletedOnboarding,
    },
    organizations: data.organizations,
  };
});

export default component$(() => {
  const appData = useAppGuard();

  // Crear store reactivo para el contexto de organización
  const orgContext = useStore<OrganizationContextValue>(() => {
    const orgs = appData.value.organizations;
    const active = orgs[0] ?? {
      id: '',
      name: '',
      slug: '',
      subscriptionTier: 'free',
      industry: null,
      role: 'owner',
    };

    return {
      active,
      all: orgs,
      isMultiOrg: orgs.length > 1,
      isPreviewMode: active.subscriptionTier === 'free',
    };
  });

  // Inyectar contexto para que cualquier componente hijo lo consuma
  useContextProvider(OrganizationContext, orgContext);

  return <Slot />;
});
