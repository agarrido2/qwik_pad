/**
 * Icono Sun
 * @description Icono de sol para el toggle de tema (light mode)
 *
 * @param props - Acepta todas las props de <svg> (class, aria-hidden, etc.)
 * @example
 * <SunIcon aria-hidden="true" class="h-5 w-5" />
 */

import type { PropsOf } from "@builder.io/qwik";

export function SunIcon(props: PropsOf<"svg">, key: string) {
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
      <circle cx="12" cy="12" r="4" stroke-width="2" />
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 2v2"
      />
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 20v2"
      />
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="m4.93 4.93 1.41 1.41"
      />
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="m17.66 17.66 1.41 1.41"
      />
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M2 12h2"
      />
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M20 12h2"
      />
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="m6.34 17.66-1.41 1.41"
      />
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="m19.07 4.93-1.41 1.41"
      />
    </svg>
  );
}

export default SunIcon;
