import { Resend } from 'resend';
import { ENV, isDev } from '../env.server';

/**
 * Email Service - Envío de emails transaccionales con Resend
 */

const resend = new Resend(ENV.RESEND_API_KEY);

export class EmailService {
  /**
   * Envía email de verificación
   */
  static async sendVerificationEmail(to: string, verificationUrl: string) {
    if (isDev) {
      console.log('[DEV] Email verificación:', { to, verificationUrl });
      return { success: true };
    }

    const { data, error } = await resend.emails.send({
      from: 'Onucall <noreply@onucall.com>',
      to,
      subject: 'Verifica tu correo electrónico',
      html: `
        <h1>¡Bienvenido a Onucall!</h1>
        <p>Haz clic en el siguiente enlace para verificar tu correo:</p>
        <a href="${verificationUrl}">Verificar correo</a>
      `,
    });

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Envía email de bienvenida tras completar onboarding
   */
  static async sendWelcomeEmail(to: string, organizationName: string) {
    if (isDev) {
      console.log('[DEV] Email bienvenida:', { to, organizationName });
      return { success: true };
    }

    const { data, error } = await resend.emails.send({
      from: 'Onucall <noreply@onucall.com>',
      to,
      subject: `¡${organizationName} está listo en Onucall!`,
      html: `
        <h1>¡Felicidades!</h1>
        <p>Tu organización <strong>${organizationName}</strong> ha sido configurada exitosamente.</p>
        <p>Accede a tu dashboard para comenzar a crear tu agente de voz IA.</p>
      `,
    });

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Envía alerta de negocio (ej: créditos bajos, nueva llamada)
   */
  static async sendBusinessAlert(
    to: string,
    subject: string,
    message: string,
  ) {
    if (isDev) {
      console.log('[DEV] Alerta negocio:', { to, subject, message });
      return { success: true };
    }

    const { data, error } = await resend.emails.send({
      from: 'Onucall Alertas <alerts@onucall.com>',
      to,
      subject,
      html: `
        <h2>Alerta de Onucall</h2>
        <p>${message}</p>
      `,
    });

    if (error) throw new Error(error.message);
    return data;
  }
}
