/**
 * App Layout - Auth guard + AuthContext provider
 * Protege todas las rutas (app) excepto onboarding (que tiene su propio guard)
 *
 * Provee AuthContext (user + org + role) para toda la app.
 * El middleware RBAC en dashboard/layout.tsx protege rutas vía menu.config.
 *
 * Refactored: 2026-02-15 - AuthContext reemplaza OrganizationContext
 */

import { component$, Slot, useContextProvider, useStore, useTask$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { getAuthGuardData } from '~/lib/auth/auth-guard';
import { resolveActiveOrg } from '~/lib/auth/active-org';
import { getRoleLabel, getRoleBadgeColor } from '~/lib/auth/guards';
import { AuthContext, type AuthContextValue } from '~/lib/context/auth.context';

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
  if (!data.dbUser.onboardingCompleted && !pathname.startsWith('/onboarding')) {
    throw requestEvent.redirect(302, '/onboarding');
  }

  const activeOrg = resolveActiveOrg(requestEvent, data.organizations);

  return {
    user: {
      id: data.authUser.id,
      email: data.authUser.email ?? '',
      fullName: data.dbUser.fullName ?? '',
      onboardingCompleted: data.dbUser.onboardingCompleted,
    },
    organizations: data.organizations,
    activeOrganizationId: activeOrg.id,
  };
});

export default component$(() => {
  const appData = useAppGuard();

  // Crear store reactivo para AuthContext
  const authContext = useStore<AuthContextValue>(() => {
    const orgs = appData.value.organizations;
    const activeOrg = orgs.find((org) => org.id === appData.value.activeOrganizationId) ?? orgs[0] ?? {
      id: '',
      name: '',
      slug: '',
      subscriptionTier: 'free',
      industry: null,
      role: 'owner' as const,
    };

    // Pre-computar labels de rol para cada org
    const enrichOrg = (org: (typeof orgs)[0]) => ({
      ...org,
      roleLabel: getRoleLabel(org.role),
      roleBadgeColor: getRoleBadgeColor(org.role),
    });

    return {
      user: {
        id: appData.value.user.id,
        email: appData.value.user.email,
        fullName: appData.value.user.fullName || null,
      },
      organization: enrichOrg(activeOrg),
      allOrganizations: orgs.map(enrichOrg),
      isMultiOrg: orgs.length > 1,
      isPreviewMode: activeOrg.subscriptionTier === 'free',
    };
  });

  // ★ Re-sync store cuando el routeLoader re-ejecuta (navegación SPA tras org switch).
  // useStore initializer solo corre una vez; este task mantiene el store actualizado.
  useTask$(({ track }) => {
    const data = track(() => appData.value);
    const orgs = data.organizations;
    const newActiveOrg = orgs.find((org) => org.id === data.activeOrganizationId) ?? orgs[0] ?? {
      id: '',
      name: '',
      slug: '',
      subscriptionTier: 'free',
      industry: null,
      role: 'owner' as const,
    };

    const enrichOrg = (org: (typeof orgs)[0]) => ({
      ...org,
      roleLabel: getRoleLabel(org.role),
      roleBadgeColor: getRoleBadgeColor(org.role),
    });

    authContext.user = {
      id: data.user.id,
      email: data.user.email,
      fullName: data.user.fullName || null,
    };
    authContext.organization = enrichOrg(newActiveOrg);
    authContext.allOrganizations = orgs.map(enrichOrg);
    authContext.isMultiOrg = orgs.length > 1;
    authContext.isPreviewMode = newActiveOrg.subscriptionTier === 'free';
  });

  // Inyectar AuthContext — consumido por sidebar, header, páginas
  useContextProvider(AuthContext, authContext);

  return <Slot />;
});
