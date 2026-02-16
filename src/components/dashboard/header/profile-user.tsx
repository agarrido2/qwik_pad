/**
 * Profile User Menu - Menú desplegable de perfil del usuario
 *
 * Muestra el avatar y nombre del usuario con un dropdown que incluye
 * enlaces a perfil/configuración y la acción de logout.
 */

import { component$, useContext } from '@builder.io/qwik';
import { Form } from '@builder.io/qwik-city';
import { useLogoutAction } from '~/routes/(app)/dashboard/layout';
import { AuthContext } from '~/lib/context/auth.context';
import { Avatar, Dropdown, DropdownItem, DropdownSeparator } from '~/components/ui';
import { UserIcon } from '~/components/icons/user-icon';
import { SettingsIcon } from '~/components/icons/settings-icon';
import { LogoutIcon } from '~/components/icons/logout-icon';
import { ChevronDown } from '~/components/icons/chevronDown-icon';

export const ProfileUser = component$(() => {
  const logoutAction = useLogoutAction();
  const auth = useContext(AuthContext);

  return (
    <Dropdown align="right" width="w-48">
      <button
        q:slot="trigger"
        type="button"
        class="flex items-center gap-2 p-2 rounded-md hover:bg-neutral-100 transition-colors"
        aria-label="Menú de perfil"
      >
        <Avatar name={auth.user.fullName || auth.user.email} size="sm" />

        <span class="text-sm font-medium text-neutral-700 hidden sm:inline">
          {auth.user.fullName || auth.user.email}
        </span>

        <ChevronDown aria-hidden="true" class="h-4 w-4 text-neutral-500" />
      </button>

      <DropdownItem href="/dashboard/perfil">
        <UserIcon aria-hidden="true" class="h-4 w-4" />
        Mi perfil
      </DropdownItem>

      <DropdownItem href="/dashboard/configuracion">
        <SettingsIcon aria-hidden="true" class="h-4 w-4" />
        Configuración
      </DropdownItem>

      <DropdownSeparator />

      <Form action={logoutAction}>
        <button
          type="submit"
          class="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogoutIcon aria-hidden="true" class="h-4 w-4" />
          Cerrar sesión
        </button>
      </Form>
    </Dropdown>
  );
});
