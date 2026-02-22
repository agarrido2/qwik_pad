import { db } from '../db/client';
import { users, organizations, organizationMembers, voiceAgents } from '../db/schema';
import { eq } from 'drizzle-orm';
import { DemoDataService } from './demo-data.service';

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
  * 5. Genera datos demo según sector
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
      sector: string;
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
          sector: data.sector,
          businessDescription: data.businessDescription,
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

      // 4. Crear agente inicial por defecto para la organización.
      // Mantiene compatibilidad con el flujo de onboarding existente:
      // los datos del paso 3 ahora viven en voice_agents (no en organizations).
      await tx
        .insert(voiceAgents)
        .values({
          organizationId: organization.id,
          createdBy: userId,
          name: 'Agente Principal',
          assistantName: data.assistantName,
          assistantGender: data.assistantGender,
          sector: data.sector,
          friendlinessLevel: data.assistantFriendlinessLevel,
          warmthLevel: data.assistantKindnessLevel,
          businessDescription: data.businessDescription,
          isDefault: true,
          isActive: true,
        });

      // 5. Marcar onboarding completado
      await tx
        .update(users)
        .set({
          onboardingCompleted: true,
          role: 'active',
        })
        .where(eq(users.id, userId));

      return { organization };
    });

    // 5. Generar datos demo FUERA de transacción (no es crítico)
    const demoData = await DemoDataService.generateForSector(
      result.organization.id,
      data.sector,
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
