/**
 * Icono User
 * @description Icono de usuario para opciones de perfil
 *
 * @param props - Acepta todas las props de <svg> (class, aria-hidden, etc.)
 * @example
 * <UserIcon aria-hidden="true" class="h-4 w-4" />
 */

import type { PropsOf } from '@builder.io/qwik'

export function UserIcon(props: PropsOf<'svg'>, key: string) {
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
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  )
}

export default UserIcon
