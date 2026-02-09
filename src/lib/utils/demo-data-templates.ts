/**
 * Templates de datos demo por industria
 * Se usan durante el onboarding para poblar la cuenta del usuario
 */

export const DEMO_DATA_BY_INDUSTRY = {
  concesionario: {
    promptBase: 'Eres un asistente virtual de un concesionario de automóviles. Ayudas a los clientes con información sobre vehículos, financiamiento y agendamiento de pruebas de manejo.',
    sampleCalls: [
      { client: 'Juan Pérez', duration: 183, outcome: 'Cita agendada para prueba de manejo' },
      { client: 'María González', duration: 245, outcome: 'Información de financiamiento enviada' },
      { client: 'Carlos López', duration: 156, outcome: 'Consulta sobre vehículo específico' },
    ],
    knowledgeBase: [
      'Catálogo de vehículos nuevos 2026',
      'Planes de financiamiento vigentes',
      'Proceso de prueba de manejo',
      'Garantías y servicios post-venta',
    ],
  },
  inmobiliaria: {
    promptBase: 'Eres un asistente virtual de una inmobiliaria. Ayudas con información sobre propiedades, agendas visitas y respondes preguntas sobre el proceso de compra/renta.',
    sampleCalls: [
      { client: 'Ana Martínez', duration: 198, outcome: 'Visita agendada para departamento' },
      { client: 'Roberto Silva', duration: 267, outcome: 'Información de proceso de compra' },
      { client: 'Laura Ramírez', duration: 142, outcome: 'Consulta sobre rentas disponibles' },
    ],
    knowledgeBase: [
      'Catálogo de propiedades disponibles',
      'Proceso de compra-venta',
      'Requisitos para crédito hipotecario',
      'Zonas y precios por m²',
    ],
  },
  alquiladora: {
    promptBase: 'Eres un asistente virtual de una empresa de alquiler de vehículos. Ayudas con reservas, información de tarifas y políticas de renta.',
    sampleCalls: [
      { client: 'Pedro Sánchez', duration: 176, outcome: 'Reserva confirmada para fin de semana' },
      { client: 'Diana Torres', duration: 203, outcome: 'Información de seguros y coberturas' },
      { client: 'Miguel Ángel', duration: 134, outcome: 'Consulta sobre renta a largo plazo' },
    ],
    knowledgeBase: [
      'Flota de vehículos disponibles',
      'Tarifas por día/semana/mes',
      'Seguros y coberturas',
      'Políticas de combustible y kilometraje',
    ],
  },
  despacho: {
    promptBase: 'Eres un asistente virtual de un despacho profesional (legal/contable). Ayudas a agendar citas, dar información general de servicios y direccionar consultas.',
    sampleCalls: [
      { client: 'Empresa ABC SA', duration: 221, outcome: 'Cita agendada con contador' },
      { client: 'José Hernández', duration: 189, outcome: 'Información sobre servicios fiscales' },
      { client: 'Sofía Méndez', duration: 167, outcome: 'Consulta sobre asesoría legal' },
    ],
    knowledgeBase: [
      'Servicios ofrecidos (fiscal, legal, contable)',
      'Honorarios y formas de pago',
      'Horarios de atención',
      'Documentación requerida por servicio',
    ],
  },
  retail: {
    promptBase: 'Eres un asistente virtual de una tienda retail. Ayudas con información de productos, horarios, ubicaciones y promociones vigentes.',
    sampleCalls: [
      { client: 'Cliente anónimo', duration: 145, outcome: 'Información de promoción vigente' },
      { client: 'Cliente anónimo', duration: 178, outcome: 'Horarios de sucursales consultados' },
      { client: 'Cliente anónimo', duration: 123, outcome: 'Disponibilidad de producto verificada' },
    ],
    knowledgeBase: [
      'Catálogo de productos y precios',
      'Promociones y descuentos vigentes',
      'Horarios y ubicaciones de tiendas',
      'Políticas de devolución y garantías',
    ],
  },
  sat: {
    promptBase: 'Eres un asistente virtual para soporte técnico. Ayudas a crear tickets, dar seguimiento a casos y proporcionar soluciones a problemas comunes.',
    sampleCalls: [
      { client: 'Usuario #1847', duration: 312, outcome: 'Ticket creado - problema resuelto' },
      { client: 'Usuario #2103', duration: 245, outcome: 'Seguimiento de caso existente' },
      { client: 'Usuario #1592', duration: 198, outcome: 'Consulta sobre servicio técnico' },
    ],
    knowledgeBase: [
      'Base de conocimiento de problemas comunes',
      'Proceso de creación de tickets',
      'SLAs y tiempos de respuesta',
      'Guías de solución rápida',
    ],
  },
  clinica: {
    promptBase: 'Eres un asistente virtual de una clínica médica. Ayudas a agendar citas, proporcionar información de servicios y horarios. No das diagnósticos médicos.',
    sampleCalls: [
      { client: 'Paciente María R.', duration: 234, outcome: 'Cita agendada con médico general' },
      { client: 'Paciente Jorge L.', duration: 189, outcome: 'Información de estudios de laboratorio' },
      { client: 'Paciente Carmen S.', duration: 156, outcome: 'Consulta sobre vacunación' },
    ],
    knowledgeBase: [
      'Especialidades médicas disponibles',
      'Horarios de consulta por especialidad',
      'Requisitos para cita (seguro, documentos)',
      'Servicios de urgencias y laboratorio',
    ],
  },
} as const;

export type IndustrySlug = keyof typeof DEMO_DATA_BY_INDUSTRY;
