# Legacy Audit: src/features/calendar

> Estado: ✅ Auditado  
> Created: 2026-03-01  
> Last Updated: 2026-03-01 (post-fix)  
> Auditor: @QwikAuditor

---

## 📁 Scope Auditado

- **Ruta feature:** `src/features/calendar/`
- **Ruta orquestadora:** `src/routes/(app)/dashboard/agenda/index.tsx`

### Archivos analizados

| Archivo                                   | Tipo                                 | LOC  |
| ----------------------------------------- | ------------------------------------ | ---- |
| `components/calendar-view.tsx`            | Componente UI (FullCalendar wrapper) | ~140 |
| `components/calendar-sidebar.tsx`         | Componente composición               | ~55  |
| `components/date-picker-calendar.tsx`     | Mini-calendario interactivo          | ~130 |
| `components/department-filter.tsx`        | Filtro de departamentos              | ~130 |
| `components/upcoming-events.tsx`          | Lista de próximos eventos            | ~75  |
| `config/calendar.config.ts`               | Configuración FullCalendar           | ~55  |
| `types/calendar.types.ts`                 | Contratos de tipos                   | ~70  |
| `index.ts`                                | Barrel export                        | ~15  |
| `routes/(app)/dashboard/agenda/index.tsx` | Orquestador (capa ruta)              | ~300 |

- **Agentes originales:** Implementación V1 (PLAN_FULLCALENDAR_V1_2026-02-19 / PLAN_AGENDA_V2_SIDEBAR_COMPONENTS_2026-02-19)

---

## 🔴 Deuda Crítica (Bloquea construcción)

**Ninguna.** No se detectan violaciones que impidan añadir código nuevo de forma segura en V2.

---

## 🟠 Deuda Mayor (Resuelta en esta iteración)

### ✅ M-01 — Auth Guard en Loaders SSR (RESUELTO)

**Archivo:** `src/routes/(app)/dashboard/agenda/index.tsx`

Se implementó guard de autenticación y organización activa en ambos loaders con patrón del proyecto:

- `AuthService.getAuthUser(requestEvent)`
- Redirect a `/login` si no hay sesión
- `sharedMap` para cache de `userOrgs`
- Redirect a `/onboarding` si no hay organizaciones
- Resolución de organización activa con `resolveActiveOrg`

**Estado:** cerrado.

---

### ✅ M-02 — Estado de mes desincronizado en doble sidebar (RESUELTO)

**Archivos:**

- `src/routes/(app)/dashboard/agenda/index.tsx`
- `src/features/calendar/components/calendar-sidebar.tsx`
- `src/features/calendar/components/date-picker-calendar.tsx`

Se elevó `visibleMonth` al orquestador de ruta como `Signal<Date>` y se propaga por props a ambas instancias de `CalendarSidebar` y al `DatePickerCalendar`, eliminando el estado duplicado por breakpoint.

**Estado:** cerrado.

---

### ✅ M-03 — QRL wrappers innecesarios en DepartmentFilter (RESUELTO)

**Archivo:** `src/features/calendar/components/department-filter.tsx`

Se eliminaron wrappers `$()` redundantes y se usan directamente los callbacks recibidos:

- `onClick$={onToggleAll$}`
- `onClick$={() => onToggle$(department.id)}`

**Estado:** cerrado.

---

## 🟡 Deuda Menor (Mejora recomendada)

### 🟡 m-01 — Botón "Crear Evento" sin acción

**Archivo:** `src/routes/(app)/dashboard/agenda/index.tsx` (línea ~238)

El botón `+ Crear Evento` no tiene `onClick$`, `Form` ni `routeAction$` asociado. Es un placeholder visual sin funcionalidad.

```tsx
// ⚠️ ACTUAL — Botón vacío
<button type="button" aria-label="Crear nuevo evento" class="...">
  + Crear Evento
</button>
```

**Acción:** Implementar cuando se desarrolle la feature de creación de eventos, o añadir `disabled` con tooltip explicativo mientras sea placeholder.

---

### 🟡 m-02 — Jerarquía `<h2>` en heading principal de página

**Archivo:** `src/routes/(app)/dashboard/agenda/index.tsx` (línea ~252)

El texto "Agenda" usa `<h2>`, cuando per `SEO_A11Y_GUIDE.md § 1.2` debe existir exactamente un `<h1>` por página. Necesita verificar si el layout padre (`(app)/layout.tsx`) ya provee un `<h1>`.

```tsx
// ⚠️ ACTUAL
<h2 class="text-2xl font-bold text-foreground">Agenda</h2>

// ✅ RECOMENDADO (si layout no provee h1)
<h1 class="text-2xl font-bold text-foreground">Agenda</h1>
```

**Acción:** Verificar el layout. Si no hay `<h1>` en layout, cambiar a `<h1>`.

---

### 🟡 m-03 — `Date.now()` en `useComputed$` puede producir diffs SSR/cliente

**Archivo:** `src/routes/(app)/dashboard/agenda/index.tsx` (línea ~160)

```tsx
const upcomingEvents = useComputed$<UpcomingEvent[]>(() => {
  const now = Date.now();  // ⚠️ SSR calcula con hora del servidor, cliente con hora del browser
  return filteredEvents.value
    .filter((event) => new Date(event.start).getTime() >= now)
    ...
});
```

En V1 con datos mock de "hoy" esto no produce diferencias perceptibles, pero con datos reales podría ocultar eventos que comenzaron entre el SSR y la reanudación del cliente.

**Acción:** Considerar usar un margen de seguridad (`now - 5*60*1000`) o filtrar solo por fecha (no hora) en la capa de servicio.

---

### 🟡 m-04 — `Intl.DateTimeFormat` a nivel de módulo en `upcoming-events.tsx`

**Archivo:** `components/upcoming-events.tsx` (línea ~17)

```tsx
const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('es-ES', { ... });
```

Es una instancia de clase en el scope del módulo. No cruza fronteras de serialización (no está en estado Qwik), pero en SSR el locale del servidor podría diferir del cliente en edge cases. Impacto mínimo en contexto español-ES fijo.

**Acción:** No urgente. Documentar el supuesto de locale fijo con un comentario.

---

## ✅ Lo que está bien (preservar)

| Patrón                                   | Archivo                                                                 | Detalle                                                                                                                                    |
| ---------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| ✅ `useVisibleTask$` justificado         | `calendar-view.tsx`                                                     | Uso correcto para integración FullCalendar (DOM required). Documentado con eslint-disable y comentario.                                    |
| ✅ `noSerialize()` en instancia Calendar | `calendar-view.tsx`                                                     | La instancia de `Calendar` se envuelve en `noSerialize()` — cumple SERIALIZATION_CONTRACTS.md §2.                                          |
| ✅ `cleanup()` en destroy                | `calendar-view.tsx`                                                     | Destruye la instancia correctamente, previene memory leaks.                                                                                |
| ✅ `useComputed$` para derivaciones      | `agenda/index.tsx`, `department-filter.tsx`, `date-picker-calendar.tsx` | `filteredEvents`, `upcomingEvents`, `hoursByDepartment`, `monthLabel`, `days` — todos derivados con `useComputed$`. Idiomático y correcto. |
| ✅ Interfaces puras (sin clases)         | `calendar.types.ts`                                                     | Todos los contratos de datos son `interface` o `type`. Serializables.                                                                      |
| ✅ Barrel export                         | `index.ts`                                                              | Punto de entrada limpio, expone solo la API pública.                                                                                       |
| ✅ Config separada del componente        | `calendar.config.ts`                                                    | SoC correcto: opciones de librería desacopladas de la lógica de componente.                                                                |
| ✅ ARIA coverage completo                | Todos los componentes                                                   | `aria-label`, `aria-pressed`, `aria-expanded`, `aria-controls`, `aria-hidden` correctamente aplicados.                                     |
| ✅ Patrón Orchestrator respetado         | `agenda/index.tsx`                                                      | La ruta no contiene lógica de negocio. Solo coordina signals y QRLs.                                                                       |
| ✅ `DocumentHead` con OG + canonical     | `agenda/index.tsx`                                                      | SEO completo: title, description, og:\*, twitter:card, canonical URL.                                                                      |
| ✅ QRL props con tipos explícitos        | `calendar-sidebar.tsx`                                                  | `QRL<(dateIso: string) => void>` — tipado correcto sin `any`.                                                                              |
| ✅ SSR-pure `DatePickerCalendar`         | `date-picker-calendar.tsx`                                              | Cero `useVisibleTask$`. Mini-calendario navegable 100% SSR.                                                                                |

---

## 🗺️ Plan de Saneamiento

| Prioridad     | ID   | Archivo                 | Problema                                                  | Acción                                               | Agente       | Bloqueante para     |
| ------------- | ---- | ----------------------- | --------------------------------------------------------- | ---------------------------------------------------- | ------------ | ------------------- |
| ✅ Completado | M-01 | `agenda/index.tsx`      | Sin Auth Guard en loaders                                 | Implementado patrón auth + sharedMap + activeOrg     | @QwikBuilder | —                   |
| ✅ Completado | M-02 | `agenda/index.tsx`      | Doble instancia sidebar con estado interno desincronizado | `visibleMonth` elevado a ruta y compartido por props | @QwikBuilder | —                   |
| ✅ Completado | M-03 | `department-filter.tsx` | QRL wrappers innecesarios                                 | Wrappers eliminados, callbacks directos              | @QwikBuilder | —                   |
| 🟡 Backlog    | m-01 | `agenda/index.tsx`      | Botón "Crear Evento" vacío                                | Implementar acción o marcar `disabled`               | @QwikBuilder | Feature de creación |
| 🟡 Backlog    | m-02 | `agenda/index.tsx`      | `<h2>` en heading principal                               | Verificar layout y cambiar a `<h1>` si corresponde   | @QwikBuilder | —                   |
| 🟡 Backlog    | m-03 | `agenda/index.tsx`      | `Date.now()` en computed SSR/cliente                      | Añadir margen o filtrar por fecha en servicio        | @QwikBuilder | —                   |
| 🟡 Backlog    | m-04 | `upcoming-events.tsx`   | `Intl.DateTimeFormat` módulo-nivel                        | Documentar supuesto de locale fijo                   | @QwikBuilder | —                   |

---

## 📋 Veredicto Final

> [x] 🟢 **APTO** — Se puede construir sobre este código. Las deudas mayores detectadas en la auditoría inicial (M-01, M-02, M-03) han sido resueltas.

### Justificación

La feature `calendar` está **bien estructurada**:

- SoC respetado (feature vs ruta orquestadora claramente separadas)
- Serialización blindada (`noSerialize`, interfaces puras, sin clases en estado)
- `useVisibleTask$` justificado y documentado para FullCalendar
- Derivaciones idiomáticas con `useComputed$`
- ARIA coverage completo

Tras aplicar el saneamiento, no quedan riesgos mayores abiertos en el scope auditado. Permanecen únicamente mejoras menores de backlog (m-01 a m-04).

**Próximo paso:**

```
→ Mantener en backlog los ítems menores (m-01 a m-04).
→ Continuar con la siguiente feature sobre `calendar` sin bloqueo arquitectónico.
```
