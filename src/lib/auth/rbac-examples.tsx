/**
 * RBAC UI Examples - Componentes con Control de Acceso
 * 
 * Ejemplos de cómo implementar control de acceso basado en roles en componentes UI.
 * Este archivo es de REFERENCIA para mostrar los patrones a seguir.
 * 
 * NO USAR en producción directamente, copiar los patrones a tus componentes.
 * 
 * Created: 2026-02-14
 */

import { component$ } from '@builder.io/qwik';
import {
  canAccessBilling,
  canCreateAdmin,
  canCreateMember,
  isActionDisabled,
  getRoleLabel,
  getRoleBadgeColor,
  getPermissionErrorMessage,
  isPreviewMode,
} from '~/lib/auth/guards';
import type { MemberRole } from './guards';

// ============================================================================
// EJEMPLO 1: Sidebar con rutas condicionales
// ============================================================================

interface SidebarExampleProps {
  userRole: MemberRole;
}

export const SidebarWithRBAC = component$<SidebarExampleProps>(({ userRole }) => {
  return (
    <nav>
      {/* Ruta accesible para todos */}
      <a href="/dashboard">Dashboard</a>

      {/* Ruta solo para admin y owner */}
      {(userRole === 'owner' || userRole === 'admin') && (
        <a href="/dashboard/usuarios">Gestión de Usuarios</a>
      )}

      {/* Ruta solo para owner */}
      {canAccessBilling(userRole) && (
        <a href="/dashboard/facturacion">Facturación</a>
      )}

      {/* Modo preview para invited */}
      {isPreviewMode(userRole) && (
        <div class="bg-amber-100 p-2 text-xs text-amber-800">
          Estás en modo preview. Completa el onboarding para acceso completo.
        </div>
      )}
    </nav>
  );
});

// ============================================================================
// EJEMPLO 2: Botón de acción condicional
// ============================================================================

interface ActionButtonExampleProps {
  userRole: MemberRole;
  action: 'create' | 'edit' | 'delete';
}

export const ActionButtonWithRBAC = component$<ActionButtonExampleProps>(
  ({ userRole, action }) => {
    const disabled = isActionDisabled(userRole, action);
    const errorMessage = disabled
      ? getPermissionErrorMessage(userRole, action)
      : '';

    return (
      <button
        disabled={disabled}
        title={errorMessage}
        class={{
          'opacity-50 cursor-not-allowed': disabled,
        }}
        onClick$={() => {
          if (disabled) {
            alert(errorMessage);
            return;
          }
          // Ejecutar acción
          console.log(`Ejecutando ${action}`);
        }}
      >
        {action === 'create' && 'Crear'}
        {action === 'edit' && 'Editar'}
        {action === 'delete' && 'Eliminar'}
      </button>
    );
  }
);

// ============================================================================
// EJEMPLO 3: Badge de rol del usuario
// ============================================================================

interface RoleBadgeExampleProps {
  role: MemberRole;
}

export const RoleBadgeExample = component$<RoleBadgeExampleProps>(({ role }) => {
  const label = getRoleLabel(role);
  const colorClasses = getRoleBadgeColor(role);

  return (
    <span
      class={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClasses}`}
    >
      {label}
    </span>
  );
});

// ============================================================================
// EJEMPLO 4: Formulario de invitación de usuarios
// ============================================================================

interface InviteUserFormExampleProps {
  currentUserRole: MemberRole;
}

export const InviteUserFormExample = component$<InviteUserFormExampleProps>(
  ({ currentUserRole }) => {
    // Determinar qué roles puede asignar el usuario actual
    const canCreateAdminRole = canCreateAdmin(currentUserRole);
    const canCreateMemberRole = canCreateMember(currentUserRole);

    if (!canCreateMemberRole) {
      return (
        <div class="bg-red-50 p-4 rounded">
          <p class="text-red-800">
            {getPermissionErrorMessage(currentUserRole, 'invitar usuarios')}
          </p>
        </div>
      );
    }

    return (
      <form>
        <label>
          Email:
          <input type="email" name="email" required />
        </label>

        <label>
          Rol:
          <select name="role" required>
            {/* Owner puede crear admin */}
            {canCreateAdminRole && <option value="admin">Administrador</option>}

            {/* Owner y Admin pueden crear member/invited */}
            <option value="member">Miembro</option>
            <option value="invited">Invitado</option>
          </select>
        </label>

        <button type="submit">Enviar Invitación</button>
      </form>
    );
  }
);

// ============================================================================
// EJEMPLO 5: Página de facturación protegida
// ============================================================================

interface BillingPageExampleProps {
  userRole: MemberRole;
}

export const BillingPageExample = component$<BillingPageExampleProps>(
  ({ userRole }) => {
    // Verificar acceso (esto debería estar en el middleware, pero sirve como ejemplo)
    if (!canAccessBilling(userRole)) {
      return (
        <div class="min-h-screen flex items-center justify-center">
          <div class="bg-red-50 p-6 rounded-lg max-w-md">
            <h2 class="text-xl font-bold text-red-800 mb-2">Acceso Denegado</h2>
            <p class="text-red-600">
              {getPermissionErrorMessage(userRole, 'acceder a facturación')}
            </p>
            <a
              href="/dashboard"
              class="mt-4 inline-block text-primary-600 hover:underline"
            >
              Volver al Dashboard
            </a>
          </div>
        </div>
      );
    }

    // Contenido de facturación (solo visible para owner)
    return (
      <div>
        <h1>Facturación</h1>
        <p>Información de suscripción y métodos de pago</p>
        {/* ... resto del contenido ... */}
      </div>
    );
  }
);

// ============================================================================
// EJEMPLO 6: Lista de usuarios con acciones basadas en rol
// ============================================================================

interface User {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
}

interface UserListExampleProps {
  currentUserRole: MemberRole;
  users: User[];
}

export const UserListExample = component$<UserListExampleProps>(
  ({ currentUserRole, users }) => {
    return (
      <div>
        <h2>Usuarios de la Organización</h2>

        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <RoleBadgeExample role={user.role} />
                </td>
                <td>
                  {/* Solo owner y admin pueden editar */}
                  {!isActionDisabled(currentUserRole, 'edit') && (
                    <button>Editar</button>
                  )}

                  {/* Solo owner puede eliminar admin */}
                  {(currentUserRole === 'owner' ||
                    (currentUserRole === 'admin' &&
                      user.role !== 'admin' &&
                      user.role !== 'owner')) && (
                    <button>Eliminar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
);

// ============================================================================
// EJEMPLO 7: Banner de modo preview para invited
// ============================================================================

interface PreviewBannerExampleProps {
  userRole: MemberRole;
}

export const PreviewBannerExample = component$<PreviewBannerExampleProps>(
  ({ userRole }) => {
    if (!isPreviewMode(userRole)) {
      return null;
    }

    return (
      <div class="fixed top-0 left-0 right-0 bg-amber-100 border-b border-amber-200 p-3 z-50">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg
              class="h-5 w-5 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span class="text-sm font-medium text-amber-800">
              Modo Preview - Los datos mostrados son de demostración
            </span>
          </div>
          <a
            href="/onboarding"
            class="text-sm font-medium text-amber-900 hover:underline"
          >
            Completar Onboarding →
          </a>
        </div>
      </div>
    );
  }
);

// ============================================================================
// NOTAS DE IMPLEMENTACIÓN
// ============================================================================

/*
 * PASO 1: Integrar guards en tus componentes
 * 
 * import { canAccessBilling, isActionDisabled } from '~/lib/auth/guards';
 * 
 * // En tu componente:
 * const userRole = useUserRole(); // routeLoader$ que obtiene el rol
 * 
 * if (canAccessBilling(userRole)) {
 *   // Mostrar sección de facturación
 * }
 * 
 * 
 * PASO 2: Proteger rutas con middleware
 * 
 * // En src/routes/(app)/dashboard/facturacion/layout.tsx
 * import { requireOwnerRole } from '~/lib/auth/middleware';
 * 
 * export const onRequest: RequestHandler = requireOwnerRole;
 * 
 * 
 * PASO 3: Crear routeLoader$ para obtener el rol
 * 
 * export const useUserRole = routeLoader$(async ({ cookie, getOrganizationId }) => {
 *   const userId = await getUserId(cookie);
 *   const orgId = await getOrganizationId();
 *   
 *   const member = await db.query.members.findFirst({
 *     where: and(
 *       eq(members.userId, userId),
 *       eq(members.organizationId, orgId)
 *     )
 *   });
 *   
 *   return member?.role ?? 'invited';
 * });
 * 
 * 
 * PASO 4: Usar en componentes
 * 
 * export default component$(() => {
 *   const userRole = useUserRole();
 *   
 *   return (
 *     <>
 *       <PreviewBannerExample userRole={userRole.value} />
 *       <SidebarWithRBAC userRole={userRole.value} />
 *       {/* ... resto del contenido ... *\/}
 *     </>
 *   );
 * });
 */
