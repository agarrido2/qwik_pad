# Plan de Implementación: Scheduling Service & UI

## 🎯 Objetivo
Implementar la capa de servicios y la interfaz de usuario (Panel Admin) para el motor de reservas (Scheduling Engine), siguiendo la arquitectura estricta de 3 capas de Qwik.

## 📐 Arquitectura (The Orchestrator Pattern)
- **Capa 1 (Rutas)**: `src/routes/(app)/dashboard/appointments/` orquestará la carga de datos (`routeLoader$`) y acciones (`routeAction$`).
- **Capa 2 (Servicios)**: `src/lib/services/scheduling.service.ts` contendrá toda la lógica de negocio, validación Zod y llamadas a la BD/RPCs.
- **Capa 3 (UI)**: Componentes puros en `src/components/` (Tailwind v4).

## 📋 Fases de Implementación (Orden de Ejecución)

### Fase 1: Capa de Servicios (`SchedulingService`)
**Agente Asignado:** @QwikBuilder
- [ ] Crear `src/lib/services/scheduling.service.ts`.
- [ ] Implementar `getAppointmentsByOrg(orgId)` con JOINs a `departments` y `users` (para ver quién atiende).
- [ ] Implementar `bookAppointment(input)` consumiendo el RPC `book_appointment`.
- [ ] Implementar `assignOperator(appointmentId, userId)` para confirmar citas PENDING.
- [ ] Implementar `getAvailability(query)` consumiendo el RPC `get_time_window_availability`.
- [ ] Implementar métodos para gestionar `calendar_schedules` y `calendar_exceptions`.

### Fase 2: Panel Admin - Lista de Citas
**Agente Asignado:** @QwikBuilder
- [ ] Crear `src/routes/(app)/dashboard/appointments/index.tsx`.
- [ ] Implementar `routeLoader$` que consuma `SchedulingService.getAppointmentsByOrg`.
- [ ] UI: Tabla de citas con estados (PENDING, CONFIRMED, CANCELLED) usando Tailwind v4.

### Fase 3: Panel Admin - Asignar Operario (Confirmar Cita)
**Agente Asignado:** @QwikBuilder
- [ ] Crear `src/routes/(app)/dashboard/appointments/[id]/index.tsx`.
- [ ] Implementar `routeAction$` para asignar operario (cambia estado a CONFIRMED).
- [ ] UI: Formulario de asignación y detalle de la cita.

### Fase 4: Panel Admin - Horarios del Departamento
**Agente Asignado:** @QwikBuilder
- [ ] Crear `src/routes/(app)/dashboard/departments/[id]/schedule/index.tsx`.
- [ ] Implementar `routeLoader$` y `routeAction$` para CRUD de horarios.
- [ ] UI: Interfaz para definir `weekly_hours` y días cerrados/excepciones.

## 🛡️ Checklist de Arquitectura
- [x] **Análisis de Normativa**: Cumple con `docs/standards/ARQUITECTURA_FOLDER.md`.
- [x] **Cero Lógica en Rutas**: Las rutas solo llamarán a `SchedulingService`.
- [x] **Validación Zod**: Se usarán los esquemas ya definidos en `src/lib/schemas/scheduling.schemas.ts`.
