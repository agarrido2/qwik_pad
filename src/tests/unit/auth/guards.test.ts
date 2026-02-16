/**
 * RBAC Guards + Menu Config Tests
 *
 * Tests unitarios para validar el sistema de roles, permisos y rutas.
 *
 * Run: bun test src/tests/unit/auth/guards.test.ts
 *
 * Arquitectura (2026-02-15):
 * - guards.ts → funciones puras de permisos de ACCIONES
 * - menu.config.ts → protección de RUTAS (source of truth)
 *
 * Created: 2026-02-14
 * Updated: 2026-02-15 - Config-driven RBAC, tests de menu.config
 */

import { describe, it, expect } from 'bun:test';
import {
  isOwner,
  isAdminOrAbove,
  canAccessBilling,
  canCreateAdmin,
  canCreateMember,
  canWrite,
  isActionDisabled,
  getRoleLabel,
  getRoleBadgeColor,
  getPermissionErrorMessage,
  canTransferOwnership,
  getAssignableRoles,
} from '~/lib/auth/guards';
import type { MemberRole } from '~/lib/auth/guards';
import { canAccessRoute, getVisibleMenu, MENU_CONFIG } from '~/lib/config/menu.config';

// ============================================================================
// CORE ROLE CHECKS (isOwner, isAdminOrAbove)
// ============================================================================

describe('isOwner', () => {
  it('returns true only for owner', () => {
    expect(isOwner('owner')).toBe(true);
    expect(isOwner('admin')).toBe(false);
    expect(isOwner('member')).toBe(false);
  });
});

describe('isAdminOrAbove', () => {
  it('returns true for owner and admin', () => {
    expect(isAdminOrAbove('owner')).toBe(true);
    expect(isAdminOrAbove('admin')).toBe(true);
    expect(isAdminOrAbove('member')).toBe(false);
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
// ROUTE ACCESS (from menu.config.ts)
// ============================================================================

describe('canAccessRoute (menu.config)', () => {
  it('owner can access all routes', () => {
    expect(canAccessRoute('owner', '/dashboard/agenda')).toBe(true);
    expect(canAccessRoute('owner', '/dashboard/cms/dashboard')).toBe(true);
    expect(canAccessRoute('owner', '/dashboard/facturacion')).toBe(true);
    expect(canAccessRoute('owner', '/dashboard/usuarios')).toBe(true);
  });

  it('admin cannot access billing routes', () => {
    expect(canAccessRoute('admin', '/dashboard/agenda')).toBe(true);
    expect(canAccessRoute('admin', '/dashboard/usuarios')).toBe(true);
    expect(canAccessRoute('admin', '/dashboard/facturacion')).toBe(false);
    expect(canAccessRoute('admin', '/dashboard/organizacion')).toBe(false);
  });

  it('member can access basic dashboard routes', () => {
    expect(canAccessRoute('member', '/dashboard/agenda')).toBe(true);
    expect(canAccessRoute('member', '/dashboard/cms/dashboard')).toBe(true);
    expect(canAccessRoute('member', '/dashboard/facturacion')).toBe(false);
    expect(canAccessRoute('member', '/dashboard/usuarios')).toBe(false);
    expect(canAccessRoute('member', '/dashboard/agente/kb')).toBe(false);
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
    expect(canAccessRoute(adminRole, '/dashboard/integraciones')).toBe(true);

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
    expect(canAccessRoute(memberRole, '/dashboard/agenda')).toBe(true);

    // Member NO puede acceder a gestión
    expect(canAccessRoute(memberRole, '/dashboard/usuarios')).toBe(false);
    expect(canAccessRoute(memberRole, '/dashboard/facturacion')).toBe(false);
  });
  it('sub-routes inherit parent restrictions', () => {
    expect(canAccessRoute('admin', '/dashboard/facturacion/planes')).toBe(false);
    expect(canAccessRoute('member', '/dashboard/usuarios/crear')).toBe(false);
    expect(canAccessRoute('owner', '/dashboard/facturacion/planes')).toBe(true);
  });

  it('routes not in config are accessible by all', () => {
    expect(canAccessRoute('member', '/dashboard/perfil')).toBe(true);
    expect(canAccessRoute('admin', '/dashboard/perfil')).toBe(true);
  });
});

// ============================================================================
// MENU CONFIG
// ============================================================================

describe('getVisibleMenu', () => {
  it('owner sees all menu items', () => {
    const main = getVisibleMenu('owner', 'main');
    const ws = getVisibleMenu('owner', 'workspace');
    expect(main.length).toBeGreaterThan(0);
    expect(ws.length).toBeGreaterThan(0);
    const configGroup = ws.find((i) => i.text === 'Configuración');
    expect(configGroup).toBeDefined();
    expect(configGroup!.children?.some((c) => c.href?.includes('facturacion'))).toBe(true);
  });

  it('admin does NOT see facturacion in workspace menu', () => {
    const ws = getVisibleMenu('admin', 'workspace');
    const configGroup = ws.find((i) => i.text === 'Configuración');
    expect(configGroup).toBeDefined();
    expect(configGroup!.children?.some((c) => c.href?.includes('facturacion'))).toBe(false);
    expect(configGroup!.children?.some((c) => c.href?.includes('usuarios'))).toBe(true);
    expect(configGroup!.children?.some((c) => c.href?.includes('organizacion'))).toBe(false);
  });

  it('member only sees main menu items', () => {
    const main = getVisibleMenu('member', 'main');
    const ws = getVisibleMenu('member', 'workspace');
    expect(main.length).toBeGreaterThan(0);
    expect(ws.length).toBe(0); // No workspace items for member
  });

  it('MENU_CONFIG items have valid roles', () => {
    const validRoles: MemberRole[] = ['owner', 'admin', 'member'];
    for (const item of MENU_CONFIG) {
      if (item.roles) {
        for (const role of item.roles) {
          expect(validRoles).toContain(role);
        }
      }
    }
  });
});

// ============================================================================
// MULTI-LEVEL MENU (children, separators, max depth)
// ============================================================================

describe('Multi-level Menu', () => {
  it('enforces max depth = 2 levels (no nested children)', () => {
    // Validar que ningún hijo tiene su propio children
    for (const item of MENU_CONFIG) {
      if (item.children) {
        for (const child of item.children) {
          expect(child.children).toBeUndefined();
        }
      }
    }
  });

  it('child routes are registered in PROTECTED_ROUTES', () => {
    // "Agente IA" tiene hijos con href reales, verificar acceso
    expect(canAccessRoute('owner', '/dashboard/agente/kb')).toBe(true);
    expect(canAccessRoute('admin', '/dashboard/agente/kb')).toBe(true);
    // member NO puede acceder porque el padre tiene roles: ['owner', 'admin']
    expect(canAccessRoute('member', '/dashboard/agente/kb')).toBe(false);

    // "Dashboard" como grupo también registra rutas de hijos
    expect(canAccessRoute('member', '/dashboard/agenda')).toBe(true);
    expect(canAccessRoute('member', '/dashboard/analitica')).toBe(true);
  });

  it('children without explicit roles inherit from parent', () => {
    // "Teléfonos", "Prompt / Flujo", "Base Conocimiento" no definen roles
    // Heredan del padre "Agente IA": ['owner', 'admin']
    expect(canAccessRoute('owner', '/dashboard/agente/telefonos')).toBe(true);
    expect(canAccessRoute('admin', '/dashboard/agente/telefonos')).toBe(true);
    expect(canAccessRoute('member', '/dashboard/agente/telefonos')).toBe(false);

    expect(canAccessRoute('owner', '/dashboard/agente/flujos')).toBe(true);
    expect(canAccessRoute('admin', '/dashboard/agente/flujos')).toBe(true);
    expect(canAccessRoute('member', '/dashboard/agente/flujos')).toBe(false);
  });

  it('parent is hidden when no children visible for role', () => {
    // El padre "Agente IA" tiene roles ['owner','admin']
    // Un member no debería ver el grupo en absoluto
    const memberMain = getVisibleMenu('member', 'main');
    const agente = memberMain.find((i) => i.text === 'Agente IA');
    expect(agente).toBeUndefined();
  });

  it('children are filtered independently by role', () => {
    // Owner ve todos los hijos del Agente IA
    const ownerMain = getVisibleMenu('owner', 'main');
    const agenteOwner = ownerMain.find((i) => i.text === 'Agente IA');
    expect(agenteOwner).toBeDefined();
    expect(agenteOwner!.children!.length).toBe(3);

    // Admin ve los mismos hijos porque todos heredan el padre
    const adminMain = getVisibleMenu('admin', 'main');
    const agenteAdmin = adminMain.find((i) => i.text === 'Agente IA');
    expect(agenteAdmin).toBeDefined();
    expect(agenteAdmin!.children!.length).toBe(3);
    expect(agenteAdmin!.children!.some((c) => c.text === 'Prompt / Flujo')).toBe(true);
  });

  it('children do not have section (inherited from parent)', () => {
    for (const item of MENU_CONFIG) {
      if (item.children) {
        for (const child of item.children) {
          // section en children es undefined o se ignora
          expect(child.section).toBeUndefined();
        }
      }
    }
  });
});
