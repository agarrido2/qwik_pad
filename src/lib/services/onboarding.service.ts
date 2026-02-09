import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { OrganizationService } from './organization.service';
import { DemoDataService } from './demo-data.service';
import type { IndustrySlug } from '../utils/demo-data-templates';

/**
 * Onboarding Service - Maneja el proceso de onboarding
 */

export class OnboardingService {
  /**
   * Completa el proceso de onboarding
   * 1. Crea la organización
   * 2. Añade al usuario como owner
   * 3. Marca onboarding como completado
   * 4. (Futuro) Genera datos demo según industria
   */
  static async completeOnboarding(
    userId: string,
    data: {
      organizationName: string;
      organizationSlug: string;
      industrySlug: IndustrySlug;
    },
  ) {
    // 1. Crear organización
    const organization = await OrganizationService.createOrganization({
      name: data.organizationName,
      slug: data.organizationSlug,
      industry: data.industrySlug,
    });

    // 2. Añadir usuario como owner
    await OrganizationService.addUserToOrganization(
      userId,
      organization.id,
      'owner',
    );

    // 3. Marcar onboarding completado
    await db
      .update(users)
      .set({ hasCompletedOnboarding: true })
      .where(eq(users.id, userId));

    // 4. Generar datos demo según industria
    const demoData = await DemoDataService.generateForIndustry(
      organization.id,
      data.industrySlug,
    );

    return { organization, demoData };
  }

  /**
   * Verifica si el usuario ha completado onboarding
   */
  static async hasCompletedOnboarding(userId: string): Promise<boolean> {
    const [user] = await db
      .select({ hasCompletedOnboarding: users.hasCompletedOnboarding })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return user?.hasCompletedOnboarding ?? false;
  }
}
