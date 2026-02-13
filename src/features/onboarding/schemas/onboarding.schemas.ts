/**
 * Onboarding Schema (Zod)
 * @description Validación del wizard de configuración inicial (8 campos en 3 pasos)
 */

import { z } from 'zod';

export const onboardingSchema = z.object({
  // PASO 1: Identidad
  fullName: z
    .string()
    .min(1, 'Nombre requerido')
    .max(50, 'Máximo 50 caracteres'),
  businessName: z
    .string()
    .min(1, 'Nombre comercial requerido')
    .max(100, 'Máximo 100 caracteres'),
  phone: z
    .string()
    .min(7, 'Teléfono inválido')
    .regex(/^[+]?[0-9\s-()]+$/, 'Formato de teléfono inválido'),

  // PASO 2: Reglas de negocio
  industry: z.enum(['concesionario', 'inmobiliaria', 'retail', 'alquiladora', 'sat'], {
    errorMap: () => ({ message: 'Sector inválido' }),
  }),
  businessDescription: z
    .string()
    .min(20, 'Mínimo 20 caracteres')
    .max(500, 'Máximo 500 caracteres'),

  // PASO 3: Su asistente
  assistantGender: z.enum(['male', 'female'], {
    errorMap: () => ({ message: 'Género inválido' }),
  }),
  assistantName: z
    .string()
    .min(1, 'Nombre del asistente requerido')
    .max(50, 'Máximo 50 caracteres'),
  friendlinessLevel: z.coerce
    .number()
    .min(1, 'Mínimo 1')
    .max(5, 'Máximo 5'),
  warmthLevel: z.coerce
    .number()
    .min(1, 'Mínimo 1')
    .max(5, 'Máximo 5'),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

// Sectores disponibles
export const SECTORS = [
  { value: 'concesionario', label: 'Concesionario' },
  { value: 'inmobiliaria', label: 'Inmobiliaria' },
  { value: 'retail', label: 'Retail' },
  { value: 'alquiladora', label: 'Alquiladora de vehículos' },
  { value: 'sat', label: 'SAT' },
] as const;

export const GENDERS = [
  { value: 'male', label: 'Masculina' },
  { value: 'female', label: 'Femenina' },
] as const;