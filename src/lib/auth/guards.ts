/**
 * RBAC Guards - Sistema de Autorización Basado en Roles
 * 
 * Implementa los guards de seguridad para rutas protegidas según el rol organizacional.
 * Basado en: docs/standards/RBAC_ROLES_PERMISSIONS.md
 * 
 * Jerarquía de Roles (Organizacionales):
 * owner > admin > member
 * 
 * NOTA: El rol 'invited' existe en users.role (global), NO en organization_members.role
 * 
 * Schema: src/lib/db/schema.ts (activo en drizzle.config.ts)
 * Migration: 0004_orange_dracula.sql (índices RBAC)
 * 
 * Created: 2026-02-14
 */

// Tipo de rol organizacional (basado en userRoleEnum de schema.ts)
export type MemberRole = 'owner' | 'admin' | 'member';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Mapa de permisos por rol
 * '*' = acceso total
 * 
 * NOTA: El rol 'invited' NO existe en organization_members.
 * Los usuarios invitados tienen users.role='invited' (nivel global)
 * y NO tienen registro en organization_members hasta que aceptan la invitación.
 */
export const ROLE_PERMISSIONS: Record<MemberRole, string[]> = {
  owner: ['*'], // Acceso total incluyendo facturación
  admin: [
    'dashboard',
    'calls',
    'calls:write',
    'agents',
    'agents:write',
    'numbers',
    'numbers:write',
    'integrations',
    'users',
    'users:create:member',
    'settings',
  ],
  member: [
    'dashboard',
    'calls', // Solo lectura
    'agents', // Solo lectura
  ],
};

/**
 * Rutas exclusivas para owner (facturación)
 */
export const BILLING_ROUTES = [
  '/dashboard/facturacion',
  '/dashboard/billing',
  '/dashboard/suscripcion',
  '/dashboard/metodos-pago',
  '/dashboard/planes',
] as const;

/**
 * Rutas para admin + owner (gestión)
 */
export const ADMIN_ROUTES = [
  '/dashboard/usuarios',
  '/dashboard/configuracion',
  '/dashboard/integraciones',
] as const;

// ============================================================================
// TYPE GUARDS
// ============================================================================

export type Permission = string;
export type RoutePattern = string;

// ============================================================================
// PERMISSION CHECKS
// ============================================================================

/**
 * Verifica si un rol tiene un permiso específico
 * @param userRole - Rol del usuario en la organización
 * @param permission - Permiso a verificar (ej: 'calls:write')
 * @returns true si el rol tiene el permiso
 * 
 * @example
 * hasPermission('admin', 'calls:write') // true
 * hasPermission('member', 'calls:write') // false
 * hasPermission('member', 'calls') // true (read-only)
 */
export function hasPermission(
  userRole: MemberRole,
  permission: Permission
): boolean {
  const permissions = ROLE_PERMISSIONS[userRole];
  
  // Owner tiene acceso total
  if (permissions.includes('*')) {
    return true;
  }
  
  // Verificar permiso exacto
  return permissions.includes(permission);
}

/**
 * Verifica si un rol puede acceder a facturación
 * @param role - Rol del usuario
 * @returns true solo si es owner
 * 
 * @example
 * canAccessBilling('owner') // true
 * canAccessBilling('admin') // false
 */
export function canAccessBilling(role: MemberRole): boolean {
  return role === 'owner';
}

/**
 * Verifica si un rol puede crear usuarios admin
 * @param role - Rol del usuario
 * @returns true solo si es owner
 * 
 * @example
 * canCreateAdmin('owner') // true
 * canCreateAdmin('admin') // false
 */
export function canCreateAdmin(role: MemberRole): boolean {
  return role === 'owner';
}

/**
 * Verifica si un rol puede crear usuarios member
 * @param role - Rol del usuario
 * @returns true si es owner o admin
 * 
 * NOTA: Los usuarios 'invited' se crean vía invitación (pending_invitations table),
 * NO directamente en organization_members.
 * 
 * @example
 * canCreateMember('admin') // true
 * canCreateMember('member') // false
 */
export function canCreateMember(role: MemberRole): boolean {
  return role === 'owner' || role === 'admin';
}

/**
 * Verifica si un rol puede modificar datos
 * @param role - Rol del usuario
 * @returns true si es owner o admin
 */
export function canWrite(role: MemberRole): boolean {
  return role === 'owner' || role === 'admin';
}

/**
 * Verifica si un rol está en modo preview/demo
 * @param role - Rol del usuario
 * @returns false (invitados no están en organization_members)
 * 
 * NOTA: El modo preview se maneja en users.role='invited' (global),
 * NO en organization_members.role.
 */
export function isPreviewMode(role: MemberRole): boolean {
  return false; // Los invitados no tienen rol organizacional
}

// ============================================================================
// ROUTE GUARDS
// ============================================================================

/**
 * Verifica si un rol puede acceder a una ruta específica
 * @param role - Rol del usuario
 * @param route - Ruta a verificar
 * @returns true si puede acceder
 * 
 * @example
 * canAccessRoute('owner', '/dashboard/facturacion') // true
 * canAccessRoute('admin', '/dashboard/facturacion') // false
 */
export function canAccessRoute(role: MemberRole, route: string): boolean {
  // Owner tiene acceso total
  if (role === 'owner') {
    return true;
  }
  
  // Verificar rutas de facturación (solo owner)
  if (BILLING_ROUTES.some(billingRoute => route.startsWith(billingRoute))) {
    return false;
  }
  
  // Verificar rutas de admin (owner + admin)
  if (ADMIN_ROUTES.some(adminRoute => route.startsWith(adminRoute))) {
    return role === 'admin';
  }
  
  // Rutas públicas del dashboard (todos)
  if (route.startsWith('/dashboard')) {
    return true;
  }
  
  return false;
}

// ============================================================================
// UI HELPERS
// ============================================================================

/**
 * Determina si un botón/acción debe estar deshabilitado
 * @param role - Rol del usuario
 * @param action - Acción a verificar
 * @returns true si debe deshabilitarse
 * 
 * @example
 * isActionDisabled('member', 'create') // true (member solo lectura)
 * isActionDisabled('admin', 'delete') // false (admin puede todo)
 */
export function isActionDisabled(
  role: MemberRole,
  action: 'create' | 'edit' | 'delete' | 'write'
): boolean {
  // Member no puede crear/editar/eliminar (solo lectura)
  if (role === 'member') {
    return true;
  }
  
  // Admin y Owner pueden todo
  return false;
}

/**
 * Obtiene el mensaje de error según el rol
 * @param role - Rol del usuario
 * @param attemptedAction - Acción que intentó realizar
 * @returns Mensaje de error personalizado
 */
export function getPermissionErrorMessage(
  role: MemberRole,
  attemptedAction: string
): string {
  const messages: Record<MemberRole, string> = {
    owner: 'Tienes acceso completo.',
    admin: `Solo el propietario puede ${attemptedAction}.`,
    member: `No tienes permisos para ${attemptedAction}. Contacta a un administrador.`,
  };
  
  return messages[role];
}

/**
 * Obtiene el nivel de acceso en formato legible
 * @param role - Rol del usuario
 * @returns Label del rol en español
 */
export function getRoleLabel(role: MemberRole): string {
  const labels: Record<MemberRole, string> = {
    owner: 'Propietario',
    admin: 'Administrador',
    member: 'Miembro',
  };
  
  return labels[role];
}

/**
 * Obtiene el badge color según el rol (para UI)
 * @param role - Rol del usuario
 * @returns Clases de Tailwind para el badge
 */
export function getRoleBadgeColor(role: MemberRole): string {
  const colors: Record<MemberRole, string> = {
    owner: 'bg-purple-100 text-purple-700',
    admin: 'bg-blue-100 text-blue-700',
    member: 'bg-neutral-100 text-neutral-700',
  };
  
  return colors[role];
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Valida si un usuario puede realizar una transferencia de ownership
 * @param currentRole - Rol actual del usuario
 * @param targetUserId - ID del usuario objetivo
 * @param currentUserId - ID del usuario actual
 * @returns true si puede transferir
 */
export function canTransferOwnership(
  currentRole: MemberRole,
  targetUserId: string,
  currentUserId: string
): boolean {
  // Solo el owner puede transferir
  if (currentRole !== 'owner') {
    return false;
  }
  
  // No puede transferirse a sí mismo
  if (targetUserId === currentUserId) {
    return false;
  }
  
  return true;
}

/**
 * Obtiene los roles que un usuario puede asignar
 * @param role - Rol del usuario actual
 * @returns Array de roles disponibles para asignar
 * 
 * NOTA: Los 'invited' se crean vía pending_invitations, NO aquí.
 * 
 * @example
 * getAssignableRoles('owner') // ['admin', 'member']
 * getAssignableRoles('admin') // ['member']
 */
export function getAssignableRoles(role: MemberRole): MemberRole[] {
  switch (role) {
    case 'owner':
      return ['admin', 'member'];
    case 'admin':
      return ['member'];
    default:
      return [];
  }
}

// ============================================================================
// AUDIT HELPERS
// ============================================================================

/**
 * Determina si una acción debe ser auditada
 * @param action - Acción realizada
 * @returns true si requiere auditoría
 */
export function requiresAudit(action: string): boolean {
  const auditableActions = [
    'transfer_ownership',
    'change_role',
    'delete_user',
    'change_subscription',
    'change_billing',
  ];
  
  return auditableActions.includes(action);
}
