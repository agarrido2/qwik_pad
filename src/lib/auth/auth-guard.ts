/**
 * Auth Guard helper
 * Verifica sesión activa y estado de onboarding en routeLoaders
 */

import type { RequestEventLoader, RequestEventAction } from '@builder.io/qwik-city';
import { AuthService } from '../services/auth.service';
import { OnboardingService } from '../services/onboarding.service';
import { OrganizationService } from '../services/organization.service';
import { db } from '../db';
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
 */
export async function getAuthGuardData(
  requestEvent: RequestEventLoader | RequestEventAction,
): Promise<AuthGuardResult | null> {
  const authUser = await AuthService.getAuthUser(requestEvent);
  if (!authUser) return null;

  // Cargar datos de la tabla users (perfil)
  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1);

  if (!dbUser) return null;

  // Cargar organizaciones del usuario
  const organizations = await OrganizationService.getUserOrganizations(authUser.id);

  return {
    authUser: { id: authUser.id, email: authUser.email! },
    dbUser,
    organizations,
  };
}
