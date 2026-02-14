/**
 * RBAC RouteLoaders
 * 
 * Loaders para obtener información de roles y permisos en componentes.
 * Estos loaders se pueden usar en cualquier ruta de (app).
 * 
 * Uso:
 * ```tsx
 * // En una ruta
 * export const useUserRole = useUserRoleLoader;
 * 
 * // En el componente
 * const roleData = useUserRole();
 * if (roleData.value.canAccessBilling) { ... }
 * ```
 * 
 * Created: 2026-02-14
 */

import { routeLoader$ } from '@builder.io/qwik-city';
import { RBACService } from '../services/rbac.service';
import { AuthService } from '../services/auth.service';
import {
  canAccessBilling,
  canWrite,
  canCreateAdmin,
  canCreateMember,
  isActionDisabled,
  getRoleLabel,
  getRoleBadgeColor,
  getAssignableRoles,
  type MemberRole,
} from './guards';

// ============================================================================
// MAIN ROLE LOADER
// ============================================================================

/**
 * Loader principal: Obtiene el rol del usuario y permisos calculados
 * 
 * Retorna:
 * - role: Rol del usuario en la org activa
 * - organizationId: ID de la organización activa
 * - permissions: Objeto con permisos pre-calculados
 * 
 * Uso:
 * ```tsx
 * export const useUserRole = useUserRoleLoader;
 * 
 * export default component$(() => {
 *   const roleData = useUserRole();
 *   
 *   return (
 *     <div>
 *       <p>Tu rol: {roleData.value.roleLabel}</p>
 *       {roleData.value.permissions.canAccessBilling && (
 *         <Link href="/dashboard/facturacion">Facturación</Link>
 *       )}
 *     </div>
 *   );
 * });
 * ```
 */
export const useUserRoleLoader = routeLoader$(async (requestEvent) => {
  // 1. Obtener usuario autenticado (cached via sharedMap)
  const authUser = await AuthService.getAuthUser(requestEvent);
  if (!authUser) {
    throw requestEvent.redirect(302, '/login');
  }

  // 2. Obtener organización activa (cached via sharedMap)
  let orgs = requestEvent.sharedMap.get('userOrgs');
  if (!orgs) {
    orgs = await RBACService.getUserOrganizationsWithRoles(authUser.id);
    requestEvent.sharedMap.set('userOrgs', orgs);
  }
  if (orgs.length === 0) {
    throw requestEvent.redirect(302, '/onboarding/step-1');
  }

  // TODO: Leer org activa desde cookie 'active_organization_id'
  const activeOrg = orgs[0];

  // 3. Calcular permisos comunes (evitar re-cálculos en componentes)
  const permissions = {
    canAccessBilling: canAccessBilling(activeOrg.role),
    canWrite: canWrite(activeOrg.role),
    canCreateAdmin: canCreateAdmin(activeOrg.role),
    canCreateMember: canCreateMember(activeOrg.role),
    isActionDisabled: {
      create: isActionDisabled(activeOrg.role, 'create'),
      edit: isActionDisabled(activeOrg.role, 'edit'),
      delete: isActionDisabled(activeOrg.role, 'delete'),
    },
  };

  return {
    role: activeOrg.role,
    roleLabel: getRoleLabel(activeOrg.role),
    roleBadgeColor: getRoleBadgeColor(activeOrg.role),
    organizationId: activeOrg.id,
    organizationName: activeOrg.name,
    userId: authUser.id,
    permissions,
    assignableRoles: getAssignableRoles(activeOrg.role),
  };
});

// ============================================================================
// ORGANIZATION MEMBERS LOADER
// ============================================================================

/**
 * Loader: Obtiene los miembros de la organización activa
 * 
 * Uso común: Página de gestión de usuarios
 * 
 * @example
 * export const useOrgMembers = useOrganizationMembersLoader;
 * 
 * export default component$(() => {
 *   const members = useOrgMembers();
 *   
 *   return (
 *     <table>
 *       {members.value.map(m => (
 *         <tr key={m.id}>
 *           <td>{m.user.email}</td>
 *           <td>{m.roleLabel}</td>
 *         </tr>
 *       ))}
 *     </table>
 *   );
 * });
 */
export const useOrganizationMembersLoader = routeLoader$(async (requestEvent) => {
  // 1. Obtener usuario autenticado (cached via sharedMap)
  const authUser = await AuthService.getAuthUser(requestEvent);
  if (!authUser) {
    throw requestEvent.redirect(302, '/login');
  }

  // 2. Obtener org activa (cached via sharedMap)
  let orgs = requestEvent.sharedMap.get('userOrgs');
  if (!orgs) {
    orgs = await RBACService.getUserOrganizationsWithRoles(authUser.id);
    requestEvent.sharedMap.set('userOrgs', orgs);
  }
  if (orgs.length === 0) {
    throw requestEvent.redirect(302, '/onboarding/step-1');
  }

  const activeOrg = orgs[0];

  // 3. Verificar permisos (solo admin/owner pueden ver lista de miembros)
  if (!canWrite(activeOrg.role)) {
    throw requestEvent.redirect(302, '/dashboard');
  }

  // 4. Obtener miembros
  const members = await RBACService.getOrganizationMembers(activeOrg.id);

  // 5. Enriquecer con labels y colores
  return members.map((member) => ({
    ...member,
    roleLabel: getRoleLabel(member.role),
    roleBadgeColor: getRoleBadgeColor(member.role),
  }));
});

// ============================================================================
// QUICK PERMISSION LOADERS
// ============================================================================

/**
 * Loader rápido: Solo verifica si puede acceder a facturación
 * Útil para rutas de facturación que quieren fail-fast
 */
export const useBillingPermissionLoader = routeLoader$(async (requestEvent) => {
  const authUser = await AuthService.getAuthUser(requestEvent);
  if (!authUser) {
    throw requestEvent.redirect(302, '/login');
  }

  let orgs = requestEvent.sharedMap.get('userOrgs');
  if (!orgs) {
    orgs = await RBACService.getUserOrganizationsWithRoles(authUser.id);
    requestEvent.sharedMap.set('userOrgs', orgs);
  }
  if (orgs.length === 0) {
    throw requestEvent.redirect(302, '/onboarding/step-1');
  }

  const activeOrg = orgs[0];

  if (!canAccessBilling(activeOrg.role)) {
    throw requestEvent.redirect(302, '/dashboard');
  }

  return { allowed: true };
});

/**
 * Loader rápido: Solo verifica si puede escribir
 * Útil para páginas de configuración
 */
export const useWritePermissionLoader = routeLoader$(async (requestEvent) => {
  const authUser = await AuthService.getAuthUser(requestEvent);
  if (!authUser) {
    throw requestEvent.redirect(302, '/login');
  }

  let orgs = requestEvent.sharedMap.get('userOrgs');
  if (!orgs) {
    orgs = await RBACService.getUserOrganizationsWithRoles(authUser.id);
    requestEvent.sharedMap.set('userOrgs', orgs);
  }
  if (orgs.length === 0) {
    throw requestEvent.redirect(302, '/onboarding/step-1');
  }

  const activeOrg = orgs[0];

  if (!canWrite(activeOrg.role)) {
    throw requestEvent.redirect(302, '/dashboard');
  }

  return { allowed: true };
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type UserRoleData = Awaited<ReturnType<typeof useUserRoleLoader>>;
export type OrganizationMembersData = Awaited<ReturnType<typeof useOrganizationMembersLoader>>;
