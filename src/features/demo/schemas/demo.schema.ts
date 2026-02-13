
/**
 * Demo Form Validation Schema
 * @description Schema Zod para validación del formulario de demo
 */

import { z } from 'zod';

/**
 * Regex para validar teléfono internacional (formato E.164)
 * Acepta: +34612345678, +1234567890, etc.
 */
const phoneRegex = /^\+?[1-9]\d{8,14}$/;

/**
 * Schema de validación para el formulario de demo
 * @description Valida datos del formulario + tracking UTM opcional
 */
export const demoFormSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Ingresa un email válido'),
  phone: z
    .string()
    .min(1, 'El teléfono es requerido')
    .regex(phoneRegex, 'Ingresa un número válido (ej: +34612345678)'),
  industry: z.enum(['concesionario', 'inmobiliaria', 'retail', 'alquiladora', 'sat'], {
    errorMap: () => ({ message: 'Selecciona una industria' }),
  }),
  // Coerce string 'true' (HTML checkbox) a boolean true
  acceptTerms: z.preprocess(
    (val) => val === 'true' || val === true,
    z.literal(true, {
      errorMap: () => ({ message: 'Debes aceptar los términos y condiciones' }),
    })
  ),
  
  // Marketing Intelligence (opcional, capturado desde URL params)
  resourceOrigin: z.string().optional(),  // UTM source
  utmCampaign: z.string().optional(),     // UTM campaign
  utmMedium: z.string().optional(),       // UTM medium
});

/**
 * Tipo inferido del schema del formulario
 */
export type DemoFormInput = z.infer<typeof demoFormSchema>;
