/**
 * Template demo de Onucall Auto (vertical concesionarios)
 * Se usa durante onboarding para poblar un contexto inicial sin costos de API.
 */

export const CONCESIONARIO_DEMO_TEMPLATE = {
  promptBase:
    'Eres un asistente virtual de un concesionario de automóviles en España. Ayudas a clientes con stock de vehículos nuevos/ocasión, financiación y agendamiento de pruebas de conducción.',
  sampleCalls: [
    { client: 'Juan Pérez', duration: 183, outcome: 'Cita agendada para prueba de conducción' },
    { client: 'María González', duration: 245, outcome: 'Información de financiación enviada' },
    { client: 'Carlos López', duration: 156, outcome: 'Consulta sobre vehículo de ocasión resuelta' },
  ],
  knowledgeBase: [
    'Catálogo de vehículos nuevos 2026',
    'Stock actualizado de vehículos de ocasión',
    'Planes de financiación vigentes',
    'Proceso de prueba de conducción y documentación requerida',
  ],
} as const;
