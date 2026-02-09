import { z } from 'zod';

// Paso 1: Nombre de la organización
export const OnboardingStep1Schema = z.object({
  organizationName: z.string().min(2, 'Mínimo 2 caracteres'),
  organizationSlug: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
});

// Paso 2: Selección de industria
export const OnboardingStep2Schema = z.object({
  industrySlug: z.enum([
    'concesionario',
    'inmobiliaria',
    'alquiladora',
    'despacho',
    'retail',
    'sat',
    'clinica',
  ]),
});

// Paso 3: Confirmación
export const OnboardingStep3Schema = z.object({
  confirmed: z.boolean().refine((val) => val === true, {
    message: 'Debes confirmar para continuar',
  }),
});

export type OnboardingStep1Input = z.infer<typeof OnboardingStep1Schema>;
export type OnboardingStep2Input = z.infer<typeof OnboardingStep2Schema>;
export type OnboardingStep3Input = z.infer<typeof OnboardingStep3Schema>;
