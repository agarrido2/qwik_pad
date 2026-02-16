/**
 * Icono ChevronDown
 * @description Flecha hacia abajo, usado en accordions, dropdowns
 * 
 * @param props - Acepta todas las props de <svg> (class, aria-hidden, etc.)
 * @example
 * <ChevronDown aria-hidden="true" class="h-4 w-4" />
 */
import type { PropsOf } from '@builder.io/qwik'

export function ChevronDown(props: PropsOf<'svg'>, key: string) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      {...props}
      key={key}
    >
      <path d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export default ChevronDown