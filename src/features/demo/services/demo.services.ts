/**
 * Demo Service
 * @description Lógica de negocio para la feature de demo pública
 */

import { usersDemo } from '~/lib/db/client';
import { getDb } from '~/lib/db/client.server';
import { eq, and, gte, count, desc } from 'drizzle-orm';
import { triggerDemoCall } from '~/lib/retell';
import { SECTOR_AGENTS, type SectorType } from '../data/agents';
import type { DemoRequestInput, DemoServiceResult, VerifyCodeResult } from '../types/demo.types';
import type { RequestEventBase } from '@builder.io/qwik-city';
import { 
  generateVerificationCode, 
  sendVerificationEmail, 
  validateVerificationCode 
} from './verification.service';

/**
 * Límite máximo de llamadas por teléfono en un mes
 * TODO: Volver a poner a 2 después de las pruebas
 */
const MAX_CALLS_PER_MONTH = 200;

/**
 * Verifica si un teléfono ha excedido el límite de llamadas en el último mes
 * @param db - Cliente de base de datos
 * @param phone - Número de teléfono a verificar
 * @returns true si está bloqueado, false si puede hacer más llamadas
 */
export async function checkRateLimit(
  db: ReturnType<typeof getDb>,
  phone: string
): Promise<boolean> {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const result = await db
    .select({ count: count() })
    .from(usersDemo)
    .where(
      and(
        eq(usersDemo.phone, phone),
        gte(usersDemo.createdAt, oneMonthAgo)
      )
    );

  return (result[0]?.count ?? 0) >= MAX_CALLS_PER_MONTH;
}

/**
 * Solicita verificación de demo (Paso 1: Envía código por email)
 * @param requestEvent - Evento de request de Qwik City
 * @param data - Datos del formulario
 * @param ipAddress - IP del cliente
 * @returns Resultado con mensaje de éxito o error
 */
export async function requestDemoVerification(
  requestEvent: RequestEventBase,
  data: DemoRequestInput,
  ipAddress: string
): Promise<DemoServiceResult> {
  const db = getDb(requestEvent);

  try {
    // 1. Verificar rate limit
    const isBlocked = await checkRateLimit(db, data.phone);
    if (isBlocked) {
      return { success: false, error: 'RATE_LIMIT_EXCEEDED' };
    }

    // 2. Generar código de verificación
    const verificationCode = generateVerificationCode();

    // 3. Crear registro con status 'pending_verification'
    // NOTA: Guardamos el código de verificación en retellCallId temporalmente
    // Se sobrescribirá con el call_id real de Retell tras verificar
    const [demoRecord] = await db
      .insert(usersDemo)
      .values({
        name: data.name,
        email: data.email,
        phone: data.phone,
        industry: data.industry,
        ipAddress,
        status: 'pending_verification',
        verificationType: 'email_otp', // Método de verificación actual
        resourceOrigin: data.resourceOrigin || null, // UTM source
        utmCampaign: data.utmCampaign || null,       // UTM campaign
        utmMedium: data.utmMedium || null,           // UTM medium
        retellCallId: verificationCode, // Temporal: Se reemplazará tras verificación
        satisfaction: 0, // Default: Se actualizará post-llamada
      })
      .returning();

    // 4. Enviar email de verificación
    const emailResult = await sendVerificationEmail(
      requestEvent,
      data.email,
      data.name,
      verificationCode
    );

    if (!emailResult.success) {
      // Si falla el email, marcar registro pero devolver error
      await db
        .update(usersDemo)
        .set({ status: 'email_failed' })
        .where(eq(usersDemo.id, demoRecord.id));

      return { success: false, error: 'EMAIL_SEND_FAILED' };
    }

    console.log(
      `[Demo] ✅ Código enviado a ${data.email} - Demo ID: ${demoRecord.id}`
    );

    return {
      success: true,
      message: 'Te hemos enviado un código de verificación a tu email',
      demoId: demoRecord.id,
    };
  } catch (error) {
    console.error('[Demo] Error in requestDemoVerification:', error);
    
    // Proporcionar más contexto sobre el tipo de error
    if (error instanceof Error) {
      console.error('[Demo] Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack?.split('\n').slice(0, 3).join('\n')
      });
      
      // Detectar errores específicos de Supabase/PostgreSQL
      if (error.message.includes('Tenant or user not found')) {
        console.error(
          '[Demo] 🚨 DATABASE CONNECTION ERROR: '
          + 'Invalid DATABASE_URL credentials or Supabase project not found. '
          + 'Verify your .env file and Supabase project settings.'
        );
      }
    }
    
    return { success: false, error: 'DB_ERROR' };
  }
}

/**
 * Verifica código y dispara llamada (Paso 2: Valida código y llama)
 * @param requestEvent - Evento de request
 * @param email - Email del usuario
 * @param code - Código de 6 dígitos
 * @returns Resultado con callId si exitoso
 */
export async function verifyAndTriggerDemo(
  requestEvent: RequestEventBase,
  email: string,
  code: string
): Promise<VerifyCodeResult> {
  const db = getDb(requestEvent);

  try {
    // 1. Buscar registro de demo pendiente
    const [demoRecord] = await db
      .select()
      .from(usersDemo)
      .where(
        and(
          eq(usersDemo.email, email),
          eq(usersDemo.status, 'pending_verification')
        )
      )
      .orderBy(desc(usersDemo.createdAt))
      .limit(1);

    if (!demoRecord) {
      console.log(`[Demo] ❌ No se encontró demo pendiente para ${email}`);
      return { success: false, error: 'DEMO_NOT_FOUND' };
    }

    // 2. Validar código
    const storedCode = demoRecord.retellCallId || ''; // Código guardado temporalmente
    const isValid = validateVerificationCode(
      code,
      storedCode,
      demoRecord.createdAt
    );

    if (!isValid) {
      console.log(`[Demo] ❌ Código inválido o expirado para ${email}`);
      return { success: false, error: 'INVALID_CODE' };
    }

    // 3. Actualizar status a 'verified'
    await db
      .update(usersDemo)
      .set({
        status: 'verified',
        verifiedAt: new Date(),
      })
      .where(eq(usersDemo.id, demoRecord.id));

    console.log(`[Demo] ✅ Código verificado para ${email}`);

    // 4. Disparar llamada a Retell
    const agentId = SECTOR_AGENTS[demoRecord.industry as SectorType];

    let callResponse;
    try {
      callResponse = await triggerDemoCall(demoRecord.phone, agentId);
    } catch (retellError) {
      console.error('[Demo] Error calling Retell API:', retellError);
      // Actualizar registro con error
      await db
        .update(usersDemo)
        .set({
          retellCallId: 'ERROR',
          status: 'call_failed',
        })
        .where(eq(usersDemo.id, demoRecord.id));

      return { success: false, error: 'RETELL_ERROR' };
    }

    // 5. Actualizar con call_id real de Retell (reemplaza el código temporal)
    await db
      .update(usersDemo)
      .set({
        retellCallId: callResponse.call_id, // Sobrescribe el código temporal
        status: 'call_triggered',
      })
      .where(eq(usersDemo.id, demoRecord.id));

    console.log(
      `[Demo] ✅ Llamada disparada para ${email} - Call ID: ${callResponse.call_id}`
    );

    return {
      success: true,
      verified: true,
      callId: callResponse.call_id,
    };
  } catch (error) {
    console.error('[Demo] Error in verifyAndTriggerDemo:', error);
    return { success: false, error: 'DB_ERROR' };
  }
}

/**
 * Procesa una solicitud de demo completa
 * @param requestEvent - Evento de request de Qwik City (para acceder a env)
 * @param data - Datos del formulario (sin acceptTerms)
 * @param ipAddress - IP del cliente para auditoría
 * @returns Resultado de la operación
 * 
 * NOTA: Esta función mantiene el flujo original sin verificación
 * Para el nuevo flujo con verificación, usar requestDemoVerification + verifyAndTriggerDemo
 */
export async function processDemoRequest(
  requestEvent: RequestEventBase,
  data: DemoRequestInput,
  ipAddress: string
): Promise<DemoServiceResult> {
  const db = getDb(requestEvent);

  try {
    // 1. Verificar rate limit
    const isBlocked = await checkRateLimit(db, data.phone);
    if (isBlocked) {
      return { success: false, error: 'RATE_LIMIT_EXCEEDED' };
    }

    // 2. Crear registro inicial en la base de datos
    const [demoRecord] = await db
      .insert(usersDemo)
      .values({
        name: data.name,
        email: data.email,
        phone: data.phone,
        industry: data.industry,
        ipAddress,
      })
      .returning();

    // 3. Disparar llamada a Retell
    const agentId = SECTOR_AGENTS[data.industry as SectorType];
    
    let callResponse;
    try {
      callResponse = await triggerDemoCall(data.phone, agentId);
    } catch (retellError) {
      console.error('Error calling Retell API:', retellError);
      // Actualizar registro con error
      await db
        .update(usersDemo)
        .set({ retellCallId: 'ERROR' })
        .where(eq(usersDemo.id, demoRecord.id));
      
      return { success: false, error: 'RETELL_ERROR' };
    }

    // 4. Actualizar registro con el call_id de Retell
    await db
      .update(usersDemo)
      .set({ retellCallId: callResponse.call_id })
      .where(eq(usersDemo.id, demoRecord.id));

    return { success: true, callId: callResponse.call_id };
  } catch (error) {
    console.error('Error in processDemoRequest:', error);
    return { success: false, error: 'DB_ERROR' };
  }
}

/**
 * Actualiza datos de la llamada desde el webhook de Retell
 * @param requestEvent - Evento de request de Qwik City
 * @param callId - ID de la llamada en Retell
 * @param scoreSentiment - Análisis de sentimiento de la llamada
 * @param urlRecord - URL de la grabación de audio
 * @param retellPayload - Payload completo de Retell (opcional)
 * @returns true si se actualizó correctamente
 */
export async function updateDemoFromWebhook(
  requestEvent: RequestEventBase,
  callId: string,
  scoreSentiment: string | null,
  urlRecord: string | null,
  retellPayload?: unknown
): Promise<boolean> {
  const db = getDb(requestEvent);

  try {
    // Construir objeto de actualización con todos los datos disponibles
    const updateData: Record<string, unknown> = {};
    
    if (scoreSentiment !== null) {
      updateData.scoreSentiment = scoreSentiment;
      
      // Mapeo de sentiment a satisfaction (1-5):
      // Positive → 5, Neutral → 3, Negative → 1
      const sentimentMap: Record<string, number> = {
        positive: 5,
        neutral: 3,
        negative: 1,
      };
      updateData.satisfaction = sentimentMap[scoreSentiment.toLowerCase()] || 3;
    }
    
    if (urlRecord !== null) {
      updateData.urlRecord = urlRecord;
    }
    
    // Guardar payload completo de Retell en JSONB para análisis posterior
    if (retellPayload) {
      updateData.retellData = retellPayload;
    }
    
    // Marcar como completada si hay algún dato para actualizar
    if (Object.keys(updateData).length > 0) {
      updateData.status = 'completed'; // Status final del flujo
    } else {
      console.log(`[Demo] ℹ️ No hay datos para actualizar en call_id: ${callId}`);
      return true;
    }

    const result = await db
      .update(usersDemo)
      .set(updateData)
      .where(eq(usersDemo.retellCallId, callId))
      .returning();

    if (result.length === 0) {
      console.warn(`[Demo] No se encontró registro con call_id: ${callId}`);
      return false;
    }

    console.log(
      `[Demo] ✅ Actualizado registro con call_id: ${callId}`,
      { sentiment: scoreSentiment, hasAudio: !!urlRecord, hasFullPayload: !!retellPayload }
    );
    return true;
  } catch (error) {
    console.error('[Demo] Error in updateDemoFromWebhook:', error);
    return false;
  }
}

/**
 * Vincula una demo completada con una organización (conversión B2B)
 * @description Marca el users_demo como convertido cuando el usuario se registra
 * @param requestEvent - Evento de request de Qwik City
 * @param email - Email del usuario que hizo el demo
 * @param organizationId - ID de la organización creada
 * @returns true si se vinculó correctamente
 * 
 * @example
 * // En el signup service, después de crear la org:
 * await linkDemoToOrganization(requestEvent, user.email, newOrgId);
 */
export async function linkDemoToOrganization(
  requestEvent: RequestEventBase,
  email: string,
  organizationId: string
): Promise<boolean> {
  const db = getDb(requestEvent);

  try {
    // Buscar demo completada de este email (ordenar por más reciente)
    const result = await db
      .update(usersDemo)
      .set({ 
        convertedOrgId: organizationId,
        // status se mantiene 'completed' para preservar historial
      })
      .where(
        and(
          eq(usersDemo.email, email),
          eq(usersDemo.status, 'completed')
        )
      )
      .returning();

    if (result.length > 0) {
      console.log(
        `[Demo] ✅ Demo vinculada a org ${organizationId} para ${email}`
      );
      return true;
    }

    // No es error si no hay demo previa (signup directo sin probar)
    console.log(`[Demo] ℹ️ No hay demo previa para ${email}`);
    return true;
  } catch (error) {
    console.error('[Demo] Error in linkDemoToOrganization:', error);
    return false;
  }
}