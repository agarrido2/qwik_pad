/**
 * Tipos compartidos para los componentes de onboarding
 * 
 * PATRÓN: Interfaces de props extraídas aquí para evitar
 * dependencias circulares y mantener Single Source of Truth.
 */

/** Estructura del store reactivo del wizard (useStore en la ruta) */
export interface OnboardingFormData {
  // Paso 1: Identidad Corporativa
  fullName: string;
  organizationName: string;
  phone: string;
  // Paso 2: Reglas del Negocio
  industrySlug: string;
  businessDescription: string;
  // Paso 3: Su Asistente
  assistantGender: string;
  assistantName: string;
  assistantKindnessLevel: number;
  assistantFriendlinessLevel: number;
}

/** 
 * Errores de campo del routeAction (zod$ validation).
 * Cada campo puede tener un array de mensajes de error.
 */
export interface OnboardingFieldErrors {
  fullName?: string[];
  organizationName?: string[];
  phone?: string[];
  industrySlug?: string[];
  businessDescription?: string[];
  assistantGender?: string[];
  assistantName?: string[];
  assistantKindnessLevel?: string[];
  assistantFriendlinessLevel?: string[];
}
