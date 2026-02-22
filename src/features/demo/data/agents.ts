/**
 * Demo Agents Configuration
 * @description Mapeo de sectores a IDs de agentes de Retell AI
 * IMPORTANTE: Las claves representan sectores sugeridos del producto.
 * Alineado con: schema.ts, onboarding.schemas.ts, demo-data-templates.ts
 */

export const SECTOR_AGENTS = {
  concesionario: 'agent_79d33b92c7dd3e1b9f0e365afc', 
  inmobiliaria: 'agent_05d7edd31584c7345b5b99c47f',
  retail: 'agent_d47e0e39a47a785a348fe96bb5',
  alquiladora: 'agent_79d33b92c7dd3e1b9f0e365afc', // Reutiliza agente concesionario
  sat: 'agent_d47e0e39a47a785a348fe96bb5',           // Reutiliza agente retail
  despacho: 'agent_05d7edd31584c7345b5b99c47f',      // Reutiliza agente inmobiliaria
  clinica: 'agent_d47e0e39a47a785a348fe96bb5',       // Reutiliza agente retail/sat
} as const;

export type SectorType = keyof typeof SECTOR_AGENTS;

export const DEFAULT_SECTOR_AGENT_ID = SECTOR_AGENTS.retail;

/**
 * Resuelve el agentId para un sector, incluyendo fallback para sectores personalizados.
 */
export function resolveSectorAgentId(sector: string): string {
  return SECTOR_AGENTS[sector as SectorType] ?? DEFAULT_SECTOR_AGENT_ID;
}

/**
 * Labels para mostrar en el selector de sectores sugeridos
 */
export const SECTOR_LABELS: Record<SectorType, string> = {
  concesionario: 'Concesionario de vehículos',
  inmobiliaria: 'Inmobiliaria',
  retail: 'Retail y distribución',
  alquiladora: 'Empresa alquiladora',
  sat: 'Servicio técnico (SAT)',
  despacho: 'Despacho profesional',
  clinica: 'Clínica / Centro médico',
};