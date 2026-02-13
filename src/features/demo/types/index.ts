/**
 * Demo Feature Module - Barrel Export
 * @description Punto de entrada único para la feature de demo pública
 * 
 * IMPORTANTE: Este archivo solo exporta código seguro para el cliente.
 * Los servicios de servidor se importan directamente donde se necesitan.
 */

// Components (safe for client)
export { DemoWidget } from '../components/DemoWidget';
export { VerificationModal } from '../components/VerificationModal';

// Data (safe for client)
export { SECTOR_AGENTS, SECTOR_LABELS, type SectorType } from '../data/agents';

// Schemas (safe for client)
export { demoFormSchema, type DemoFormInput } from '../schemas/demo.schema';

// Types (safe for client)
export type {
  DemoRequestInput,
  DemoActionResult,
  DemoServiceError,
  DemoServiceResult,
  RetellWebhookPayload,
} from './demo.types';

// ⚠️ NOTA: Los servicios de servidor (checkRateLimit, processDemoRequest)
// deben importarse directamente desde './services/demo.service' en routeAction$