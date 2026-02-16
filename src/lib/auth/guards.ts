/**
 * RBAC Guards - Funciones Puras de Autorización
 *
 * Funciones puras (sin I/O) para evaluar permisos según el rol organizacional.
 * NO contiene rutas ni configuración de menú (eso vive en menu.config.ts).
 *
 * Jerarquía de Roles (Organizacionales):
 * owner > admin > member
 *
 * Para protección de RUTAS → ver src/lib/config/menu.config.ts
 * Para permisos de ACCIONES → usar estas funciones
 *
 * Created: 2026-02-14
 * Refactored: 2026-02-15 - Config-driven RBAC (rutas movidas a menu.config.ts)
 */

// ============================================================================
// TYPES
// ============================================================================

/** Rol organizacional (basado en userRoleEnum de schema.ts) */
export type MemberRole = 'owner' | 'admin' | 'member';

// ============================================================================
// CORE ROLE CHECKS (funciones base — usadas por el resto)
// ============================================================================

/** ¿El rol es owner? */
export const isOwner = (role: MemberRole): boolean => role === 'owner';

/** ¿El rol es admin o superior (owner)? */
export const isAdminOrAbove = (role: MemberRole): boolean =>
  role === 'owner' || role === 'admin';

// ============================================================================
// PERMISSION CHECKS (aliases semánticos)
// ============================================================================

/** Solo owner puede acceder a facturación */
export const canAccessBilling = isOwner;

/** Solo owner puede crear admins */
export const canCreateAdmin = isOwner;

/** Owner o admin pueden modificar datos */
export const canWrite = isAdminOrAbove;

/** Owner o admin pueden crear members */
export const canCreateMember = isAdminOrAbove;

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
