/**
 * RBAC RouteLoaders
 * 
 * Loaders para obtener información RBAC específica en componentes.
 * 
 * NOTA: Para permisos y roles de usuario, usar `usePermissions()` (useComputed$)
 * en lugar de loaders. Ver: src/lib/auth/use-permissions.ts
 * 
 * Este archivo solo contiene loaders que REALMENTE requieren server-side data fetching.
 * 
 * Created: 2026-02-14
 * Refactored: 2026-02-14 (Eliminados loaders redundantes)
 */

import { routeLoader$ } from '@builder.io/qwik-city';
import { RBACService } from '../services/rbac.service';
import { AuthService } from '../services/auth.service';
import {
  canWrite,
  getRoleLabel,
  getRoleBadgeColor,
} from './guards';

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
// TYPE EXPORTS
// ============================================================================

export type OrganizationMembersData = Awaited<ReturnType<typeof useOrganizationMembersLoader>>;
