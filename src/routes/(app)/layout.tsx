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
import { eq } from 'drizzle-orm';
import { getAuthGuardData } from '~/lib/auth/auth-guard';
import { resolveActiveOrg } from '~/lib/auth/active-org';
import { getRoleLabel, getRoleBadgeColor } from '~/lib/auth/guards';
import { AuthContext, type AuthContextValue } from '~/lib/context/auth.context';
import { db } from '~/lib/db/client';
import { users } from '~/lib/db/schema';

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

  // Edge case: estado inconsistente (onboarding completo sin organizaciones).
  // Reparar estado para forzar re-onboarding limpio y evitar throw en resolveActiveOrg.
  if (data.organizations.length === 0 && !pathname.startsWith('/onboarding')) {
    await db
      .update(users)
      .set({ onboardingCompleted: false })
      .where(eq(users.id, data.authUser.id));

    throw requestEvent.redirect(302, '/onboarding');
  }

  // Durante onboarding, el usuario no tiene organizaciones todavía.
  // Retornar datos mínimos para permitir que onboarding funcione.
  if (pathname.startsWith('/onboarding') && data.organizations.length === 0) {
    return {
      user: {
        id: data.authUser.id,
        email: data.authUser.email ?? '',
        fullName: data.dbUser.fullName ?? '',
        onboardingCompleted: data.dbUser.onboardingCompleted,
      },
      organizations: [],
      activeOrganizationId: null, // No hay org activa durante onboarding
    };
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
    
    // Durante onboarding sin organizaciones, usar valores por defecto
    const activeOrg = 
      appData.value.activeOrganizationId
        ? orgs.find((org) => org.id === appData.value.activeOrganizationId)
        : orgs[0];
    
    const finalOrg = activeOrg ?? {
      id: '',
      name: '',
      slug: '',
      subscriptionTier: 'free' as const,
      sector: null,
      role: 'owner' as const,
    };

    // Pre-computar labels de rol para cada org
    const enrichOrg = (org: typeof finalOrg) => ({
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
      organization: enrichOrg(finalOrg),
      allOrganizations: orgs.map(enrichOrg),
      isMultiOrg: orgs.length > 1,
      isPreviewMode: finalOrg.subscriptionTier === 'free',
    };
  });

  // ★ Re-sync store cuando el routeLoader re-ejecuta (navegación SPA tras org switch).
  // useStore initializer solo corre una vez; este task mantiene el store actualizado.
  useTask$(({ track }) => {
    const data = track(() => appData.value);
    const orgs = data.organizations;
    
    // Durante onboarding sin organizaciones, usar valores por defecto
    const newActiveOrg = 
      data.activeOrganizationId
        ? orgs.find((org) => org.id === data.activeOrganizationId)
        : orgs[0];
    
    const finalOrg = newActiveOrg ?? {
      id: '',
      name: '',
      slug: '',
      subscriptionTier: 'free' as const,
      sector: null,
      role: 'owner' as const,
    };

    const enrichOrg = (org: typeof finalOrg) => ({
      ...org,
      roleLabel: getRoleLabel(org.role),
      roleBadgeColor: getRoleBadgeColor(org.role),
    });

    authContext.user = {
      id: data.user.id,
      email: data.user.email,
      fullName: data.user.fullName || null,
    };
    authContext.organization = enrichOrg(finalOrg);
    authContext.allOrganizations = orgs.map(enrichOrg);
    authContext.isMultiOrg = orgs.length > 1;
    authContext.isPreviewMode = finalOrg.subscriptionTier === 'free';
  });

  // Inyectar AuthContext — consumido por sidebar, header, páginas
  useContextProvider(AuthContext, authContext);

  return <Slot />;
});
