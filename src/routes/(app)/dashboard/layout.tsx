/**
 * Dashboard Layout - Envuelve las páginas del dashboard con sidebar + header
 * Auth guard ya ejecutado en (app)/layout.tsx
 * 
 * OPTIMIZACIÓN 2026-02-14:
 * - Eliminado useUserRoleLoader (1 DB query) → reemplazado por usePermissions (useComputed$)
 * - Los permisos se derivan del OrganizationContext que ya tiene el role
 * - Zero server round-trips adicionales para permisos UI
 */

import { component$, Slot } from '@builder.io/qwik';
import { routeAction$ } from '@builder.io/qwik-city';
import { DashboardLayout } from '~/components/layouts';
import { AuthService } from '~/lib/services/auth.service';

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
