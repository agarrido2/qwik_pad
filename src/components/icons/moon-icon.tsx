/**
 * Icono Moon
 * @description Icono de luna para el toggle de tema (placeholder visual de dark mode)
 *
 * @param props - Acepta todas las props de <svg> (class, aria-hidden, etc.)
 * @example
 * <MoonIcon aria-hidden="true" class="h-5 w-5" />
 */

import type { PropsOf } from '@builder.io/qwik'

export function MoonIcon(props: PropsOf<'svg'>, key: string) {
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
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  )
}

export default MoonIcon
