/**
 * Industrias/Sectores de Onucall
 * @description Configuración de los 5 sectores verticales que Onucall atiende
 * 
 * NOTA: 'despacho' fue eliminado porque el espacio de problemas era demasiado amplio.
 * Cada sector tiene su objetivo principal y defaults específicos.
 */

import type { IndustrySector } from '~/lib/db/schema';

/**
 * Opciones de sector para el selector del onboarding
 * @description 5 sectores con objetivos claros y bien definidos
 */
export const SECTOR_OPTIONS: {
  value: IndustrySector;
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
];

/**
 * Defaults de política de transferencia por sector
 * @description Se usa si el usuario no completa el campo transfer_policy en el onboarding
 * Define cómo debe comportarse el agente cuando el cliente exige un humano
 */
export const TRANSFER_POLICY_DEFAULTS: Record<IndustrySector, string> = {
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
};