/**
 * Demo Feature - Barrel Export
 * @description Exports públicos de la feature de demo
 * 
 * ARQUITECTURA:
 * - Este archivo organiza exports internos de features/demo/
 * - Para uso desde routes, considerar crear lib/demo/index.ts (facade)
 */

// ═══════════════════════════════════════════════════════════════════
// 🔧 SERVICIOS DE NEGOCIO
// ═══════════════════════════════════════════════════════════════════

export {
  requestDemoVerification,
  verifyAndTriggerDemo,
  // processDemoRequest eliminado: flujo legacy sin OTP (bypass de verificación)
  updateDemoFromWebhook,
  linkDemoToOrganization,
} from './services/demo.services';

export {
  generateVerificationCode,
  sendVerificationEmail,
  validateVerificationCode,
} from './services/verification.service';

// ═══════════════════════════════════════════════════════════════════
// 📊 SCHEMAS (Zod)
// ═══════════════════════════════════════════════════════════════════

export {
  demoFormSchema,
  type DemoFormInput,
} from './schemas/demo.schema';

export {
  verificationSchema,
  type VerificationInput,
} from './schemas/verification.schema';

// ═══════════════════════════════════════════════════════════════════
// 📚 TIPOS
// ═══════════════════════════════════════════════════════════════════

export type {
  DemoRequestInput,
  DemoServiceResult,
  VerifyCodeResult,
  DemoServiceError,
  DemoActionResult,
} from './types/demo.types';

// ═══════════════════════════════════════════════════════════════════
// 📦 DATA (Agentes por sector)
// ═══════════════════════════════════════════════════════════════════

export { SECTOR_AGENTS, type SectorType } from './data/agents';

// ═══════════════════════════════════════════════════════════════════
// 🧩 COMPONENTES
// ═══════════════════════════════════════════════════════════════════

export { DemoWidget } from './components/DemoWidget';
export { VerificationModal } from './components/VerificationModal';
