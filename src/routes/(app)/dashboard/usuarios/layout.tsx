/**
 * Usuarios Layout
 *
 * Protección de ruta manejada por checkRouteAccess en dashboard/layout.tsx
 * usando la configuración de menu.config.ts (roles: ['owner', 'admin']).
 *
 * Refactored: 2026-02-15 - Middleware individual eliminado (centralizado)
 */

import { component$, Slot } from '@builder.io/qwik';

export default component$(() => {
  return <Slot />;
});
