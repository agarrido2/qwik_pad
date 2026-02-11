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
   * 1. Actualiza el perfil del usuario (full_name)
   * 2. Crea la organización con todos los datos
   * 3. Añade al usuario como owner
   * 4. Marca onboarding como completado
   * 5. Genera datos demo según industria
   */
  static async completeOnboarding(
    userId: string,
    data: {
      // Paso 1: Identidad Corporativa
      fullName: string;
      organizationName: string;
      phone: string;
      // Paso 2: Reglas del Negocio
      industrySlug: IndustrySlug;
      businessDescription: string;
      // Paso 3: Su Asistente
      assistantGender: 'male' | 'female';
      assistantName: string;
      assistantKindnessLevel: number;
      assistantFriendlinessLevel: number;
    },
  ) {
    // 1. Actualizar perfil del usuario
    await db
      .update(users)
      .set({ fullName: data.fullName })
      .where(eq(users.id, userId));

    // 2. Generar slug único desde el nombre de la organización
    const slug = data.organizationName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // 3. Crear organización con todos los datos
    const organization = await OrganizationService.createOrganization({
      name: data.organizationName,
      slug,
      phone: data.phone,
      industry: data.industrySlug,
      businessDescription: data.businessDescription,
      assistantName: data.assistantName,
      assistantGender: data.assistantGender,
      assistantKindnessLevel: data.assistantKindnessLevel,
      assistantFriendlinessLevel: data.assistantFriendlinessLevel,
    });

    // 4. Añadir usuario como owner
    await OrganizationService.addUserToOrganization(
      userId,
      organization.id,
      'owner',
    );

    // 5. Marcar onboarding completado
    await db
      .update(users)
      .set({ onboardingCompleted: true })
      .where(eq(users.id, userId));

    // 6. Generar datos demo según industria
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
      .select({ onboardingCompleted: users.onboardingCompleted })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return user?.onboardingCompleted ?? false;
  }
}
