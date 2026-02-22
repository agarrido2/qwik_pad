/**
 * Industrias/Sectores de Onucall
 * @description Configuración de los 7 sectores verticales que Onucall atiende
 * 
 * ALINEADO CON: onboarding.schemas.ts, agents.ts, demo-data-templates.ts
 * Cada sector tiene su objetivo principal y defaults específicos.
 */

/**
 * Opciones de sector para el selector del onboarding
 * @description 7 sectores con objetivos claros y bien definidos
 */
export const SECTOR_OPTIONS: {
  value: string;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    value: 'concesionario',
    label: 'Concesionario de Vehículos',
    description: 'Filtro comercial 24/7, cualificación de leads y agendamiento de pruebas',
    icon: '🚗',
  },
  {
    value: 'inmobiliaria',
    label: 'Inmobiliaria',
    description: 'Primer contacto comercial, consulta de inventario y agendamiento de visitas',
    icon: '🏠',
  },
  {
    value: 'retail',
    label: 'Retail y Distribución',
    description: 'Atención de consultas sobre productos, stock y pedidos',
    icon: '🛒',
  },
  {
    value: 'alquiladora',
    label: 'Alquiladora de Maquinaria/Vehículos',
    description: 'Operador de reservas, disponibilidad de equipos y gestión de tickets',
    icon: '🏗️',
  },
  {
    value: 'sat',
    label: 'Servicios Técnicos (SAT)',
    description: 'Intake técnico, diagnósticos automáticos y agendamiento de visitas',
    icon: '🔧',
  },
  {
    value: 'despacho',
    label: 'Despacho Profesional',
    description: 'Recepción de consultas, agendamiento de citas y dirección de servicios',
    icon: '📋',
  },
  {
    value: 'clinica',
    label: 'Clínica / Centro Médico',
    description: 'Gestión de citas, información de servicios y atención al paciente',
    icon: '🏥',
  },
];

export type PredefinedSector = (typeof SECTOR_OPTIONS)[number]['value'];

/**
 * Defaults de política de transferencia por sector
 * @description Se usa si el usuario no completa el campo transfer_policy en el onboarding
 * Define cómo debe comportarse el agente cuando el cliente exige un humano
 */
export const TRANSFER_POLICY_DEFAULTS: Record<PredefinedSector, string> = {
  concesionario: 
    'Si el cliente insiste en hablar con un humano, transfiere la llamada al teléfono de respaldo.',
  
  inmobiliaria: 
    'Ante cualquier frustración del cliente, transfiere la llamada al agente inmobiliario de guardia.',
  
  retail: 
    'Si el cliente tiene un problema que no puedes resolver, transfiere a atención al cliente.',
  
  alquiladora: 
    'Para urgencias técnicas o clientes frustrados, transfiere inmediatamente al equipo técnico.',
  
  sat: 
    'Si el cliente tiene una incidencia crítica, transfiere la llamada al técnico de guardia.',

  despacho: 
    'Si el cliente necesita asesoría legal o contable específica, transfiere la llamada al profesional de guardia.',

  clinica: 
    'Si el paciente tiene una urgencia médica o necesita hablar con un profesional, transfiere inmediatamente.',
};