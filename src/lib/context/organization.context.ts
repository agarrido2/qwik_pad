/**
 * Organization Context - Maneja org activa para multi-tenant
 * Provider en (app)/layout.tsx, consumido por componentes del dashboard
 */

import { createContextId } from '@builder.io/qwik';

export interface OrganizationContextValue {
  /** Organización activa */
  active: {
    id: string;
    name: string;
    slug: string;
    subscriptionTier: string;
    industry: string | null;
    role: string;
  };
  /** Todas las organizaciones del usuario */
  all: Array<{
    id: string;
    name: string;
    slug: string;
    subscriptionTier: string;
    industry: string | null;
    role: string;
  }>;
  /** User tiene múltiples orgs (consultor) */
  isMultiOrg: boolean;
  /** Org está en tier free (modo demo) */
  isPreviewMode: boolean;
}

export const OrganizationContext = createContextId<OrganizationContextValue>(
  'organization-context',
);
