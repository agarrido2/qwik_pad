/**
 * Dashboard Icons - SVG icon components para el sidebar y dashboard
 *
 * PATRÓN: Los iconos se definen como JSX estático (no component$) porque:
 * 1. Son SVGs puros sin estado ni interactividad
 * 2. Evitan overhead de serialización QRL innecesaria
 * 3. Se renderizan inline donde se necesiten
 *
 * Cada icono acepta class opcional via el IconMap consumer.
 * Default: class="h-5 w-5" con stroke="currentColor" para heredar color.
 *
 * Ref: docs/standards/SVG_ICONS_GUIDE.md
 */

import type { JSXOutput } from "@builder.io/qwik";

/**
 * Mapa de iconos string → SVG JSX
 *
 * Keyed by icon name (definido en menu-options.ts).
 * Usado por DashboardSidebar para renderizar iconos sin serializar QRL components en config.
 */
export const IconMap: Record<string, JSXOutput> = {
  home: (
    <svg
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      class="h-5 w-5"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="m3 12 2-2m0 0 7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11 2 2m-2-2v10a1 1 0 0 1-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1m-6 0h6"
      />
    </svg>
  ),
  phone: (
    <svg
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      class="h-5 w-5"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .948.684l1.498 4.493a1 1 0 0 1-.502 1.21l-2.257 1.13a11.04 11.04 0 0 0 5.516 5.516l1.13-2.257a1 1 0 0 1 1.21-.502l4.493 1.498a1 1 0 0 1 .684.949V19a2 2 0 0 1-2 2h-1C9.716 21 3 14.284 3 6z"
      />
    </svg>
  ),
  bot: (
    <svg
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      class="h-5 w-5"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="m9 12 2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0"
      />
    </svg>
  ),
  hash: (
    <svg
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      class="h-5 w-5"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="m7 20 4-16m2 16 4-16M6 9h14M4 15h14"
      />
    </svg>
  ),
  calendar: (
    <svg
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      class="h-5 w-5"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M8 7V3m8 4V3m-9 8h10M4 20h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2"
      />
    </svg>
  ),
  chart: (
    <svg
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      class="h-5 w-5"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M3 3v18h18M9 17V9m4 8V5m4 12v-6"
      />
    </svg>
  ),
  inbox: (
    <svg
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      class="h-5 w-5"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M20 13V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6m16 0-2 7H6l-2-7m16 0h-4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2H4"
      />
    </svg>
  ),
  contact: (
    <svg
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      class="h-5 w-5"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M5.121 17.804a9 9 0 1 1 13.757-.004M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0"
      />
    </svg>
  ),
  building: (
    <svg
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      class="h-5 w-5"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M3 21h18M5 21V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14M9 9h2m-2 4h2m4-4h2m-2 4h2m-7 8v-3h4v3"
      />
    </svg>
  ),
  workflow: (
    <svg
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      class="h-5 w-5"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4 7h9m0 0-3-3m3 3-3 3m10 7h-9m0 0 3-3m-3 3 3 3"
      />
    </svg>
  ),
  puzzle: (
    <svg
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      class="h-5 w-5"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M11 4a2 2 0 1 1 4 0v1a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1a2 2 0 1 0 0 4h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-1a2 2 0 1 0-4 0v1a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H4a2 2 0 1 1 0-4h1a1 1 0 0 0 1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 0 1-1z"
      />
    </svg>
  ),
  book: (
    <svg
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      class="h-5 w-5"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18s-3.332.477-4.5 1.253"
      />
    </svg>
  ),
  settings: (
    <svg
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      class="h-5 w-5"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065"
      />
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0"
      />
    </svg>
  ),
  "credit-card": (
    <svg
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      class="h-5 w-5"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3"
      />
    </svg>
  ),
  logout: (
    <svg
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      class="h-5 w-5"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="m17 16 4-4m0 0-4-4m4 4H7m6 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1"
      />
    </svg>
  ),
  support: (
    <svg
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      class="h-5 w-5"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="m18.364 5.636-3.536 3.536m0 5.656 3.536 3.536M9.172 9.172 5.636 5.636m3.536 9.192-3.536 3.536M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0m-5 0a4 4 0 1 1-8 0 4 4 0 0 1 8 0"
      />
    </svg>
  ),
  users: (
    <svg
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      class="h-5 w-5"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 4.354a4 4 0 1 1 0 5.292M15 21H3v-1a6 6 0 0 1 12 0zm0 0h6v-1a6 6 0 0 0-9-5.197M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0"
      />
    </svg>
  ),
  chevron: (
    <svg
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      class="h-4 w-4 transition-transform duration-200"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="m9 5 7 7-7 7"
      />
    </svg>
  ),
  chevronLeft: (
    <svg
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      class="h-4 w-4"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="m15 19-7-7 7-7"
      />
    </svg>
  ),
  sun: (
  <svg 
  fill="none" 
  stroke="currentColor" 
  aria-hidden="true" 
  class="h-5 w-5" 
  viewBox="0 0 24 24">
    <path 
    stroke-linecap="round" 
    stroke-linejoin="round" 
    stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364-.707.707M6.343 17.657l-.707.707m12.728 0-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8"
    />
    </svg>
),
moon: (
  <svg
  fill="none"
  stroke="currentColor"
  aria-hidden="true"
  class="h-5 w-5"
  viewBox="0 0 24 24">
    <path
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="2" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79"
    />
    </svg>
),

  // ── Iconos añadidos para módulos del SaaS ─────────────────────

  /** Reloj — Citas Programadas, Horarios de Atención */
  clock: (
    <svg fill="none" stroke="currentColor" aria-hidden="true" class="h-5 w-5" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0" />
    </svg>
  ),

  /** Base de datos cilíndrica — Base de Conocimiento */
  database: (
    <svg fill="none" stroke="currentColor" aria-hidden="true" class="h-5 w-5" viewBox="0 0 24 24">
      <ellipse cx="12" cy="6" rx="8" ry="3" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6v4c0 1.657 3.582 3 8 3s8-1.343 8-3V6" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 10v4c0 1.657 3.582 3 8 3s8-1.343 8-3v-4" />
    </svg>
  ),

  /** Documento con líneas — Prompts y Guiones */
  "file-text": (
    <svg fill="none" stroke="currentColor" aria-hidden="true" class="h-5 w-5" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
    </svg>
  ),

  /** Diana / Radar — Radar de Intención (Pipeline CRM) */
  target: (
    <svg fill="none" stroke="currentColor" aria-hidden="true" class="h-5 w-5" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
      <circle cx="12" cy="12" r="6"  stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
      <circle cx="12" cy="12" r="2"  stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
    </svg>
  ),

  /** Coche — Mis Vehículos (catálogo) */
  car: (
    <svg fill="none" stroke="currentColor" aria-hidden="true" class="h-5 w-5" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 17a2 2 0 1 0 4 0m-4 0a2 2 0 1 1 4 0m0 0h2m4 0a2 2 0 1 0-4 0m4 0a2 2 0 1 1-4 0M3 11l1.5-5h15l1.5 5H3zm0 0v5a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-5" />
    </svg>
  ),

  /** Globo terráqueo — Portal Web */
  globe: (
    <svg fill="none" stroke="currentColor" aria-hidden="true" class="h-5 w-5" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
    </svg>
  ),

  /** Línea ascendente — KPIs y Métricas */
  trending: (
    <svg fill="none" stroke="currentColor" aria-hidden="true" class="h-5 w-5" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8-8 8-4-4-6 6" />
    </svg>
  ),

  /** Destellos — BI Conversacional (IA generativa) */
  sparkles: (
    <svg fill="none" stroke="currentColor" aria-hidden="true" class="h-5 w-5" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16 2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143z" />
    </svg>
  ),

};
