/**
 * Organization Context - Maneja org activa para multi-tenant
 * Provider en (app)/layout.tsx, consumido por componentes del dashboard
 * 
 * Updated: 2026-02-14 - Añadido tipo MemberRole de guards
 */

import { createContextId } from '@builder.io/qwik';
import type { MemberRole } from '../auth/guards';

export interface OrganizationContextValue {
  /** Organización activa */
  active: {
    id: string;
    name: string;
    slug: string;
    subscriptionTier: string;
    industry: string | null;
    role: MemberRole;
  };
  /** Todas las organizaciones del usuario */
  all: Array<{
    id: string;
    name: string;
    slug: string;
    subscriptionTier: string;
    industry: string | null;
    role: MemberRole;
  }>;
  /** User tiene múltiples orgs (consultor) */
  isMultiOrg: boolean;
  /** Org está en tier free (modo demo) */
  isPreviewMode: boolean;
}

export const OrganizationContext = createContextId<OrganizationContextValue>(
  'organization-context',
);
