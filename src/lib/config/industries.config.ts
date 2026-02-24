/**
 * Industries Config - Source of Truth del vertical activo
 *
 * Onucall Auto opera con un único vertical: concesionarios de vehículos.
 * Se mantiene este archivo para preservar API estable y facilitar
 * futuros spin-offs por vertical sin romper imports existentes.
 */

/**
 * Definición de un sector configurable del producto.
 *
 * `slug` se persiste en entidades de negocio como identificador estable.
 */
export interface SectorConfig {
  slug: string;
  name: string;
  icon: string;
  description?: string;
}

/**
 * Catálogo editable por producto.
 *
 * MVP: hardcoded por diseño para maximizar velocidad y simplicidad operativa.
 */
export const SECTORS: SectorConfig[] = [
  {
    slug: 'concesionario',
    name: 'Concesionario de Vehículos',
    icon: '🚗',
    description: 'Captación comercial, stock y pruebas de conducción',
  },
];

/**
 * Busca un sector por slug.
 */
export function getSectorBySlug(slug: string): SectorConfig | undefined {
  return SECTORS.find((sector) => sector.slug === slug);
}

/**
 * Devuelve opciones simples para UIs (select, radio, etc.).
 */
export function getSectorOptions(): Array<{
  value: string;
  label: string;
  icon: string;
}> {
  return SECTORS.map((sector) => ({
    value: sector.slug,
    label: sector.name,
    icon: sector.icon,
  }));
}

// Backward compatibility (MVP): aliases temporales durante la transición.
export type IndustryConfig = SectorConfig;
export const INDUSTRIES = SECTORS;
export const getIndustryBySlug = getSectorBySlug;
export const getIndustryOptions = getSectorOptions;
