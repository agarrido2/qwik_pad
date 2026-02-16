/**
 * Icono Logout
 * @description Icono de cerrar sesión para acciones destructivas de autenticación
 *
 * @param props - Acepta todas las props de <svg> (class, aria-hidden, etc.)
 * @example
 * <LogoutIcon aria-hidden="true" class="h-4 w-4" />
 */

import type { PropsOf } from '@builder.io/qwik'

export function LogoutIcon(props: PropsOf<'svg'>, key: string) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      {...props}
      key={key}
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  )
}

export default LogoutIcon
