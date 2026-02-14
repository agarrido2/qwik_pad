/**
 * Facturación Layout - Gestión de suscripción y pagos
 * Protegido con requireOwnerRole (solo propietarios)
 * Admins y members no tienen acceso a esta sección
 */

import { component$, Slot } from '@builder.io/qwik';
import type { RequestHandler } from '@builder.io/qwik-city';
import { requireOwnerRole } from '~/lib/auth/middleware';

/**
 * Middleware: Bloquea acceso a no-owners
 * Solo el propietario puede gestionar facturación
 */
export const onRequest: RequestHandler = requireOwnerRole;

export default component$(() => {
  return <Slot />;
});
