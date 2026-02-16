/**
 * RBAC Middleware - Config-Driven Route Protection
 *
 * Middleware ÚNICO que protege TODAS las rutas del dashboard
 * leyendo la configuración de menu.config.ts como source of truth.
 *
 * Se coloca en: src/routes/(app)/dashboard/layout.tsx
 * Protege automáticamente /dashboard/* según los roles definidos en menu.config.
 *
 * Reemplaza: requireOwnerRole, requireAdminRole, checkRoutePermissions
 *
 * Created: 2026-02-14
 * Rewritten: 2026-02-15 - Config-driven approach
 */

import type { RequestHandler } from '@builder.io/qwik-city';
import { canAccessRoute } from '../config/menu.config';
import { getPermissionErrorMessage, type MemberRole } from './guards';
import { resolveActiveOrg } from './active-org';
import { RBACService } from '../services/rbac.service';
import { AuthService } from '../services/auth.service';

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Middleware: Protege rutas del dashboard usando menu.config.ts
 *
 * Flujo:
 * 1. Obtiene usuario autenticado (cached via AuthService sharedMap)
 * 2. Obtiene org activa + rol (cached via sharedMap)
 * 3. Verifica acceso contra menu.config (canAccessRoute)
 * 4. Redirect a /dashboard con mensaje si no tiene permiso
 *
 * OPTIMIZACIÓN:
 * - sharedMap evita re-querying en routeLoaders downstream
 * - canAccessRoute usa mapa pre-computado al cargar el módulo (0ms lookup)
 *
 * @example
 * // src/routes/(app)/dashboard/layout.tsx
 * export const onRequest: RequestHandler = checkRouteAccess;
 */
export const checkRouteAccess: RequestHandler = async (requestEvent) => {
  // 1. Auth check
  const authUser = await AuthService.getAuthUser(requestEvent);
  if (!authUser) {
    throw requestEvent.redirect(302, '/login');
  }

  // 2. Get organizations + role (cache via sharedMap)
  let orgs = requestEvent.sharedMap.get('userOrgs') as
    | Awaited<ReturnType<typeof RBACService.getUserOrganizationsWithRoles>>
    | undefined;
  if (!orgs) {
    orgs = await RBACService.getUserOrganizationsWithRoles(authUser.id);
    requestEvent.sharedMap.set('userOrgs', orgs);
  }
  if (orgs.length === 0) {
    throw requestEvent.redirect(302, '/onboarding');
  }

  const activeOrg = resolveActiveOrg(requestEvent, orgs);
  const role: MemberRole = activeOrg.role;

  // 3. Check route access against menu.config
  const currentPath = requestEvent.url.pathname;
  if (!canAccessRoute(role, currentPath)) {
    const errorMessage = getPermissionErrorMessage(
      role,
      'acceder a esta sección',
    );

    requestEvent.cookie.set('rbac_error', errorMessage, {
      path: '/',
      maxAge: 10, // 10 segundos — auto-expire
    });

    throw requestEvent.redirect(302, '/dashboard');
  }
};

