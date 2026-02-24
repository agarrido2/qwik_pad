# Onucall Auto 🚗🤖

**Plataforma de Inteligencia Comercial con IA de Voz para Concesionarios de Vehículos en España.**

Onucall es un SaaS vertical B2B diseñado para optimizar la captación de leads en concesionarios mediante un agente de voz conversacional con Inteligencia Artificial (Elena). Actúa como un "recepcionista virtual" 24/7/365 que atiende llamadas entrantes (inbound), cualifica el interés del cliente, consulta el stock en tiempo real y agenda citas o llamadas de seguimiento (callbacks) directamente en el CRM del equipo de ventas.

---

## 🎯 El Problema y la Solución

**El Problema:** Los concesionarios pierden oportunidades de venta (hasta un 30%) al no poder atender todas las llamadas a tiempo, especialmente fuera de horario comercial o en picos de trabajo. Cada llamada perdida que termina en el buzón de voz es un cliente potencial que se enfría o se va a la competencia.

**La Solución:** Onucall elimina esta brecha. Filtra las llamadas entrantes, conversa con el cliente en lenguaje natural (español), entiende su intención, responde dudas técnicas sobre el inventario sin alucinaciones y canaliza el lead cualificado hacia el comercial adecuado. El cierre de la venta y el seguimiento proactivo (outbound) sigue siendo humano, garantizando el toque personal en la negociación final.

---

## 🧩 Módulos Principales

1. **Agente de Voz Conversacional (Elena):**
   - Atiende el 100% de las llamadas entrantes.
   - Cualifica leads (Vehículo Nuevo vs. Ocasión).
   - Responde preguntas técnicas sobre el stock disponible.
   - Agenda citas presenciales (Test Drives, Visitas en exposición) y llamadas de seguimiento (Callbacks).

2. **CRM Visual de Leads:**
   - Embudo de conversión integrado (`prospect` → `lead` → `qualified` → `client`).
   - Historial de interacciones, notas de la IA (resumen de la llamada) y datos de contacto.

3. **Catálogo Inteligente de Vehículos (Stock):**
   - Base de datos en tiempo real del inventario del concesionario.
   - Alimenta tanto al Agente de Voz (vía RAG) como a un portal web opcional para clientes.

4. **Motor de Agendamiento Jerárquico:**
   - Sistema estricto de 3 niveles: Organización > Departamento (Área) > Vendedor.
   - Prevención de *double-booking* mediante bloqueos transaccionales y funciones RPC en base de datos calculadas en milisegundos.

5. **Inteligencia de Negocio (BI) y Auditoría:**
   - **BI Conversacional:** Los gerentes pueden hacer preguntas en lenguaje natural sobre el rendimiento y el stock ("¿Qué modelos quedaron del SEAT Ateca?").
   - **Bug Empresarial:** Sistema de detección de anomalías que dispara notificaciones urgentes si la IA detecta discrepancias operativas (ej. un cliente pregunta por un coche anunciado que no consta en el catálogo interno).

---

## 🛠️ Stack Tecnológico y Arquitectura

La infraestructura está diseñada para alta disponibilidad, concurrencia y seguridad multi-tenant:

- **Frontend:** [Qwik](https://qwik.dev/) (Optimización extrema de renderizado y resumability).
- **Backend & Base de Datos:** [Supabase](https://supabase.com/) (PostgreSQL) con políticas estrictas de Row Level Security (RLS).
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/) para tipado estricto y migraciones seguras.
- **Voz e IA:** [Retell AI](https://www.retellai.com/) (Motor conversacional) + [Zadarma](https://zadarma.com/) (Telefonía SIP).
- **Orquestación:** [n8n](https://n8n.io/) (Webhooks, identificación de clientes en tiempo real y procesamiento post-llamada).
- **RAG Híbrido (Retrieval-Augmented Generation):** 
  - 3 capas: SQL estructurado (inventario exacto) + `pgvector` (documentos y manuales) + Datos externos de mercado.
  - Garantiza respuestas técnicas precisas sin alucinaciones.

---

## 🏗️ Arquitectura de Datos (Core)

El sistema está construido sobre un núcleo agnóstico y escalable, preparado para futuras expansiones a otros verticales (ej. Inmobiliarias), pero actualmente configurado de forma estricta para automoción:

- `organizations`: Multi-tenant (Concesionarios o Grupos de concesionarios).
- `voice_agents`: Configuración de la IA (Elena) por organización.
- `departments`: Áreas de negocio con agenda propia (Ventas Nuevo, Ventas Ocasión).
- `contacts`: Ciclo de vida único del cliente.
- `appointments`: Motor de reservas unificado que soporta citas exactas (`appointment`, `visit`) y llamadas flexibles (`callback`).

---

*Onucall garantiza que las operaciones comerciales no se detengan nunca, transformando cada contacto telefónico en una oportunidad medible de ventas y eficiencia.*