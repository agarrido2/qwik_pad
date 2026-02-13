/**
 * Onboarding Services
 * @description Lógica de negocio para el flujo de onboarding
 * 
 * IMPORTANTE: El schema actual de onboarding tiene 9 campos, pero agent_profiles tiene 15.
 * PENDIENTE: Decidir si ampliar el schema de onboarding o usar defaults.
 * 
 * MAPEO ACTUAL (OnboardingFormData → agent_profiles):
 * ✅ businessName → businessName
 * ❌ notificationEmail → FALTA (usar data.email como fallback?)
 * ❌ website → FALTA (nullable, puede ser NULL)
 * ❌ handoffPhone → FALTA (usar data.phone como fallback?)
 * ✅ industry → industry
 * ❌ agentPhone → FALTA (debe seleccionarse de assigned_numbers)
 * ✅ businessDescription → businessDescription
 * ❌ leadsEmail → FALTA (usar data.email como fallback?)
 * ❌ transferPolicy → FALTA (usar defaults por sector desde constants/sectors.ts)
 * ✅ assistantGender → assistantGender
 * ✅ assistantName → assistantName
 * ✅ friendlinessLevel → friendlinessLevel
 * ✅ warmthLevel → warmthLevel
 * 
 * ADICIONALMENTE:
 * - fullName y phone del form van a tabla users, no a agent_profiles
 */

import type { RequestEventBase } from '@builder.io/qwik-city';
import type { OnboardingFormData } from '../schemas/onboarding.schemas';
import { getDb } from '~/lib/db/client.server';
import { agentProfiles, users } from '~/lib/db/schema';
import { eq } from 'drizzle-orm';
import { TRANSFER_POLICY_DEFAULTS } from '../constants/sectors';

/**
 * Guarda el perfil de onboarding en agent_profiles
 * @param requestEvent - Request event de Qwik City
 * @param userId - ID del usuario autenticado
 * @param data - Datos del formulario de onboarding
 * @returns Éxito o error
 */
export async function saveOnboardingProfile(
  requestEvent: RequestEventBase,
  userId: string,
  data: OnboardingFormData
): Promise<{ success: boolean; error?: string }> {
  const db = getDb(requestEvent);

  try {
    // TODO: Obtener email del usuario desde la sesión o DB
    const userEmail = 'user@example.com'; // Placeholder
    
    // TODO: Seleccionar número disponible de assigned_numbers
    const agentPhone = '+34919930992'; // Placeholder
    
    // Obtener política de transferencia por defecto del sector
    const transferPolicy = TRANSFER_POLICY_DEFAULTS[data.industry];

    // 1. Insertar o actualizar agent_profiles
    await db
      .insert(agentProfiles)
      .values({
        userId,
        businessName: data.businessName,
        notificationEmail: userEmail, // Fallback
        website: null, // Opcional
        handoffPhone: data.phone, // Usar teléfono del form como handoff
        industry: data.industry,
        agentPhone, // TODO: Seleccionar número real
        businessDescription: data.businessDescription,
        leadsEmail: userEmail, // Fallback
        transferPolicy,
        assistantGender: data.assistantGender,
        assistantName: data.assistantName,
        friendlinessLevel: data.friendlinessLevel,
        warmthLevel: data.warmthLevel,
      })
      .onConflictDoUpdate({
        target: agentProfiles.userId,
        set: {
          businessName: data.businessName,
          handoffPhone: data.phone,
          industry: data.industry,
          businessDescription: data.businessDescription,
          assistantGender: data.assistantGender,
          assistantName: data.assistantName,
          friendlinessLevel: data.friendlinessLevel,
          warmthLevel: data.warmthLevel,
          updatedAt: new Date(),
        },
      });

    // 2. Actualizar users con fullName y marcar onboarding como completado
    await db
      .update(users)
      .set({
        fullName: data.fullName,
        phone: data.phone,
        onboardingCompleted: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    console.log(`[Onboarding] Perfil guardado para usuario ${userId}`);
    return { success: true };
  } catch (error) {
    console.error('[Onboarding] Error al guardar perfil:', error);
    return { success: false, error: 'DB_ERROR' };
  }
}

