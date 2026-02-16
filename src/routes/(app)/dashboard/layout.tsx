/**
 * Dashboard Layout - Envuelve las páginas del dashboard con sidebar + header
 * Auth guard ya ejecutado en (app)/layout.tsx
 *
 * RBAC 2026-02-15:
 * - Middleware checkRouteAccess valida permisos contra menu.config.ts
 * - UN middleware para TODAS las rutas /dashboard/* (reemplaza middlewares individuales)
 * - Permisos se derivan del AuthContext (useComputed$ en componentes)
 */

import { component$, Slot } from '@builder.io/qwik';
import { routeAction$, type RequestHandler } from '@builder.io/qwik-city';
import { DashboardLayout } from '~/components/layouts';
import { AuthService } from '~/lib/services/auth.service';
import { checkRouteAccess } from '~/lib/auth/middleware';

/**
 * Middleware RBAC: Protege TODAS las rutas /dashboard/* usando menu.config.ts
 * Se ejecuta ANTES de cualquier routeLoader o componente.
 */
export const onRequest: RequestHandler = checkRouteAccess;

/**
 * Action para cerrar sesión
 * Se ejecuta desde el componente DashboardLayout
 */
export const useLogoutAction = routeAction$(async (_, requestEvent) => {
  await AuthService.signOut(requestEvent);
  throw requestEvent.redirect(302, '/');
});

export default component$(() => {
  return (
    <DashboardLayout>
      <Slot />
    </DashboardLayout>
  );
});
