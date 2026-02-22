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
 * OPTIMIZACIÓN:
 * - JWT cached via sharedMap (AuthService.getAuthUser)
 * - Si el middleware ya cacheó orgs en sharedMap ('userOrgs'), solo
 *   hace 1 query ligera (user profile por PK) en vez del JOIN completo.
 * - Fallback al JOIN cuando no hay cache (rutas sin middleware, ej. /onboarding).
 * Referencia: docs/standards/DB_QUERY_OPTIMIZATION.md § 2.1
 */
export async function getAuthGuardData(
  requestEvent: RequestEventLoader | RequestEventAction,
): Promise<AuthGuardResult | null> {
  // Query 1: Validar JWT (Supabase Auth - cached via sharedMap)
  const authUser = await AuthService.getAuthUser(requestEvent);
  if (!authUser) return null;

  // ★ Fast path: middleware ya cacheó orgs → solo fetch user profile (PK lookup)
  const cachedOrgs = requestEvent.sharedMap.get('userOrgs') as
    | AuthGuardResult['organizations']
    | undefined;

  if (cachedOrgs && cachedOrgs.length > 0) {
    const [dbUser] = await db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        avatarUrl: users.avatarUrl,
        onboardingCompleted: users.onboardingCompleted,
      })
      .from(users)
      .where(eq(users.id, authUser.id))
      .limit(1);

    if (!dbUser) return null;

    return {
      authUser: { id: authUser.id, email: authUser.email! },
      dbUser,
      organizations: cachedOrgs,
    };
  }

  // Slow path: sin cache (rutas sin middleware, ej. /onboarding) → JOIN completo
  const userWithOrgs = await OrganizationService.getUserWithOrganizations(authUser.id);
  if (!userWithOrgs || userWithOrgs.length === 0) return null;

  const dbUser = {
    id: userWithOrgs[0].userId,
    email: userWithOrgs[0].userEmail,
    fullName: userWithOrgs[0].userFullName,
    avatarUrl: userWithOrgs[0].userAvatarUrl,
    onboardingCompleted: userWithOrgs[0].onboardingCompleted,
  };

  const organizations = userWithOrgs
    .filter((row) => row.orgId !== null)
    .map((row) => ({
      id: row.orgId!,
      name: row.orgName!,
      slug: row.orgSlug!,
      subscriptionTier: row.orgSubscriptionTier!,
      sector: row.orgSector,
      role: row.orgRole!,
    }));

  // Cachear para loaders downstream
  requestEvent.sharedMap.set('userOrgs', organizations);

  return {
    authUser: { id: authUser.id, email: authUser.email! },
    dbUser,
    organizations,
  };
}
