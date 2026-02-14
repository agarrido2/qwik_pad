/**
 * Onboarding Feature - Internal Barrel Export
 * @description Exporta solo constantes internas de la feature
 * 
 * ⚠️ IMPORTANTE ARQUITECTURA:
 * - Este archivo NO es un facade público
 * - Solo organiza exports internos de features/onboarding/
 * - routes/ NO debe importar desde aquí
 * - routes/ debe importar desde lib/onboarding/ (facade oficial)
 */

// ═══════════════════════════════════════════════════════════════════
// 📚 CONSTANTES (Uso interno de la feature)
// ═══════════════════════════════════════════════════════════════════

export {
  SECTOR_OPTIONS,
  TRANSFER_POLICY_DEFAULTS,
} from './constants/sectors';