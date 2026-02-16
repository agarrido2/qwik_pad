/**
 * Industries Config - Source of Truth para catálogo de sectores
 *
 * Principio "Config as Code":
 * - Sectores/industrias son decisión de producto (owner), no datos operativos.
 * - Se almacenan como configuración tipada en código, no en base de datos.
 * - Añadir/modificar sectores aquí no requiere migraciones.
 */

/**
 * Definición de un sector configurable del producto.
 *
 * `slug` se persiste en entidades de negocio como identificador estable.
 */
export interface IndustryConfig {
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
export const INDUSTRIES: IndustryConfig[] = [
  {
    slug: 'concesionario',
    name: 'Concesionario de Vehículos',
    icon: '🚗',
    description: 'Venta y gestión comercial de vehículos',
  },
  {
    slug: 'inmobiliaria',
    name: 'Inmobiliaria',
    icon: '🏠',
    description: 'Captación, visitas y cierre de operaciones inmobiliarias',
  },
  {
    slug: 'retail',
    name: 'Retail y Distribución',
    icon: '🛒',
    description: 'Atención comercial, pedidos y operaciones omnicanal',
  },
  {
    slug: 'alquiladora',
    name: 'Empresa Alquiladora',
    icon: '🔑',
    description: 'Reservas, disponibilidad y coordinación de entregas',
  },
  {
    slug: 'sat',
    name: 'Servicio Técnico (SAT)',
    icon: '🔧',
    description: 'Incidencias, soporte y planificación de técnicos',
  },
  {
    slug: 'despacho',
    name: 'Despacho Profesional',
    icon: '⚖️',
    description: 'Gestión de clientes y servicios profesionales',
  },
  {
    slug: 'clinica',
    name: 'Clínica / Centro Médico',
    icon: '🏥',
    description: 'Pacientes, agenda y coordinación asistencial',
  },
];

/**
 * Busca un sector por slug.
 */
export function getIndustryBySlug(slug: string): IndustryConfig | undefined {
  return INDUSTRIES.find((industry) => industry.slug === slug);
}

/**
 * Devuelve opciones simples para UIs (select, radio, etc.).
 */
export function getIndustryOptions(): Array<{
  value: string;
  label: string;
  icon: string;
}> {
  return INDUSTRIES.map((industry) => ({
    value: industry.slug,
    label: industry.name,
    icon: industry.icon,
  }));
}
