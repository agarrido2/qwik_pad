
/**
 * Retell AI Client
 * @description Cliente para integración con la API de Retell AI
 * 
 * Retell permite crear llamadas telefónicas con voces IA ultra-realistas.
 * Este módulo maneja la creación de llamadas con agentes personalizados.
 */

import Retell from 'retell-sdk';
import { ENV } from '../env.server';

/**
 * Cliente singleton de Retell (server-side only)
 * Configurado con API Key validada desde env.server.ts
 */
export const retellClient = new Retell({
  apiKey: ENV.RETELL_API_KEY,
});

/**
 * Dispara una llamada de demostración con un agente específico
 * 
 * @param toNumber - Número de teléfono destino (formato E.164, ej: +34612345678)
 * @param agentId - ID del agente de Retell configurado en el dashboard
 * @returns Respuesta de la llamada con call_id y status
 * @throws {Error} Si la llamada falla (número inválido, agente no existe, créditos agotados)
 * 
 * @example
 * ```ts
 * const call = await triggerDemoCall('+34612345678', 'agent_abc123');
 * console.log(call.call_id); // "call_xyz789"
 * ```
 */
export async function triggerDemoCall(toNumber: string, agentId: string) {
  try {
    // override_agent_id permite usar un agente diferente al configurado en el número
    const response = await retellClient.call.createPhoneCall({
      from_number: ENV.RETELL_FROM_NUMBER,
      to_number: toNumber,
      override_agent_id: agentId,
    });

    return response;
  } catch (error) {
    // Retell SDK lanza errores con información detallada
    console.error('❌ Error al crear llamada Retell:', error);
    
    // Re-lanzar con mensaje mejorado para debugging
    throw new Error(
      `Falló la llamada de Retell a ${toNumber}: ${error instanceof Error ? error.message : 'Error desconocido'}`
    );
  }
}
