/**
 * Auth Context - Estado consolidado de autenticación + organización
 *
 * Contexto único que unifica user data y organización activa con rol.
 * Reemplaza al anterior OrganizationContext con un diseño más simple
 * y completo (incluye datos del usuario autenticado).
 *
 * Provider: src/routes/(app)/layout.tsx
 * Consumido por: sidebar, header, páginas del dashboard
 *
 * Created: 2026-02-15
 */

import { createContextId } from '@builder.io/qwik';
import type { MemberRole } from '~/lib/auth/guards';

// ============================================================================
// TYPES
// ============================================================================

export interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;
}

export interface AuthOrganization {
  id: string;
  name: string;
  slug: string;
  subscriptionTier: string;
  industry: string | null;
  role: MemberRole;
  /** Pre-computed: "Propietario" | "Administrador" | "Miembro" */
  roleLabel: string;
  /** Pre-computed: Tailwind classes para badge de rol */
  roleBadgeColor: string;
}

export interface AuthContextValue {
  /** Usuario autenticado */
  user: AuthUser;
  /** Organización activa (multi-tenant) */
  organization: AuthOrganization;
  /** Todas las organizaciones del usuario */
  allOrganizations: AuthOrganization[];
  /** User pertenece a múltiples orgs (consultor/franquicia) */
  isMultiOrg: boolean;
  /** Org activa en tier free (datos demo) */
  isPreviewMode: boolean;
}

// ============================================================================
// CONTEXT ID
// ============================================================================

/**
 * Contexto de autenticación para toda la app (app).
 *
 * @example
 * const auth = useContext(AuthContext);
 * auth.user.email           // "user@example.com"
 * auth.organization.role    // "owner"
 * auth.organization.roleLabel // "Propietario"
 * auth.isPreviewMode        // true (free tier)
 */
export const AuthContext =
  createContextId<AuthContextValue>('auth');
