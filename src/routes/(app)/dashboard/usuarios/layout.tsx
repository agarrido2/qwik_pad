/**
 * Usuarios Layout - Gestión de equipo
 * Protegido con requireAdminRole (solo admin y owner)
 * Members no tienen acceso a esta sección
 */

import { component$, Slot } from '@builder.io/qwik';
import type { RequestHandler } from '@builder.io/qwik-city';
import { requireAdminRole } from '~/lib/auth/middleware';

/**
 * Middleware: Bloquea acceso a members
 * Solo admins y owners pueden gestionar usuarios
 */
export const onRequest: RequestHandler = requireAdminRole;

export default component$(() => {
  return <Slot />;
});
