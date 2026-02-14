/**
 * RBAC Middleware - Route Protection
 * 
 * Middleware de Qwik City para proteger rutas basado en roles organizacionales.
 * Se ejecuta en el servidor antes de renderizar la página.
 * 
 * Uso en routes:
 * ```tsx
 * // src/routes/(app)/dashboard/facturacion/layout.tsx
 * export const onRequest: RequestHandler = requireOwnerRole;
 * ```
 * 
 * Created: 2026-02-14
 * Updated: 2026-02-14 - Integración con RBACService
 */

import type { RequestHandler } from '@builder.io/qwik-city';
import { canAccessBilling, canAccessRoute, getPermissionErrorMessage, type MemberRole } from './guards';
import { RBACService } from '../services/rbac.service';
import { AuthService } from '../services/auth.service';

// ============================================================================
// TYPES
// ============================================================================

export interface RoleContext {
  organizationId: string;
  userId: string;
  role: MemberRole;
}

// ============================================================================
// CONTEXT HELPERS
// ============================================================================

/**
 * Obtiene el contexto de rol del usuario autenticado
 * Lee la sesión de Supabase y obtiene el rol en la organización activa
 * 
 * OPTIMIZACIÓN: Cache via sharedMap para compartir datos entre
 * middleware y routeLoaders sin re-querying.
 * Ref: docs/standards/DB_QUERY_OPTIMIZATION.md § sharedMap
 * 
 * @returns RoleContext con userId, organizationId y role
 */
async function getUserRoleContext(requestEvent: any): Promise<RoleContext | null> {
  // 1. Obtener usuario autenticado (cached via AuthService.sharedMap)
  const authUser = await AuthService.getAuthUser(requestEvent);
  if (!authUser) return null;

  // 2. Obtener organizaciones (cache en sharedMap para downstream loaders)
  let orgs = requestEvent.sharedMap.get('userOrgs');
  if (!orgs) {
    orgs = await RBACService.getUserOrganizationsWithRoles(authUser.id);
    requestEvent.sharedMap.set('userOrgs', orgs);
  }
  if (orgs.length === 0) return null;

  // TODO: Implementar selección de org activa desde cookie/header
  const activeOrg = orgs[0];

  return {
    userId: authUser.id,
    organizationId: activeOrg.id,
    role: activeOrg.role,
  };
}

// ============================================================================
// MIDDLEWARE GUARDS
// ============================================================================

/**
 * Guard: Requiere rol owner (facturación)
 * Redirige a /dashboard con error si no es owner
 */
export const requireOwnerRole: RequestHandler = async (requestEvent) => {
  const context = await getUserRoleContext(requestEvent);
  
  if (!context) {
    throw requestEvent.redirect(302, '/login');
  }
  
  if (!canAccessBilling(context.role)) {
    const errorMessage = getPermissionErrorMessage(context.role, 'acceder a facturación');
    
    // Guardar mensaje de error en cookie para mostrarlo en el dashboard
    requestEvent.cookie.set('rbac_error', errorMessage, {
      path: '/',
      maxAge: 10, // 10 segundos
    });
    
    throw requestEvent.redirect(302, '/dashboard');
  }
};

/**
 * Guard: Requiere rol admin o owner (gestión)
 * Redirige a /dashboard con error si es member
 */
export const requireAdminRole: RequestHandler = async (requestEvent) => {
  const context = await getUserRoleContext(requestEvent);
  
  if (!context) {
    throw requestEvent.redirect(302, '/login');
  }
  
  if (context.role === 'member') {
    const errorMessage = getPermissionErrorMessage(context.role, 'acceder a esta sección');
    
    requestEvent.cookie.set('rbac_error', errorMessage, {
      path: '/',
      maxAge: 10,
    });
    
    throw requestEvent.redirect(302, '/dashboard');
  }
};

/**
 * Guard: Requiere acceso a la ruta específica
 * Verifica permisos dinámicamente según la URL
 */
export const checkRoutePermissions: RequestHandler = async (requestEvent) => {
  const context = await getUserRoleContext(requestEvent);
  
  if (!context) {
    throw requestEvent.redirect(302, '/login');
  }
  
  const currentPath = requestEvent.url.pathname;
  
  if (!canAccessRoute(context.role, currentPath)) {
    const errorMessage = getPermissionErrorMessage(context.role, 'acceder a esta página');
    
    requestEvent.cookie.set('rbac_error', errorMessage, {
      path: '/',
      maxAge: 10,
    });
    
    throw requestEvent.redirect(302, '/dashboard');
  }
};

// ============================================================================
// AUDIT MIDDLEWARE
// ============================================================================

/**
 * Middleware: Log de acciones auditables
 * Se ejecuta en rutas que requieren auditoría
 */
export const auditAction: RequestHandler = async ({ url, cookie }) => {
  // TODO: Implementar sistema de auditoría
  // 1. Identificar acción desde la ruta
  // 2. Obtener userId y organizationId
  // 3. Guardar en tabla audit_logs
  
  console.log('[AUDIT]', {
    path: url.pathname,
    timestamp: new Date().toISOString(),
    // userId, organizationId, role
  });
};
