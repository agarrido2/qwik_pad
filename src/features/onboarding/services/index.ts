
/**
 * Onboarding Feature - Barrel Export
 * @description Templates, constantes, schemas y servicios para onboarding
 */

// Constantes (sectors, phone-options)
export * from './constants';

// Schemas de validación
export { onboardingSchema, type OnboardingFormData } from './schemas/onboarding.schemas';

// Servicios de negocio
export { saveOnboardingProfile } from './services/onboarding.services';

// SECTORS export
export { SECTORS } from './schemas/onboarding.schemas';

// GENDERS export
export { GENDERS } from './schemas/onboarding.schemas';
