/**
 * Demo Feature Types
 * @description Definiciones de tipos para la feature de demo público
 */

import type { DemoFormInput } from '../schemas/demo.schema';

/**
 * Input para solicitud de demo (viene del formulario + UTM params)
 * Extiende DemoFormInput desde el schema Zod
 */
export type DemoRequestInput = DemoFormInput;

/**
 * Resultado del servicio requestDemoVerification (Step 1)
 */
export interface DemoServiceResult {
  success: boolean;
  error?: DemoServiceError;
  message?: string;
  demoId?: string;
  callId?: string; // Para processDemoRequest que dispara llamada directamente
}

/**
 * Resultado de verificación de código (Step 2)
 */
export interface VerifyCodeResult {
  success: boolean;
  verified?: boolean;
  callId?: string;
  error?: string;
}

/**
 * Códigos de error del servicio de demo
 */
export type DemoServiceError =
  | 'RATE_LIMIT_EXCEEDED'  // Demasiadas llamadas desde este teléfono
  | 'IP_BLOCKED'           // IP bloqueada por exceder límite de intentos
  | 'DB_ERROR'             // Error de base de datos
  | 'EMAIL_ERROR'          // Error al enviar email
  | 'EMAIL_SEND_FAILED'    // Fallo específico al enviar email de verificación
  | 'DEMO_NOT_FOUND'       // No existe registro de demo
  | 'INVALID_CODE'         // Código incorrecto o expirado
  | 'RETELL_ERROR';        // Error en la API de Retell

/**
 * Resultado de una action (para routeAction$ response)
 */
export interface DemoActionResult {
  success: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * Payload del webhook de Retell (post-llamada)
 * @description Datos que Retell envía después de completar una llamada
 */
export interface RetellWebhookPayload {
  call_id: string;
  agent_id: string;
  call_type: 'web_call' | 'phone_call';
  start_timestamp: number;
  end_timestamp: number;
  transcript: string;
  recording_url?: string;
  public_log_url?: string;
  call_analysis?: {
    call_summary?: string;
    in_voicemail?: boolean;
    user_sentiment?: 'Negative' | 'Positive' | 'Neutral' | 'Unknown';
    call_successful?: boolean;
  };
  disconnection_reason?: string;
  latency_p50?: number;
  latency_p90?: number;
  latency_p95?: number;
  latency_p99?: number;
  latency_max?: number;
  latency_min?: number;
  interruption_count?: number;
}
