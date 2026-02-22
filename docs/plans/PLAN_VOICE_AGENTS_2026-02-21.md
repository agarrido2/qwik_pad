# Plan de Implementación: Arquitectura Multi-Agente (Voice Agents)

## 🎯 Objetivo
Implementar la capa de servicios y la interfaz de usuario (UI) para la nueva arquitectura multi-agente (`voice_agents`), permitiendo a las organizaciones gestionar múltiples agentes de voz con configuraciones independientes.

## 📐 Arquitectura y Reglas (Recordatorio para QwikBuilder)
- **Rutas (`src/routes/`)**: Solo orquestan datos (`routeLoader$`, `routeAction$`). Cero lógica de negocio.
- **Servicios (`src/lib/services/`)**: Contienen toda la lógica de base de datos y negocio.
- **Componentes (`src/components/`)**: UI pura, reciben props y emiten eventos.

---

## 🛠️ Tareas a Ejecutar (Asignado a: @QwikBuilder)

### 1. Capa de Servicios (`src/lib/services/voice-agent.service.ts`)
Crear el servicio para gestionar los agentes de voz con los siguientes métodos:
- [x] `create(data)`: Crea un nuevo agente asociado a una organización.
- [x] `getByOrganization(orgId)`: Lista todos los agentes de una organización.
- [x] `getById(id, orgId)`: Obtiene los detalles de un agente específico (validando pertenencia a la org).
- [x] `update(id, orgId, data)`: Actualiza la configuración del agente (prompt, nombre, etc.).
- [x] `delete(id, orgId)`: Elimina un agente (soft delete o hard delete según convenga).
- [x] `setDefault(id, orgId)`: Marca un agente como el principal de la organización (y desmarca los demás).

### 2. Actualización del Onboarding (`src/lib/services/onboarding.service.ts`)
- [x] Modificar `OnboardingService.processOnboarding` (o similar) para que, tras crear la organización, se cree automáticamente el **primer agente de voz** (`is_default: true`) utilizando los datos recogidos en el formulario (nombre del asistente, género, nivel de amabilidad, sector).

### 3. Rutas y UI del Dashboard (`src/routes/dashboard/agents/`)
Crear la estructura de rutas para la gestión de agentes:
- [x] **`src/routes/dashboard/agents/index.tsx`**: 
  - `routeLoader$`: Carga la lista de agentes de la organización actual.
  - UI: Grid o tabla mostrando los agentes (Nombre, Número asignado, Estado). Botón "Crear Nuevo Agente".
- [x] **`src/routes/dashboard/agents/new/index.tsx`**:
  - `routeAction$`: Valida con Zod y llama a `VoiceAgentService.create`.
  - UI: Formulario de creación (Nombre interno, Nombre del asistente, Género, Tono, Sector).
- [x] **`src/routes/dashboard/agents/[id]/index.tsx`**:
  - `routeLoader$`: Carga los detalles del agente.
  - `routeAction$`: Actualiza los datos.
  - UI: Formulario avanzado (Prompt del sistema, Política de transferencia, Email de leads, Asignación de número de teléfono).

### 4. Componentes de UI (`src/components/agents/`)
- [x] Crear `AgentCard.tsx`: Tarjeta visual para listar agentes en el dashboard.
- [x] Crear `AgentForm.tsx`: Formulario reutilizable para creación/edición, estilizado con Tailwind v4.

---

## 🚦 Criterios de Aceptación
- [x] El código compila sin errores de TypeScript (`bun run build.types`).
- [ ] La creación de una nueva cuenta en el onboarding genera correctamente la organización y su primer agente de voz.
- [x] El dashboard permite listar, crear y editar agentes.
- [x] Se respeta el diseño Mobile-first con Tailwind v4.

---

## 📝 Aprobación
Este plan define la estructura exacta que el Builder debe seguir para implementar la UI y los servicios sin romper la arquitectura.