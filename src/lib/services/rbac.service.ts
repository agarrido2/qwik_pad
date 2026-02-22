/**
 * RBAC Service - Business Logic Layer para autorización
 * 
 * Conecta los guards TypeScript (guards.ts) con la base de datos.
 * Proporciona métodos para verificar permisos en tiempo de ejecución.
 * 
 * Patrón: Service lee DB → Guards evalúan permisos → UI/Routes usan resultado
 * 
 * Created: 2026-02-14
 */

import { db } from '../db/client';
import { organizationMembers, users, organizations } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import {
  canAccessBilling,
  canCreateAdmin,
  canCreateMember,
  canWrite,
  isActionDisabled,
  canTransferOwnership as guardCanTransferOwnership,
  getAssignableRoles,
  isOwner,
  isAdminOrAbove,
  type MemberRole,
} from '../auth/guards';
import { canAccessRoute as configCanAccessRoute } from '../config/menu.config';

// ============================================================================
// ROLE FETCHING
// ============================================================================

/**
 * Obtiene el rol del usuario en una organización
 * @param userId - ID del usuario
 * @param organizationId - ID de la organización
 * @returns Rol del usuario o null si no es miembro
 * 
 * Optimización: Usa índice idx_org_members_user_id creado en migración 0004
 * 
 * @example
 * const role = await RBACService.getUserRole(userId, orgId);
 * if (role === 'owner') { ... }
 */
export async function getUserRole(
  userId: string,
  organizationId: string
): Promise<MemberRole | null> {
  const [member] = await db
    .select({ role: organizationMembers.role })
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.organizationId, organizationId)
      )
    )
    .limit(1);

  return (member?.role as MemberRole) ?? null;
}

/**
 * Obtiene todas las organizaciones del usuario con sus roles
 * @param userId - ID del usuario
 * @returns Array de organizaciones con roles
 * 
 * Optimización: Usa índice idx_org_members_user_id
 */
export async function getUserOrganizationsWithRoles(userId: string) {
  const result = await db
    .select({
      organizationId: organizationMembers.organizationId,
      organizationName: organizations.name,
      organizationSlug: organizations.slug,
      role: organizationMembers.role,
      subscriptionTier: organizations.subscriptionTier,
      sector: organizations.sector,
    })
    .from(organizationMembers)
    .innerJoin(
      organizations,
      eq(organizationMembers.organizationId, organizations.id)
    )
    .where(eq(organizationMembers.userId, userId));

  return result.map((row) => ({
    id: row.organizationId,
    name: row.organizationName,
    slug: row.organizationSlug,
    role: row.role as MemberRole,
    subscriptionTier: row.subscriptionTier,
    sector: row.sector,
  }));
}

/**
 * Obtiene todos los miembros de una organización con sus datos
 * @param organizationId - ID de la organización
 * @returns Array de miembros con user data
 * 
 * Optimización: Usa índice idx_org_members_org_id
 */
export async function getOrganizationMembers(organizationId: string) {
  const result = await db
    .select({
      memberId: organizationMembers.id,
      userId: users.id,
      userEmail: users.email,
      userFullName: users.fullName,
      userAvatarUrl: users.avatarUrl,
      role: organizationMembers.role,
      joinedAt: organizationMembers.joinedAt,
    })
    .from(organizationMembers)
    .innerJoin(users, eq(organizationMembers.userId, users.id))
    .where(eq(organizationMembers.organizationId, organizationId));

  return result.map((row) => ({
    id: row.memberId,
    user: {
      id: row.userId,
      email: row.userEmail,
      fullName: row.userFullName,
      avatarUrl: row.userAvatarUrl,
    },
    role: row.role as MemberRole,
    joinedAt: row.joinedAt,
  }));
}

// ============================================================================
// PERMISSION CHECKING (DB + Guards)
// ============================================================================

/**
 * Verifica si un usuario tiene un permiso específico en una organización
 * @param userId - ID del usuario
 * @param organizationId - ID de la organización
 * @param permission - Permiso a verificar
 * @returns true si tiene el permiso
 * 
 * @example
 * const canEdit = await RBACService.userHasPermission(userId, orgId, 'calls:write');
 * if (!canEdit) throw new Error('Sin permisos');
 */
export async function userHasPermission(
  userId: string,
  organizationId: string,
  permission: string
): Promise<boolean> {
  const role = await getUserRole(userId, organizationId);
  if (!role) return false;

  // Owner tiene todos los permisos
  if (isOwner(role)) return true;
  // Admin tiene todo excepto billing
  if (isAdminOrAbove(role)) return !permission.includes('billing');
  // Member: solo lectura
  return !permission.includes(':write') && !permission.includes(':create') && !permission.includes(':delete');
}

/**
 * Verifica si un usuario puede acceder a facturación en una org
 * @param userId - ID del usuario
 * @param organizationId - ID de la organización
 * @returns true si es owner
 * 
 * @example
 * const canBill = await RBACService.userCanAccessBilling(userId, orgId);
 */
export async function userCanAccessBilling(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const role = await getUserRole(userId, organizationId);
  if (!role) return false;

  return canAccessBilling(role);
}

/**
 * Verifica si un usuario puede acceder a una ruta específica
 * @param userId - ID del usuario
 * @param organizationId - ID de la organización
 * @param route - Ruta a verificar
 * @returns true si puede acceder
 * 
 * @example
 * const allowed = await RBACService.userCanAccessRoute(userId, orgId, '/dashboard/facturacion');
 */
export async function userCanAccessRoute(
  userId: string,
  organizationId: string,
  route: string
): Promise<boolean> {
  const role = await getUserRole(userId, organizationId);
  if (!role) return false;

  return configCanAccessRoute(role, route);
}

/**
 * Verifica si un usuario puede modificar datos en una org
 * @param userId - ID del usuario
 * @param organizationId - ID de la organización
 * @returns true si es owner o admin
 */
export async function userCanWrite(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const role = await getUserRole(userId, organizationId);
  if (!role) return false;

  return canWrite(role);
}

// ============================================================================
// ROLE MANAGEMENT
// ============================================================================

/**
 * Cambia el rol de un usuario en una organización
 * @param adminUserId - ID del usuario que realiza el cambio
 * @param targetUserId - ID del usuario objetivo
 * @param organizationId - ID de la organización
 * @param newRole - Nuevo rol a asignar
 * @returns true si el cambio fue exitoso
 * 
 * Validaciones:
 * - Admin puede cambiar a member
 * - Owner puede cambiar a cualquier rol
 * - No se puede auto-cambiar si eres el único owner
 * 
 * @example
 * await RBACService.changeUserRole(ownerId, memberId, orgId, 'admin');
 */
export async function changeUserRole(
  adminUserId: string,
  targetUserId: string,
  organizationId: string,
  newRole: MemberRole
): Promise<{ success: boolean; error?: string }> {
  // Obtener rol del admin
  const adminRole = await getUserRole(adminUserId, organizationId);
  if (!adminRole) {
    return { success: false, error: 'No eres miembro de esta organización' };
  }

  // Verificar permisos según el nuevo rol
  if (newRole === 'admin' && !canCreateAdmin(adminRole)) {
    return { success: false, error: 'Solo el owner puede crear admins' };
  }

  if (newRole === 'member' && !canCreateMember(adminRole)) {
    return { success: false, error: 'No tienes permisos para asignar roles' };
  }

  // Verificar que no sea el único owner si se está degradando a sí mismo
  if (adminUserId === targetUserId && adminRole === 'owner' && newRole !== 'owner') {
    const owners = await db
      .select({ count: organizationMembers.id })
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.role, 'owner')
        )
      );

    if (owners.length === 1) {
      return { success: false, error: 'No puedes degradarte siendo el único owner' };
    }
  }

  // Realizar el cambio
  await db
    .update(organizationMembers)
    .set({ role: newRole })
    .where(
      and(
        eq(organizationMembers.userId, targetUserId),
        eq(organizationMembers.organizationId, organizationId)
      )
    );

  return { success: true };
}

/**
 * Añade un miembro a una organización
 * @param adminUserId - ID del usuario que invita
 * @param newUserEmail - Email del nuevo usuario
 * @param organizationId - ID de la organización
 * @param role - Rol a asignar
 * @returns ID del nuevo miembro o error
 * 
 * @example
 * await RBACService.addMember(ownerId, 'user@example.com', orgId, 'member');
 */
export async function addMember(
  adminUserId: string,
  newUserEmail: string,
  organizationId: string,
  role: MemberRole = 'member'
): Promise<{ success: boolean; memberId?: string; error?: string }> {
  // Verificar permisos del admin
  const adminRole = await getUserRole(adminUserId, organizationId);
  if (!adminRole) {
    return { success: false, error: 'No eres miembro de esta organización' };
  }

  if (role === 'admin' && !canCreateAdmin(adminRole)) {
    return { success: false, error: 'Solo el owner puede crear admins' };
  }

  if (role === 'member' && !canCreateMember(adminRole)) {
    return { success: false, error: 'No tienes permisos para invitar usuarios' };
  }

  // Buscar usuario por email
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, newUserEmail))
    .limit(1);

  if (!user) {
    return { success: false, error: 'Usuario no encontrado' };
  }

  // Verificar si ya es miembro
  const [existing] = await db
    .select({ id: organizationMembers.id })
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.userId, user.id),
        eq(organizationMembers.organizationId, organizationId)
      )
    )
    .limit(1);

  if (existing) {
    return { success: false, error: 'El usuario ya es miembro de esta organización' };
  }

  // Crear membresía
  const [member] = await db
    .insert(organizationMembers)
    .values({
      userId: user.id,
      organizationId,
      role,
    })
    .returning({ id: organizationMembers.id });

  return { success: true, memberId: member.id };
}

/**
 * Elimina un miembro de una organización
 * @param adminUserId - ID del usuario que elimina
 * @param targetUserId - ID del usuario a eliminar
 * @param organizationId - ID de la organización
 * @returns true si la eliminación fue exitosa
 */
export async function removeMember(
  adminUserId: string,
  targetUserId: string,
  organizationId: string
): Promise<{ success: boolean; error?: string }> {
  // Verificar permisos del admin
  const adminRole = await getUserRole(adminUserId, organizationId);
  if (!adminRole || !canWrite(adminRole)) {
    return { success: false, error: 'No tienes permisos para eliminar usuarios' };
  }

  // No se puede auto-eliminar si eres el único owner
  if (adminUserId === targetUserId && adminRole === 'owner') {
    const owners = await db
      .select({ count: organizationMembers.id })
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.role, 'owner')
        )
      );

    if (owners.length === 1) {
      return { success: false, error: 'No puedes eliminarte siendo el único owner' };
    }
  }

  // Eliminar
  await db
    .delete(organizationMembers)
    .where(
      and(
        eq(organizationMembers.userId, targetUserId),
        eq(organizationMembers.organizationId, organizationId)
      )
    );

  return { success: true };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Obtiene los roles que un usuario puede asignar
 * @param userId - ID del usuario
 * @param organizationId - ID de la organización
 * @returns Array de roles asignables
 */
export async function getAssignableRolesForUser(
  userId: string,
  organizationId: string
): Promise<MemberRole[]> {
  const role = await getUserRole(userId, organizationId);
  if (!role) return [];

  return getAssignableRoles(role);
}

/**
 * Verifica si un usuario puede realizar una acción específica
 * @param userId - ID del usuario
 * @param organizationId - ID de la organización
 * @param action - Acción a verificar
 * @returns true si la acción está deshabilitada
 */
export async function isActionDisabledForUser(
  userId: string,
  organizationId: string,
  action: 'create' | 'edit' | 'delete' | 'write'
): Promise<boolean> {
  const role = await getUserRole(userId, organizationId);
  if (!role) return true; // Sin rol = todo deshabilitado

  return isActionDisabled(role, action);
}

/**
 * Exporta todas las funciones como un objeto Service
 */
export const RBACService = {
  // Role Fetching
  getUserRole,
  getUserOrganizationsWithRoles,
  getOrganizationMembers,
  
  // Permission Checking
  userHasPermission,
  userCanAccessBilling,
  userCanAccessRoute,
  userCanWrite,
  
  // Role Management
  changeUserRole,
  addMember,
  removeMember,
  
  // Utilities
  getAssignableRolesForUser,
  isActionDisabledForUser,
};
