
/**
 * Verification Schema
 * @description Schemas Zod para validación de códigos de verificación
 */

import { z } from 'zod';

/**
 * Schema para verificación de código
 * REGLA: Código debe ser exactamente 6 dígitos numéricos
 */
export const verificationSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  code: z
    .string()
    .length(6, 'El código debe tener 6 dígitos')
    .regex(/^\d{6}$/, 'El código debe ser numérico'),
});

export type VerificationInput = z.infer<typeof verificationSchema>;
