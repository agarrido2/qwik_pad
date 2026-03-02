/**
 * Profile User Menu - Menú desplegable de perfil del usuario
 *
 * Muestra el avatar y nombre del usuario con un dropdown que incluye
 * enlaces a perfil/configuración y la acción de logout.
 */

import { component$, useContext } from "@builder.io/qwik";
import { Form } from "@builder.io/qwik-city";
import { useLogoutAction } from "~/routes/(app)/dashboard/layout";
import { AuthContext } from "~/lib/context/auth.context";
import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownSeparator,
} from "~/components/ui";
import { UserIcon } from "~/components/icons/user-icon";
import { SettingsIcon } from "~/components/icons/settings-icon";
import { LogoutIcon } from "~/components/icons/logout-icon";

export const ProfileUser = component$(() => {
  const logoutAction = useLogoutAction();
  const auth = useContext(AuthContext);

  return (
    <Dropdown align="right" width="w-48">
      <button
        q:slot="trigger"
        type="button"
        class="hover:bg-accent flex items-center justify-center rounded-full transition-colors"
        aria-label="Menú de perfil"
      >
        <Avatar name={auth.user.fullName || auth.user.email} size="sm" />
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
          class="text-error hover:bg-error/10 flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors"
        >
          <LogoutIcon aria-hidden="true" class="h-4 w-4" />
          Cerrar sesión
        </button>
      </Form>
    </Dropdown>
  );
});
