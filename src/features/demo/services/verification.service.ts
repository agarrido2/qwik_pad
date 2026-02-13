
/**
 * Verification Service
 * @description Servicio para verificación de email en demos con Resend
 * 
 * IMPORTANTE: Asume que RESEND_API_KEY está configurada en .env
 * Patrón: Código de 6 dígitos generado manualmente (no OTP de Supabase)
 * Razón: Mayor control sobre template y UX del email
 */

import { Resend } from 'resend';
import type { RequestEventBase } from '@builder.io/qwik-city';

/**
 * Inicializa cliente de Resend
 * NOTA: La API key debe estar en process.env.RESEND_API_KEY
 */
function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      'RESEND_API_KEY no configurada. Añádela a .env: RESEND_API_KEY=re_...'
    );
  }
  
  return new Resend(apiKey);
}

/**
 * Genera código de verificación de 6 dígitos
 * @returns Código numérico (ej: "123456")
 */
export function generateVerificationCode(): string {
  // Generar número entre 100000 y 999999
  const code = Math.floor(100000 + Math.random() * 900000);
  return code.toString();
}

/**
 * Envía email de verificación con código
 * @param requestEvent - Request event (no usado actualmente, para futuras mejoras)
 * @param email - Email destino
 * @param name - Nombre del usuario
 * @param code - Código de 6 dígitos
 * @returns Resultado del envío
 */
export async function sendVerificationEmail(
  requestEvent: RequestEventBase,
  email: string,
  name: string,
  code: string
): Promise<{ success: boolean; error?: string; emailId?: string }> {
  try {
    const resend = getResendClient();
    
    // Usar RESEND_FROM de .env o fallback a dominio de desarrollo de Resend
    const fromAddress = process.env.RESEND_FROM || 'Onucall Demo <onboarding@resend.dev>';
    
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [email],
      subject: '🔐 Tu código de verificación - Onucall',
      html: getVerificationEmailTemplate(name, code),
    });

    if (error) {
      console.error('[Verification] Error enviando email:', error);
      return { success: false, error: 'EMAIL_SEND_FAILED' };
    }

    console.log(`[Verification] ✅ Email enviado a ${email} - ID: ${data?.id}`);
    return { success: true, emailId: data?.id };
  } catch (err) {
    console.error('[Verification] Error fatal enviando email:', err);
    return { success: false, error: 'EMAIL_SEND_FAILED' };
  }
}

/**
 * Template HTML del email de verificación
 * @param name - Nombre del usuario
 * @param code - Código de 6 dígitos
 * @returns HTML del email
 * 
 * DISEÑO: Estilo profesional, responsive, con código destacado
 * Inspirado en QUALITY_STANDARDS.md y TAILWIND_QWIK_GUIDE.md
 */
function getVerificationEmailTemplate(name: string, code: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Código de Verificación</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; line-height: 1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
    
    <!-- Header con gradiente azul -->
    <tr>
      <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 48px 32px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
          🔐 Verificación de Demo
        </h1>
      </td>
    </tr>
    
    <!-- Body -->
    <tr>
      <td style="padding: 48px 32px;">
        <p style="color: #374151; font-size: 16px; line-height: 1.7; margin: 0 0 24px;">
          Hola <strong style="color: #1f2937;">${name}</strong>,
        </p>
        <p style="color: #374151; font-size: 16px; line-height: 1.7; margin: 0 0 32px;">
          Gracias por solicitar una demo de <strong style="color: #2563eb;">Onucall</strong>. Para continuar y recibir tu llamada de demostración, introduce el siguiente código de verificación:
        </p>
        
        <!-- Código destacado -->
        <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 3px dashed #2563eb; border-radius: 12px; padding: 32px 24px; text-align: center; margin: 0 0 32px;">
          <div style="font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #1e40af; font-family: 'Courier New', Consolas, monospace; user-select: all;">
            ${code}
          </div>
        </div>
        
        <!-- Información adicional -->
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 6px; margin: 0 0 24px;">
          <p style="color: #92400e; font-size: 14px; line-height: 1.6; margin: 0;">
            <strong>⏱️ Este código expira en 10 minutos</strong>
          </p>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
          🔒 Si no solicitaste esta demo, puedes ignorar este mensaje de forma segura.
        </p>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="background-color: #f9fafb; padding: 32px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="color: #9ca3af; font-size: 13px; margin: 0 0 8px;">
          © 2025 <strong style="color: #6b7280;">Onucall</strong>
        </p>
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          Llamadas inteligentes potenciadas por IA
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Valida código de verificación
 * @param code - Código a validar
 * @param storedCode - Código almacenado en DB
 * @param createdAt - Timestamp de creación del código
 * @returns true si es válido, false si no
 * 
 * VALIDACIÓN:
 * - Código coincide exactamente
 * - No ha expirado (10 minutos)
 */
export function validateVerificationCode(
  code: string,
  storedCode: string,
  createdAt: Date
): boolean {
  // Validar coincidencia
  if (code !== storedCode) {
    return false;
  }
  
  // Validar expiración (10 minutos = 600000 ms)
  const now = new Date();
  const elapsed = now.getTime() - createdAt.getTime();
  const TEN_MINUTES_MS = 10 * 60 * 1000;
  
  if (elapsed > TEN_MINUTES_MS) {
    console.log('[Verification] ⚠️ Código expirado');
    return false;
  }
  
  return true;
}
