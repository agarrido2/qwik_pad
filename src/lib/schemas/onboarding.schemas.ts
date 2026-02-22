import { z } from 'zod';

// Paso 1: Identidad Corporativa
export const OnboardingStep1Schema = z.object({
  fullName: z
    .string()
    .min(5, 'El nombre es demasiado corto. Por favor, introduce tu nombre completo (mínimo 5 caracteres)')
    .max(50, 'El nombre es demasiado largo. Por favor, usa máximo 50 caracteres'),
  organizationName: z
    .string()
    .min(3, 'El nombre del negocio es demasiado corto. Por favor, introduce al menos 3 caracteres')
    .max(100, 'El nombre del negocio es demasiado largo. Por favor, usa máximo 100 caracteres'),
  phone: z
    .string()
    .min(7, 'El teléfono parece incompleto. Por favor, introduce un número válido')
    .regex(/^[0-9+\s()-]+$/, 'Formato de teléfono incorrecto. Solo se permiten números, +, espacios, ( ) y -'),
});

// Paso 2: Reglas del Negocio
export const OnboardingStep2Schema = z.object({
  sector: z
    .string()
    .trim()
    .min(2, 'Selecciona o escribe un sector'),
  businessDescription: z
    .string()
    .min(20, 'La descripción es demasiado corta. Escribe al menos 20 caracteres para que el asistente comprenda mejor tu negocio')
    .max(500, 'La descripción es demasiado larga. Por favor, resume en máximo 500 caracteres'),
});

// Paso 3: Su Asistente
export const OnboardingStep3Schema = z.object({
  assistantGender: z.enum(['male', 'female'], {
    errorMap: () => ({ message: 'Selecciona el género del asistente' })
  }),
  assistantName: z
    .string()
    .min(5, 'El nombre del asistente es demasiado corto. Por favor, introduce al menos 5 caracteres')
    .max(50, 'El nombre del asistente es demasiado largo. Por favor, usa máximo 50 caracteres'),
  assistantKindnessLevel: z
    .coerce.number() // Convierte string a number automáticamente
    .int()
    .min(1, 'El nivel de amabilidad debe estar entre 1 y 5')
    .max(5, 'El nivel de amabilidad debe estar entre 1 y 5'),
  assistantFriendlinessLevel: z
    .coerce.number() // Convierte string a number automáticamente
    .int()
    .min(1, 'El nivel de simpatía debe estar entre 1 y 5')
    .max(5, 'El nivel de simpatía debe estar entre 1 y 5'),
});

// Schema completo (todos los pasos en un solo submit)
export const OnboardingCompleteSchema = OnboardingStep1Schema
  .merge(OnboardingStep2Schema)
  .merge(OnboardingStep3Schema);

export type OnboardingStep1Input = z.infer<typeof OnboardingStep1Schema>;
export type OnboardingStep2Input = z.infer<typeof OnboardingStep2Schema>;
export type OnboardingStep3Input = z.infer<typeof OnboardingStep3Schema>;
export type OnboardingCompleteInput = z.infer<typeof OnboardingCompleteSchema>;

