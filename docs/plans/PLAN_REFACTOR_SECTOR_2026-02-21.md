# Plan de Refactorización: Transición de "Industry" a "Sector"

## 1. Contexto y Objetivo
El concepto de "Industria" (Industry) cambia a "Sector". Actualmente, el sistema restringe a los usuarios a seleccionar una industria de una lista estricta (basada en un Enum de base de datos). El nuevo modelo requiere que el usuario pueda elegir de una lista de sectores predefinidos (que en el futuro otorgarán ventajas) o escribir su propio sector manualmente.

## 2. Análisis de Base de Datos (`src/lib/db/schema.ts`)
La tabla actual `industry_types` y el enum `industrySectorEnum` limitan la flexibilidad.

**Cambios propuestos:**
1. **Eliminar Enum:** Eliminar `industrySectorEnum`.
2. **Refactorizar Tabla Catálogo:** Renombrar `industry_types` a `sectors`. Esta tabla servirá únicamente como catálogo de sugerencias (para poblar la UI y gestionar ventajas futuras), pero **no** se usará como Foreign Key restrictiva en los perfiles de usuario.
   - Campos: `id`, `slug`, `name`, `description`, `icon`.
3. **Actualizar Tablas de Usuario/Negocio:**
   - `organizations`: Cambiar `industry` a `sector: text('sector')`.
   - `usersDemo`: Cambiar `industry` a `sector: text('sector').notNull()`.
   - `agentProfiles`: Cambiar `industry` a `sector: text('sector').notNull()`.
   - *Nota: Al ser `text`, permite guardar tanto el `slug` de un sector predefinido como un texto libre introducido por el usuario.*
4. **Actualizar Relaciones:**
   - `callFlowTemplates`: Cambiar `industryTypeId` a `sectorId` referenciando a `sectors.id`.
5. **Actualizar Índices:** Renombrar índices como `idx_agent_profiles_industry` a `idx_agent_profiles_sector`.

## 3. Análisis de UI y Lógica (`src/features/`, `src/routes/`)
1. **Formularios (Onboarding y Demo):**
   - Reemplazar el `<select>` estricto por un componente híbrido (ej. un `<input list="sectors">` con `<datalist>`, o un `<select>` con opción "Otro" que despliegue un `<input type="text">`).
   - Cambiar las referencias de estado/formularios de `industrySlug` a `sector`.
2. **Validaciones (Zod):**
   - Actualizar los esquemas de validación para aceptar cualquier `string` en el campo `sector`, eliminando la validación estricta contra el enum.
3. **Plantillas de Datos (`demo-data-templates.ts`):**
   - Cambiar `IndustrySlug` a `SectorSlug` o simplemente manejarlo como `string`.
   - Adaptar la lógica de generación de plantillas para que, si el sector introducido no coincide con uno predefinido, se asigne una plantilla genérica por defecto.

## 4. Tareas por Agente

### 🗄️ BASE DE DATOS (Agente: @QwikDBA)
- [ ] Modificar `src/lib/db/schema.ts` aplicando los cambios descritos en la sección 2.
- [ ] Generar la migración correspondiente (`bun run db:generate`).
- [ ] Aplicar los cambios a la base de datos local (`bun run db:push`).
- [ ] Actualizar el script de seed (`scripts/seed-database.sql` o equivalente) para poblar la nueva tabla `sectors` en lugar de `industry_types`.

### 🏗️ LÓGICA Y RUTAS (Agente: @QwikBuilder)
- [ ] **Refactorización Global:** Buscar y reemplazar `industry` por `sector` (y sus variantes en mayúsculas/plurales) en todo el código (`src/`).
- [ ] **UI Onboarding (`Step2ReglasNegocio.tsx` y `industry-selector.tsx`):** 
  - Renombrar `industry-selector.tsx` a `sector-selector.tsx`.
  - Implementar el nuevo input flexible para el sector (permitiendo selección o texto libre). Si el usuario selecciona "Otro", debe aparecer un input de texto.
- [ ] **UI Demo (`DemoWidget.tsx` y relacionados):** Actualizar el formulario de solicitud de demo con el mismo input flexible.
- [ ] **Validaciones:** Actualizar los esquemas Zod en `src/lib/validations/` o donde se definan las acciones de los formularios.
- [ ] **Plantillas:** Actualizar `src/lib/utils/demo-data-templates.ts` para manejar sectores personalizados (fallback a plantilla genérica).

## 5. Checklist de Arquitectura
- [x] **Análisis de Normativa:** Cumple con `ARQUITECTURA_FOLDER.md`. Los cambios de UI se mantienen en `components/` y `features/`, la lógica de DB en `lib/db/`.
- [x] **Flexibilidad:** El cambio a `text` en la base de datos garantiza que el usuario no esté bloqueado por el catálogo.