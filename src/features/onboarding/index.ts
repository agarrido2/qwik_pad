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
  DEFAULT_SECTOR,
  SECTOR_METADATA,
  DEFAULT_TRANSFER_POLICY,
} from './constants/sectors';