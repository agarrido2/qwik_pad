/**
 * Sector de Onucall Auto
 * @description Configuración hardcoded para Concesionarios de Vehículos.
 *
 * Onucall Auto es un SaaS vertical exclusivo para concesionarios.
 * El sector ya no es seleccionable por el usuario en el onboarding.
 */

/**
 * Sector único de la aplicación (hardcoded)
 */
export const DEFAULT_SECTOR = 'concesionario' as const;

export type SectorType = typeof DEFAULT_SECTOR;

/**
 * Metadata del sector para UI y contexto del agente
 */
export const SECTOR_METADATA = {
  value: DEFAULT_SECTOR,
  label: 'Concesionario de Vehículos',
  description: 'Filtro comercial 24/7, cualificación de leads y agendamiento de pruebas de conducción',
  icon: '🚗',
} as const;

/**
 * Política de transferencia por defecto para concesionarios
 */
export const DEFAULT_TRANSFER_POLICY =
  'Si el cliente insiste en hablar con un humano o tiene una consulta técnica compleja sobre financiación, transfiere la llamada al comercial de guardia.';