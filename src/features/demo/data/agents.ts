/**
 * Demo Agents Configuration
 * @description Mapeo de sectores a IDs de agentes de Retell AI
 * IMPORTANTE: Las claves deben coincidir con el enum industry_sector de la BD
 * Valores válidos: 'concesionario', 'inmobiliaria', 'retail', 'alquiladora', 'sat'
 */

export const SECTOR_AGENTS = {
  concesionario: 'agent_79d33b92c7dd3e1b9f0e365afc', 
  inmobiliaria: 'agent_05d7edd31584c7345b5b99c47f',
  retail: 'agent_d47e0e39a47a785a348fe96bb5', // Antes: DISTRIBUCION
  alquiladora: 'agent_79d33b92c7dd3e1b9f0e365afc', // Reutilizar agente de concesionario
  sat: 'agent_d47e0e39a47a785a348fe96bb5', // Reutilizar agente de retail
} as const;

export type SectorType = keyof typeof SECTOR_AGENTS;

/**
 * Labels para mostrar en el selector de industria
 */
export const SECTOR_LABELS: Record<SectorType, string> = {
  concesionario: 'Concesionario de vehículos',
  inmobiliaria: 'Inmobiliaria',
  retail: 'Retail y distribución',
  alquiladora: 'Empresa alquiladora',
  sat: 'Servicio técnico (SAT)',
};