/**
 * RBAC Guards Tests
 * 
 * Tests unitarios para validar el sistema de roles y permisos.
 * 
 * Run: bun test src/tests/unit/auth/guards.test.ts
 * 
 * NOTA: El rol 'invited' NO existe en organization_members.role.
 * Los invitados tienen users.role='invited' (global) y NO están en organization_members.
 * 
 * Created: 2026-02-14
 * Updated: 2026-02-14 - Eliminado soporte para 'invited' (no existe en DB)
 * Updated: 2026-02-14 - Movido a src/tests/unit/auth/ (estructura centralizada)
 */

import { describe, it, expect } from 'bun:test';
import {
  hasPermission,
  canAccessBilling,
  canCreateAdmin,
  canCreateMember,
  canWrite,
  isPreviewMode,
  canAccessRoute,
  isActionDisabled,
  getRoleLabel,
  getRoleBadgeColor,
  getPermissionErrorMessage,
  canTransferOwnership,
  getAssignableRoles,
} from '~/lib/auth/guards';
import type { MemberRole } from '~/lib/auth/guards';

// ============================================================================
// PERMISSION CHECKS
// ============================================================================

describe('hasPermission', () => {
  it('owner has all permissions (wildcard)', () => {
    expect(hasPermission('owner', 'billing')).toBe(true);
    expect(hasPermission('owner', 'users:create')).toBe(true);
    expect(hasPermission('owner', 'any:random:permission')).toBe(true);
  });

  it('admin has specific permissions', () => {
    expect(hasPermission('admin', 'calls:write')).toBe(true);
    expect(hasPermission('admin', 'users:create:member')).toBe(true);
    expect(hasPermission('admin', 'dashboard')).toBe(true);
  });

  it('admin does NOT have billing permissions', () => {
    expect(hasPermission('admin', 'billing')).toBe(false);
  });

  it('member has limited permissions', () => {
    expect(hasPermission('member', 'dashboard')).toBe(true);
    expect(hasPermission('member', 'calls')).toBe(true);
    expect(hasPermission('member', 'calls:write')).toBe(false);
  });
});

// ============================================================================
// BILLING ACCESS
// ============================================================================

describe('canAccessBilling', () => {
  it('only owner can access billing', () => {
    expect(canAccessBilling('owner')).toBe(true);
    expect(canAccessBilling('admin')).toBe(false);
    expect(canAccessBilling('member')).toBe(false);
  });
});

// ============================================================================
// USER CREATION PERMISSIONS
// ============================================================================

describe('canCreateAdmin', () => {
  it('only owner can create admin', () => {
    expect(canCreateAdmin('owner')).toBe(true);
    expect(canCreateAdmin('admin')).toBe(false);
    expect(canCreateAdmin('member')).toBe(false);
  });
});

describe('canCreateMember', () => {
  it('owner and admin can create members', () => {
    expect(canCreateMember('owner')).toBe(true);
    expect(canCreateMember('admin')).toBe(true);
  });

  it('member cannot create users', () => {
    expect(canCreateMember('member')).toBe(false);
  });
});

// ============================================================================
// WRITE PERMISSIONS
// ============================================================================

describe('canWrite', () => {
  it('owner and admin can write', () => {
    expect(canWrite('owner')).toBe(true);
    expect(canWrite('admin')).toBe(true);
  });

  it('member cannot write', () => {
    expect(canWrite('member')).toBe(false);
  });
});

// ============================================================================
// PREVIEW MODE
// ============================================================================

describe('isPreviewMode', () => {
  it('organizational roles are not preview mode', () => {
    expect(isPreviewMode('owner')).toBe(false);
    expect(isPreviewMode('admin')).toBe(false);
    expect(isPreviewMode('member')).toBe(false);
  });
});

// ============================================================================
// ROUTE ACCESS
// ============================================================================

describe('canAccessRoute', () => {
  it('owner can access all routes', () => {
    expect(canAccessRoute('owner', '/dashboard')).toBe(true);
    expect(canAccessRoute('owner', '/dashboard/facturacion')).toBe(true);
    expect(canAccessRoute('owner', '/dashboard/usuarios')).toBe(true);
  });

  it('admin cannot access billing routes', () => {
    expect(canAccessRoute('admin', '/dashboard')).toBe(true);
    expect(canAccessRoute('admin', '/dashboard/facturacion')).toBe(false);
    expect(canAccessRoute('admin', '/dashboard/billing')).toBe(false);
    expect(canAccessRoute('admin', '/dashboard/usuarios')).toBe(true);
  });

  it('member can access basic dashboard routes', () => {
    expect(canAccessRoute('member', '/dashboard')).toBe(true);
    expect(canAccessRoute('member', '/dashboard/facturacion')).toBe(false);
    expect(canAccessRoute('member', '/dashboard/usuarios')).toBe(false);
  });
});

// ============================================================================
// UI HELPERS
// ============================================================================

describe('isActionDisabled', () => {
  it('member cannot perform any actions', () => {
    expect(isActionDisabled('member', 'create')).toBe(true);
    expect(isActionDisabled('member', 'edit')).toBe(true);
    expect(isActionDisabled('member', 'delete')).toBe(true);
  });

  it('admin and owner can perform actions', () => {
    expect(isActionDisabled('admin', 'create')).toBe(false);
    expect(isActionDisabled('owner', 'delete')).toBe(false);
  });
});

describe('getRoleLabel', () => {
  it('returns Spanish labels for roles', () => {
    expect(getRoleLabel('owner')).toBe('Propietario');
    expect(getRoleLabel('admin')).toBe('Administrador');
    expect(getRoleLabel('member')).toBe('Miembro');
  });
});

describe('getRoleBadgeColor', () => {
  it('returns correct Tailwind classes for each role', () => {
    expect(getRoleBadgeColor('owner')).toContain('purple');
    expect(getRoleBadgeColor('admin')).toContain('blue');
    expect(getRoleBadgeColor('member')).toContain('neutral');
  });
});

describe('getPermissionErrorMessage', () => {
  it('returns contextual error messages', () => {
    const adminMessage = getPermissionErrorMessage('admin', 'acceder a facturación');
    expect(adminMessage).toContain('propietario');

    const memberMessage = getPermissionErrorMessage('member', 'crear usuarios');
    expect(memberMessage).toContain('administrador');
  });
});

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

describe('canTransferOwnership', () => {
  it('only owner can transfer ownership', () => {
    expect(canTransferOwnership('owner', 'user2', 'user1')).toBe(true);
    expect(canTransferOwnership('admin', 'user2', 'user1')).toBe(false);
  });

  it('cannot transfer to self', () => {
    expect(canTransferOwnership('owner', 'user1', 'user1')).toBe(false);
  });
});

describe('getAssignableRoles', () => {
  it('owner can assign admin and member', () => {
    const roles = getAssignableRoles('owner');
    expect(roles).toEqual(['admin', 'member']);
  });

  it('admin can assign member only', () => {
    const roles = getAssignableRoles('admin');
    expect(roles).toEqual(['member']);
  });

  it('member cannot assign roles', () => {
    expect(getAssignableRoles('member')).toEqual([]);
  });
});

// ============================================================================
// INTEGRATION SCENARIOS
// ============================================================================

describe('Integration: Typical User Workflows', () => {
  it('owner invites admin scenario', () => {
    const ownerRole: MemberRole = 'owner';

    // Owner puede ver facturación
    expect(canAccessBilling(ownerRole)).toBe(true);

    // Owner puede crear admin
    expect(canCreateAdmin(ownerRole)).toBe(true);
    const assignableRoles = getAssignableRoles(ownerRole);
    expect(assignableRoles).toContain('admin');

    // Owner puede acceder a todas las rutas
    expect(canAccessRoute(ownerRole, '/dashboard/facturacion')).toBe(true);
    expect(canAccessRoute(ownerRole, '/dashboard/usuarios')).toBe(true);
  });

  it('admin manages team scenario', () => {
    const adminRole: MemberRole = 'admin';

    // Admin NO puede ver facturación
    expect(canAccessBilling(adminRole)).toBe(false);
    expect(canAccessRoute(adminRole, '/dashboard/facturacion')).toBe(false);

    // Admin puede crear members
    expect(canCreateMember(adminRole)).toBe(true);
    const assignableRoles = getAssignableRoles(adminRole);
    expect(assignableRoles).toContain('member');

    // Admin NO puede crear otro admin
    expect(canCreateAdmin(adminRole)).toBe(false);
    expect(assignableRoles).not.toContain('admin');

    // Admin puede acceder a rutas de gestión
    expect(canAccessRoute(adminRole, '/dashboard/usuarios')).toBe(true);
    expect(canAccessRoute(adminRole, '/dashboard')).toBe(true);

    // Admin puede escribir
    expect(canWrite(adminRole)).toBe(true);
    expect(isActionDisabled(adminRole, 'create')).toBe(false);
  });

  it('member limited access scenario', () => {
    const memberRole: MemberRole = 'member';

    // Member NO puede crear usuarios
    expect(canCreateMember(memberRole)).toBe(false);

    // Member NO puede escribir
    expect(canWrite(memberRole)).toBe(false);
    expect(isActionDisabled(memberRole, 'edit')).toBe(true);

    // Member puede ver dashboard básico
    expect(canAccessRoute(memberRole, '/dashboard')).toBe(true);

    // Member NO puede acceder a gestión
    expect(canAccessRoute(memberRole, '/dashboard/usuarios')).toBe(false);
    expect(canAccessRoute(memberRole, '/dashboard/facturacion')).toBe(false);
  });
});
