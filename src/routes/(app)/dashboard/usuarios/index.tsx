/**
 * Usuarios - Gestión de equipo de la organización
 * 
 * Features:
 * - Lista de miembros con roles
 * - Invitar nuevos usuarios
 * - Cambiar roles (respetando jerarquía)
 * - Eliminar miembros (con protección)
 * 
 * Protected: requireAdminRole (layout.tsx)
 */

import { component$, useSignal } from '@builder.io/qwik';
import { routeAction$, zod$, z, type DocumentHead, Form } from '@builder.io/qwik-city';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, FormField, Alert } from '~/components/ui';
import { useOrganizationMembersLoader } from '~/lib/auth/rbac-loaders';
import { usePermissions } from '~/lib/auth/use-permissions';
import { useAppGuard } from '../../layout';
import { RBACService } from '~/lib/services/rbac.service';
import { cn } from '~/lib/utils/cn';

// ============================================================================
// LOADERS
// ============================================================================

/**
 * Loader: Obtiene lista de miembros de la org
 * Ya tiene protección canWrite en rbac-loaders.ts
 */
export const useOrgMembers = useOrganizationMembersLoader;

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Action: Invitar nuevo miembro a la organización
 * 
 * OPTIMIZACIÓN: Lee authUser y userOrgs desde sharedMap (cacheados por auth-guard)
 * en lugar de llamar a AuthService.getAuthUser + RBACService.getUserOrganizationsWithRoles
 * Ref: docs/standards/DB_QUERY_OPTIMIZATION.md § sharedMap
 */
export const useInviteMemberAction = routeAction$(
  async (formData, requestEvent) => {
    // Leer desde sharedMap (poblado por auth-guard en el middleware)
    const authUser = requestEvent.sharedMap.get('authUser');
    const orgs = requestEvent.sharedMap.get('userOrgs');

    if (!authUser) {
      return { success: false, error: 'No autenticado' };
    }

    if (!orgs || orgs.length === 0) {
      return { success: false, error: 'Sin organización' };
    }

    const activeOrg = orgs[0];

    const result = await RBACService.addMember(
      authUser.id,
      formData.email,
      activeOrg.id,
      formData.role
    );

    return result;
  },
  zod$({
    email: z.string().email('Email inválido'),
    role: z.enum(['member', 'admin', 'owner']),
  })
);

/**
 * Action: Cambiar rol de un miembro
 * OPTIMIZACIÓN: Lee desde sharedMap (cacheado por auth-guard)
 */
export const useChangeRoleAction = routeAction$(
  async (formData, requestEvent) => {
    const authUser = requestEvent.sharedMap.get('authUser');
    const orgs = requestEvent.sharedMap.get('userOrgs');

    if (!authUser) {
      return { success: false, error: 'No autenticado' };
    }

    if (!orgs || orgs.length === 0) {
      return { success: false, error: 'Sin organización' };
    }

    const activeOrg = orgs[0];

    const result = await RBACService.changeUserRole(
      authUser.id,
      formData.targetUserId,
      activeOrg.id,
      formData.newRole
    );

    return result;
  },
  zod$({
    targetUserId: z.string().uuid(),
    newRole: z.enum(['member', 'admin', 'owner']),
  })
);

/**
 * Action: Eliminar miembro de la organización
 * OPTIMIZACIÓN: Lee desde sharedMap (cacheado por auth-guard)
 */
export const useRemoveMemberAction = routeAction$(
  async (formData, requestEvent) => {
    const authUser = requestEvent.sharedMap.get('authUser');
    const orgs = requestEvent.sharedMap.get('userOrgs');

    if (!authUser) {
      return { success: false, error: 'No autenticado' };
    }

    if (!orgs || orgs.length === 0) {
      return { success: false, error: 'Sin organización' };
    }

    const activeOrg = orgs[0];

    const result = await RBACService.removeMember(
      authUser.id,
      formData.targetUserId,
      activeOrg.id
    );

    return result;
  },
  zod$({
    targetUserId: z.string().uuid(),
  })
);

// ============================================================================
// COMPONENT
// ============================================================================

export default component$(() => {
  const members = useOrgMembers();
  const permissions = usePermissions(); // ★ useComputed$ (0 server queries)
  const appData = useAppGuard(); // userId para protección self-edit
  const inviteAction = useInviteMemberAction();
  const changeRoleAction = useChangeRoleAction();
  const removeAction = useRemoveMemberAction();

  // UI State
  const inviteFormOpen = useSignal(false);
  const editingMemberId = useSignal<string | null>(null);
  const confirmDeleteId = useSignal<string | null>(null);

  return (
    <div class="space-y-6">
      {/* Header */}
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-neutral-900">Gestión de Usuarios</h1>
          <p class="mt-1 text-sm text-neutral-600">
            Administra los miembros de tu organización y sus permisos
          </p>
        </div>

        {/* Botón Invitar */}
        <Button
          onClick$={() => (inviteFormOpen.value = !inviteFormOpen.value)}
          disabled={permissions.value.permissions.isActionDisabled.create}
        >
          <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Invitar Usuario
        </Button>
      </div>

      {/* Mensajes de éxito/error */}
      {inviteAction.value?.success && (
        <Alert variant="success" title="Usuario invitado">
          El usuario ha sido añadido correctamente a la organización
        </Alert>
      )}
      {inviteAction.value?.error && (
        <Alert variant="error" title="Error al invitar">
          {inviteAction.value.error}
        </Alert>
      )}
      {changeRoleAction.value?.success && (
        <Alert variant="success" title="Rol actualizado">
          El rol del usuario ha sido modificado correctamente
        </Alert>
      )}
      {changeRoleAction.value?.error && (
        <Alert variant="error" title="Error al cambiar rol">
          {changeRoleAction.value.error}
        </Alert>
      )}
      {removeAction.value?.success && (
        <Alert variant="success" title="Usuario eliminado">
          El usuario ha sido eliminado de la organización
        </Alert>
      )}
      {removeAction.value?.error && (
        <Alert variant="error" title="Error al eliminar">
          {removeAction.value.error}
        </Alert>
      )}

      {/* Formulario de invitación */}
      {inviteFormOpen.value && (
        <Card>
          <CardHeader>
            <CardTitle>Invitar nuevo miembro</CardTitle>
          </CardHeader>
          <CardContent>
            <Form action={inviteAction} class="space-y-4">
              <FormField name="email" label="Email del usuario" required>
                <Input
                  type="email"
                  name="email"
                  placeholder="usuario@ejemplo.com"
                  required
                  aria-label="Email del nuevo usuario"
                />
              </FormField>

              <FormField name="role" label="Rol" required>
                <select
                  name="role"
                  class="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                  aria-label="Seleccionar rol para el nuevo usuario"
                >
                  {permissions.value.assignableRoles.map((role) => (
                    <option key={role} value={role}>
                      {role === 'owner' ? 'Propietario' : role === 'admin' ? 'Administrador' : 'Miembro'}
                    </option>
                  ))}
                </select>
              </FormField>

              <div class="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick$={() => (inviteFormOpen.value = false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Enviar Invitación</Button>
              </div>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Lista de miembros */}
      <Card>
        <CardHeader>
          <CardTitle>Miembros del equipo ({members.value.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-neutral-200">
                  <th class="text-left py-3 px-4 text-sm font-medium text-neutral-700">Usuario</th>
                  <th class="text-left py-3 px-4 text-sm font-medium text-neutral-700">Rol</th>
                  <th class="text-left py-3 px-4 text-sm font-medium text-neutral-700">Desde</th>
                  <th class="text-right py-3 px-4 text-sm font-medium text-neutral-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {members.value.map((member) => (
                  <tr key={member.user.id} class="border-b border-neutral-100 hover:bg-neutral-50">
                    <td class="py-3 px-4">
                      <div class="flex items-center gap-3">
                        {/* Avatar placeholder */}
                        <div class="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
                          {member.user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p class="text-sm font-medium text-neutral-900">
                            {member.user.fullName || member.user.email}
                          </p>
                          <p class="text-xs text-neutral-500">{member.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td class="py-3 px-4">
                      {editingMemberId.value === member.user.id ? (
                        <Form action={changeRoleAction} class="flex gap-2 items-center">
                          <input type="hidden" name="targetUserId" value={member.user.id} />
                          <select
                            name="newRole"
                            class="px-2 py-1 border border-neutral-300 rounded text-sm"
                            aria-label={`Cambiar rol de ${member.user.email}`}
                          >
                            {permissions.value.assignableRoles.map((role) => (
                              <option key={role} value={role} selected={role === member.role}>
                                {role === 'owner' ? 'Propietario' : role === 'admin' ? 'Administrador' : 'Miembro'}
                              </option>
                            ))}
                          </select>
                          <Button type="submit" size="sm">Guardar</Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick$={() => (editingMemberId.value = null)}
                          >
                            Cancelar
                          </Button>
                        </Form>
                      ) : (
                        <span class={cn('px-2 py-1 rounded-full text-xs font-medium', member.roleBadgeColor)}>
                          {member.roleLabel}
                        </span>
                      )}
                    </td>
                    <td class="py-3 px-4 text-sm text-neutral-600">
                      {new Date(member.joinedAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td class="py-3 px-4">
                      <div class="flex gap-2 justify-end">
                        {/* Botón Editar Rol */}
                        {editingMemberId.value !== member.user.id && (
                          <button
                            onClick$={() => (editingMemberId.value = member.user.id)}
                            disabled={permissions.value.permissions.isActionDisabled.edit || member.user.id === appData.value.user.id}
                            class="p-2 text-neutral-600 hover:bg-neutral-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={`Editar rol de ${member.user.email}`}
                          >
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}

                        {/* Botón Eliminar */}
                        {confirmDeleteId.value === member.user.id ? (
                          <Form action={removeAction} class="flex gap-1">
                            <input type="hidden" name="targetUserId" value={member.user.id} />
                            <Button type="submit" size="sm" variant="outline" class="text-red-600 border-red-300 hover:bg-red-50">
                              Confirmar
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick$={() => (confirmDeleteId.value = null)}
                            >
                              Cancelar
                            </Button>
                          </Form>
                        ) : (
                          <button
                            onClick$={() => (confirmDeleteId.value = member.user.id)}
                            disabled={permissions.value.permissions.isActionDisabled.delete || member.user.id === appData.value.user.id}
                            class="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={`Eliminar a ${member.user.email}`}
                          >
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Empty state */}
            {members.value.length === 0 && (
              <div class="text-center py-12">
                <svg class="mx-auto h-12 w-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-neutral-900">Sin miembros</h3>
                <p class="mt-1 text-sm text-neutral-500">Empieza invitando a tu primer miembro</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

// ============================================================================
// SEO
// ============================================================================

export const head: DocumentHead = {
  title: 'Gestión de Usuarios - Onucall',
  meta: [
    {
      name: 'description',
      content: 'Administra los miembros de tu equipo, asigna roles y controla permisos en tu organización.',
    },
    // Open Graph
    {
      property: 'og:title',
      content: 'Gestión de Usuarios - Onucall',
    },
    {
      property: 'og:description',
      content: 'Administra los miembros de tu equipo, asigna roles y controla permisos en tu organización.',
    },
    {
      property: 'og:type',
      content: 'website',
    },
    // Twitter Card
    {
      name: 'twitter:card',
      content: 'summary',
    },
    {
      name: 'twitter:title',
      content: 'Gestión de Usuarios - Onucall',
    },
    {
      name: 'twitter:description',
      content: 'Administra los miembros de tu equipo, asigna roles y controla permisos en tu organización.',
    },
  ],
  links: [
    {
      rel: 'canonical',
      href: 'https://onucall.com/dashboard/usuarios',
    },
  ],
};
