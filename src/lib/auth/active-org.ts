/**
 * Active Organization Helper
 *
 * Centraliza la selección de organización activa en server-side.
 * Fuente de verdad: cookie HTTP-only `active_org_id` + validación contra
 * las organizaciones reales del usuario en el request actual.
 */

import type { RequestEventCommon } from '@builder.io/qwik-city';

/** Nombre de cookie para persistir la organización activa. */
export const ACTIVE_ORG_COOKIE_NAME = 'active_org_id';

/** Tipo mínimo requerido para resolver org activa. */
export interface ActiveOrganizationLike {
  id: string;
}

/**
 * Resuelve la organización activa de forma segura.
 *
 * Seguridad: el valor de cookie nunca se confía directamente; siempre se
 * valida contra `organizations` del usuario autenticado.
 */
export function resolveActiveOrg<T extends ActiveOrganizationLike>(
  requestEvent: RequestEventCommon,
  organizations: readonly T[],
): T {
  if (organizations.length === 0) {
    throw new Error('No se puede resolver organización activa sin organizaciones');
  }

  const cookieOrgId = requestEvent.cookie.get(ACTIVE_ORG_COOKIE_NAME)?.value;

  if (!cookieOrgId) {
    return organizations[0];
  }

  const matchedOrganization = organizations.find((org) => org.id === cookieOrgId);
  return matchedOrganization ?? organizations[0];
}

/**
 * Persiste la organización activa en cookie HTTP-only para que middleware,
 * loaders y actions compartan el mismo contexto multi-tenant.
 */
export function setActiveOrgCookie(
  requestEvent: RequestEventCommon,
  organizationId: string,
): void {
  requestEvent.cookie.set(ACTIVE_ORG_COOKIE_NAME, organizationId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: requestEvent.url.protocol === 'https:',
    maxAge: 60 * 60 * 24 * 365,
  });
}