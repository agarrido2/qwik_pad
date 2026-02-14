import { db } from '../db/client';
import { users, organizations, organizationMembers } from '../db/schema';
import { eq } from 'drizzle-orm';
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
   * 
   * OPTIMIZACIÓN: Transacción atómica (todo o nada)
   * Referencia: docs/standards/DB_QUERY_OPTIMIZATION.md § 2.3
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
    // Generar slug antes de la transacción (no requiere DB)
    const slug = data.organizationName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Envolver todas las queries en transacción atómica
    const result = await db.transaction(async (tx) => {
      // 1. Actualizar perfil del usuario
      await tx
        .update(users)
        .set({ fullName: data.fullName })
        .where(eq(users.id, userId));

      // 2. Crear organización
      const [organization] = await tx
        .insert(organizations)
        .values({
          name: data.organizationName,
          slug,
          phone: data.phone,
          industry: data.industrySlug,
          businessDescription: data.businessDescription,
          assistantName: data.assistantName,
          assistantGender: data.assistantGender,
          assistantKindnessLevel: data.assistantKindnessLevel,
          assistantFriendlinessLevel: data.assistantFriendlinessLevel,
          subscriptionTier: 'free',
          subscriptionStatus: 'active',
        })
        .returning();

      // 3. Añadir usuario como owner
      await tx
        .insert(organizationMembers)
        .values({
          userId,
          organizationId: organization.id,
          role: 'owner',
        });

      // 4. Marcar onboarding completado
      await tx
        .update(users)
        .set({ onboardingCompleted: true })
        .where(eq(users.id, userId));

      return { organization };
    });

    // 5. Generar datos demo FUERA de transacción (no es crítico)
    const demoData = await DemoDataService.generateForIndustry(
      result.organization.id,
      data.industrySlug,
    );

    return { organization: result.organization, demoData };
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
