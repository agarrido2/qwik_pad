/**
 * Auth Guard helper
 * Verifica sesión activa y estado de onboarding en routeLoaders
 */

import type { RequestEventLoader, RequestEventAction } from '@builder.io/qwik-city';
import { AuthService } from '../services/auth.service';
import { OnboardingService } from '../services/onboarding.service';
import { OrganizationService } from '../services/organization.service';
import { db } from '../db/client';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export interface AuthGuardResult {
  authUser: {
    id: string;
    email: string;
  };
  dbUser: {
    id: string;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
    onboardingCompleted: boolean;
  };
  organizations: Awaited<ReturnType<typeof OrganizationService.getUserOrganizations>>;
}

/**
 * Verifica que el usuario esté autenticado y carga sus datos completos.
 * NO redirige: deja la decisión al caller.
 * Retorna null si no hay sesión válida.
 * 
 * OPTIMIZACIÓN: 2 queries (1 Auth + 1 DB con JOIN) en vez de 3 separadas.
 * Referencia: docs/standards/DB_QUERY_OPTIMIZATION.md § 2.1
 */
export async function getAuthGuardData(
  requestEvent: RequestEventLoader | RequestEventAction,
): Promise<AuthGuardResult | null> {
  // Query 1: Validar JWT (Supabase Auth - no evitable)
  const authUser = await AuthService.getAuthUser(requestEvent);
  if (!authUser) return null;

  // Query 2: Cargar user + organizations en 1 solo JOIN (optimización 3→1)
  const userWithOrgs = await OrganizationService.getUserWithOrganizations(authUser.id);
  if (!userWithOrgs || userWithOrgs.length === 0) return null;

  // Estructurar resultado
  const dbUser = {
    id: userWithOrgs[0].userId,
    email: userWithOrgs[0].userEmail,
    fullName: userWithOrgs[0].userFullName,
    avatarUrl: userWithOrgs[0].userAvatarUrl,
    onboardingCompleted: userWithOrgs[0].onboardingCompleted,
  };

  // Extraer organizations (puede haber múltiples rows por JOINs)
  const organizations = userWithOrgs
    .filter((row) => row.orgId !== null) // Filtrar si no tiene orgs (LEFT JOIN)
    .map((row) => ({
      id: row.orgId!,
      name: row.orgName!,
      slug: row.orgSlug!,
      subscriptionTier: row.orgSubscriptionTier!,
      industry: row.orgIndustry,
      role: row.orgRole!,
    }));

  return {
    authUser: { id: authUser.id, email: authUser.email! },
    dbUser,
    organizations,
  };
}
