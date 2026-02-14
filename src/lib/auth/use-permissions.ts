/**
 * usePermissions - Hook derivado del OrganizationContext
 * 
 * Calcula permisos RBAC de forma síncrona usando useComputed$().
 * NO hace llamadas al servidor: todo se deriva del role que ya
 * llegó serializado en el OrganizationContext (vía useAppGuard).
 * 
 * Reemplaza a useUserRoleLoader para renderizado condicional de UI.
 * useUserRoleLoader sigue disponible para validación server-side (fail-fast redirect).
 * 
 * ¿Por qué useComputed$ y no useTask$?
 * → Los permisos son cálculo PURO y SÍNCRONO derivado del state (role).
 *   useComputed$ es la opción preferida según la doc oficial de Qwik:
 *   "useComputed$ is the preferred way when the computed value can be
 *    derived synchronously purely from the source state."
 * → useTask$ sería necesario solo si hubiera side-effects o async.
 * → useResource$ sería necesario solo si el cálculo fuera asíncrono
 *   o dependiera de estado externo (API calls, etc).
 * 
 * Patrón: docs/standards/CHEATSHEET_QWIK.md § useComputed$
 * 
 * @example
 * ```tsx
 * const permissions = usePermissions();
 * 
 * return (
 *   <div>
 *     <p>Tu rol: {permissions.value.roleLabel}</p>
 *     {permissions.value.canAccessBilling && (
 *       <Link href="/dashboard/facturacion">Facturación</Link>
 *     )}
 *   </div>
 * );
 * ```
 * 
 * Created: 2026-02-14
 */

import { useComputed$, useContext } from '@builder.io/qwik';
import { OrganizationContext } from '../context/organization.context';
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

/**
 * Tipo de retorno de usePermissions.
 * Compatible con la interfaz anterior de useUserRoleLoader
 * para facilitar la migración (drop-in replacement).
 */
export interface PermissionsData {
  role: MemberRole;
  roleLabel: string;
  roleBadgeColor: string;
  organizationId: string;
  organizationName: string;
  permissions: {
    canAccessBilling: boolean;
    canWrite: boolean;
    canCreateAdmin: boolean;
    canCreateMember: boolean;
    isActionDisabled: {
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
  };
  assignableRoles: MemberRole[];
}

/**
 * Hook que deriva permisos RBAC del OrganizationContext.
 * 
 * Usa useComputed$ para recalcular automáticamente cuando
 * cambia la organización activa (ej: selector multi-org futuro).
 * 
 * Ventaja sobre useUserRoleLoader:
 * - 0 round-trips al servidor (cálculo puro client-side)
 * - Se actualiza reactivamente si cambia orgContext.active
 * - Misma interfaz de datos → drop-in replacement en componentes
 * 
 * @returns Signal<PermissionsData> — acceder con .value
 */
export function usePermissions() {
  const orgContext = useContext(OrganizationContext);

  // useComputed$ se recalcula SOLO cuando sus dependencias rastreadas cambian.
  // En este caso: orgContext.active.role, orgContext.active.id, orgContext.active.name
  // → Si el usuario cambia de org activa, los permisos se re-derivan automáticamente.
  return useComputed$<PermissionsData>(() => {
    const role = orgContext.active.role as MemberRole;
    const orgId = orgContext.active.id;
    const orgName = orgContext.active.name;

    return {
      role,
      roleLabel: getRoleLabel(role),
      roleBadgeColor: getRoleBadgeColor(role),
      organizationId: orgId,
      organizationName: orgName,
      permissions: {
        canAccessBilling: canAccessBilling(role),
        canWrite: canWrite(role),
        canCreateAdmin: canCreateAdmin(role),
        canCreateMember: canCreateMember(role),
        isActionDisabled: {
          create: isActionDisabled(role, 'create'),
          edit: isActionDisabled(role, 'edit'),
          delete: isActionDisabled(role, 'delete'),
        },
      },
      assignableRoles: getAssignableRoles(role),
    };
  });
}
