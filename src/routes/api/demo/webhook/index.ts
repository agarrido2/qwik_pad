/**
 * API Endpoint: Retell Webhook Handler
 * @description POST endpoint para recibir eventos de Retell AI post-llamada
 * 
 * RUTA: POST /api/demo/webhook
 * 
 * FLUJO:
 * 1. Valida firma del webhook (HMAC-SHA256)
 * 2. Recibe payload de Retell (call_id, sentiment, recording_url, etc.)
 * 3. Actualiza registro con datos de la llamada
 * 4. Calcula satisfaction score basado en sentiment
 * 5. Guarda grabación y metadata
 * 
 * SEGURIDAD:
 * - Valida firma HMAC-SHA256 si RETELL_WEBHOOK_SECRET está configurado
 * - Si no está configurado, logea warning en dev (degradación gradual)
 * - Verifica que call_id exista en BD
 * 
 * ARQUITECTURA:
 * - Orquesta → updateDemoFromWebhook (features/demo)
 * - No contiene lógica de negocio
 */

import { type RequestHandler } from '@builder.io/qwik-city';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { updateDemoFromWebhook } from '~/features/demo';

/**
 * Valida la firma HMAC-SHA256 del webhook de Retell
 * @param signature - Header x-retell-signature
 * @param body - Body raw del request
 * @param secret - RETELL_WEBHOOK_SECRET
 * @returns true si la firma es válida
 * 
 * SEGURIDAD: Usa timingSafeEqual para prevenir timing attacks
 */
function validateWebhookSignature(
  signature: string | null,
  body: string,
  secret: string
): boolean {
  if (!signature) return false;

  try {
    const hmac = createHmac('sha256', secret);
    hmac.update(body);
    const expectedSignature = hmac.digest('hex');
    
    return timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

/**
 * Interfaz del payload de Retell (simplificada)
 * @description Basada en la documentación de Retell AI webhooks
 */
interface RetellWebhookPayload {
  call_id: string;
  call_type?: string;
  call_status?: string;
  agent_id?: string;
  start_timestamp?: number;
  end_timestamp?: number;
  transcript?: string;
  recording_url?: string;
  public_log_url?: string;
  call_analysis?: {
    call_summary?: string;
    user_sentiment?: 'Positive' | 'Negative' | 'Neutral' | 'Unknown';
    in_voicemail?: boolean;
  };
  // ... más campos según documentación Retell
  [key: string]: unknown;
}

/**
 * POST /api/demo/webhook
 * @description Webhook de Retell para actualizar datos post-llamada
 */
export const onPost: RequestHandler = async (requestEvent) => {
  const { json, request } = requestEvent;

  try {
    // 0. Leer body raw para validar firma ANTES de parsear JSON
    const rawBody = await request.text();

    // 1. Validar firma si RETELL_WEBHOOK_SECRET está configurado
    const webhookSecret = process.env.RETELL_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = requestEvent.headers.get('x-retell-signature');
      if (!validateWebhookSignature(signature, rawBody, webhookSecret)) {
        console.error('[Retell Webhook] Invalid signature - request rejected');
        json(401, { success: false, error: 'INVALID_SIGNATURE' });
        return;
      }
    } else if (import.meta.env.DEV) {
      console.warn('[Retell Webhook] ⚠️ RETELL_WEBHOOK_SECRET no configurado - firma no validada');
    }

    // 2. Parsear payload de Retell
    const payload: RetellWebhookPayload = JSON.parse(rawBody);

    if (import.meta.env.DEV) {
      console.log('[Retell Webhook] Payload recibido:', {
        call_id: payload.call_id,
        status: payload.call_status,
        sentiment: payload.call_analysis?.user_sentiment,
      });
    }

    // 3. Validar que existe call_id
    if (!payload.call_id) {
      console.error('[Retell Webhook] Missing call_id in payload');
      json(400, {
        success: false,
        error: 'MISSING_CALL_ID',
        message: 'call_id is required',
      });
      return;
    }

    // 3. Extraer datos relevantes del payload
    const scoreSentiment = payload.call_analysis?.user_sentiment || null;
    const urlRecord = payload.recording_url || null;

    // 4. Actualizar demo en BD
    const success = await updateDemoFromWebhook(
      requestEvent,
      payload.call_id,
      scoreSentiment,
      urlRecord,
      payload // Payload completo para JSONB
    );

    if (!success) {
      console.warn('[Retell Webhook] No se encontró demo con call_id:', payload.call_id);
      // No retornar error 404 para evitar reintentos de Retell
      // Retornar 200 pero loggeamos internamente
      json(200, {
        success: false,
        message: 'Demo not found, but acknowledged',
      });
      return;
    }

    // 5. Éxito
    if (import.meta.env.DEV) {
      console.log('[Retell Webhook] ✅ Demo actualizada:', payload.call_id);
    }

    json(200, {
      success: true,
      message: 'Webhook processed successfully',
    });
  } catch (error) {
    console.error('[Retell Webhook] Error procesando webhook:', error);
    
    // Retornar 200 para evitar reintentos innecesarios de Retell
    // Pero loggear el error internamente
    json(200, {
      success: false,
      error: 'PROCESSING_ERROR',
      message: 'Error processing webhook, but acknowledged',
    });
  }
};
