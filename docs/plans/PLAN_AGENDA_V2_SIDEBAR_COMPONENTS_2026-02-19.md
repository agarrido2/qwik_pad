# Plan: Agenda V2 — Layout con Sidebar de Componentes

**Fecha:** 2026-02-19  
**Estado:** 🟡 Pendiente de aprobación  
**Agente Origen:** @QwikArchitect  
**Agentes Ejecución:** @QwikBuilder (UI + lógica) · @QwikDBA (schema `departments`)  
**Referencia Visual:** Screenshot adjunto (FullCalendar View con sidebar lateral)

---

## 📋 Índice

1. [Contexto y Objetivos](#1-contexto-y-objetivos)
2. [Análisis de Normativa](#2-análisis-de-normativa)
3. [Arquitectura Propuesta](#3-arquitectura-propuesta)
4. [Componentes Nuevos](#4-componentes-nuevos)
5. [Schema de Base de Datos](#5-schema-de-base-de-datos)
6. [Tipos Compartidos](#6-tipos-compartidos)
7. [Ruta Orquestadora (Refactor)](#7-ruta-orquestadora-refactor)
8. [Estilos y Responsive](#8-estilos-y-responsive)
9. [Fuera de Alcance (Explícito)](#9-fuera-de-alcance)
10. [Checklist de Implementación](#10-checklist-de-implementación)

---

## 1. Contexto y Objetivos

### Estado Actual (V1)
La página `/dashboard/agenda` renderiza un `CalendarView` (FullCalendar v6) a ancho completo con 3 eventos mock. No existe sidebar lateral, filtros por departamento, mini-calendario ni lista de próximos eventos.

### Objetivo V2
Evolucionar la página Agenda a un **layout de 2 columnas** (sidebar izquierdo + calendario principal) con 4 componentes visualmente diferenciados, inspirados en la referencia:

| # | Componente | Descripción | Fuente de datos |
|---|---|---|---|
| 1 | **DatePickerCalendar** | Mini-calendario mensual para navegación rápida | Estado local (`useSignal`) — sincroniza con FullCalendar |
| 2 | **CalendarView** | Calendario principal FullCalendar (ya existe, se mantiene) | `routeLoader$` (eventos) |
| 3 | **DepartmentFilter** | Lista de departamentos con toggle on/off y color · horas acumuladas | `routeLoader$` (departamentos) |
| 4 | **UpcomingEvents** | Lista de próximos eventos ordenados por fecha, con indicador de prioridad | Derivado de eventos cargados (`useComputed$`) |

Además, se añade un **botón "Crear Evento"** en el header de la página (funcionalidad placeholder V2, modal en V3).

### NO se toca (decisiones explícitas)
- **Modal de crear/editar evento** → V3 (requiere `routeAction$` + Zod)
- **Drag & drop** → V3 (requiere `editable: true` en FullCalendar)
- **Integración con Google Calendar** → futuro
- **Conexión real a DB** → V2 introduce schema pero usa **mock tipado** en `routeLoader$` hasta tener service layer

---

## 2. Análisis de Normativa

| Documento | Sección | Validación |
|---|---|---|
| `ARQUITECTURA_FOLDER.md` § Orchestrator Pattern | ✅ La ruta `agenda/index.tsx` solo orquesta loaders y ensambla componentes |
| `ARQUITECTURA_FOLDER.md` § src/features/ | ✅ Todos los componentes nuevos viven en `src/features/calendar/components/` |
| `ARQUITECTURA_FOLDER.md` § src/components/ui/ | ✅ Si algún componente es agnóstico (ej: mini-calendar reutilizable) → `components/ui/` |
| `PROJECT_RULES_CORE.md` § Business Logic | ✅ Cero lógica de negocio en componentes, toda derivación en la ruta o `useComputed$` |
| `CHEATSHEET_QWIK.md` § 1.2 | ✅ `useComputed$` para filtrado síncrono, `useSignal` para estado local |
| `DB_QUERY_OPTIMIZATION.md` § N+1 | ✅ Departamentos + eventos en 1-2 queries (JOINs, no loops) |
| `QUALITY_STANDARDS.md` § useVisibleTask$ | ✅ Solo `CalendarView` usa `useVisibleTask$` (justificado: FullCalendar DOM) |
| `SEO_A11Y_GUIDE.md` § 2.2 | ✅ Botón "Crear Evento" con `aria-label`, toggles con `aria-pressed` |

---

## 3. Arquitectura Propuesta

### 3.1 Layout de 2 Columnas

```
┌─────────────────────────────────────────────────────────┐
│  header: h2 "Agenda" + p + [+ Crear Evento]            │
├──────────────┬──────────────────────────────────────────┤
│              │                                          │
│  SIDEBAR     │        CALENDARIO PRINCIPAL              │
│  (280px)     │        (CalendarView - flex-1)           │
│              │                                          │
│ ┌──────────┐ │                                          │
│ │DatePicker│ │        FullCalendar (ya existe)          │
│ │ Calendar │ │        - Month / Week / Day / List       │
│ └──────────┘ │        - Toolbar: prev/next/today/views  │
│              │                                          │
│ ┌──────────┐ │                                          │
│ │Departmen-│ │                                          │
│ │tFilter   │ │                                          │
│ │ ● Ventas │ │                                          │
│ │ ● Soporte│ │                                          │
│ │ ● RRHH   │ │                                          │
│ └──────────┘ │                                          │
│              │                                          │
│ ┌──────────┐ │                                          │
│ │Upcoming  │ │                                          │
│ │Events    │ │                                          │
│ │ ▎Evento 1│ │                                          │
│ │ ▎Evento 2│ │                                          │
│ └──────────┘ │                                          │
│              │                                          │
├──────────────┴──────────────────────────────────────────┤
```

### 3.2 Árbol de Archivos (Cambios)

```text
src/features/calendar/
├── components/
│   ├── calendar-view.tsx           # ✅ Existente (sin cambios)
│   ├── calendar-sidebar.tsx        # 🆕 Wrapper sidebar (3 sub-componentes)
│   ├── date-picker-calendar.tsx    # 🆕 Mini calendario mensual
│   ├── department-filter.tsx       # 🆕 Lista departamentos con toggle
│   └── upcoming-events.tsx         # 🆕 Próximos eventos
├── config/
│   └── calendar.config.ts          # ✅ Existente (sin cambios)
├── types/
│   └── calendar.types.ts           # 🔄 Extender con Department, UpcomingEvent
└── index.ts                        # 🔄 Re-exportar nuevos componentes

src/routes/(app)/dashboard/agenda/
└── index.tsx                       # 🔄 Refactorizar layout 2 columnas
```

### 3.3 Flujo de Datos

```
routeLoader$ (SSR)
  ├── useCalendarEvents → CalendarEvent[]
  └── useDepartments → Department[] (mock V2, DB future)
        │
        ▼
  agenda/index.tsx (Orquestador)
        │
        ├── useSignal(selectedDate)  ──→ DatePickerCalendar ←──→ CalendarView (sync bidireccional)
        │
        ├── useSignal(activeDepartments) ──→ DepartmentFilter (toggle on/off)
        │                                     │
        │                                     ▼
        │                              useComputed$(filteredEvents) ──→ CalendarView
        │                                     │
        │                                     ▼
        └── useComputed$(upcomingEvents) ──→ UpcomingEvents (derivado, sorted, top 5)
```

**Clave:** `useComputed$` para `filteredEvents` y `upcomingEvents` — derivación síncrona pura, NUNCA `useResource$` ni `useTask$` (cumplen § 1.2 CHEATSHEET).

---

## 4. Componentes Nuevos

### 4.1 `DatePickerCalendar` — Mini Calendario

**Archivo:** `src/features/calendar/components/date-picker-calendar.tsx`  
**Tipo:** Componente puro con estado local (`useSignal` para mes navegado)

```text
Props:
  - selectedDate: Signal<string>     (ISO date, binding bidireccional con ruta)
  - onDateSelect$: QRL<(date: string) => void>  (callback para sincronizar FullCalendar)

Comportamiento:
  - Renderiza grilla 7×6 con días del mes (cabecera Su Mo Tu We Th Fr Sa → Lu Ma Mi Ju Vi Sa Do en español)
  - firstDay: 1 (lunes, consistente con CALENDAR_CONFIG)  
  - Resalta día actual (bg-primary/10, text-primary)
  - Marca día seleccionado (bg-primary, text-primary-foreground, rounded-full)
  - Flechas < > para navegar meses
  - Click en día → onDateSelect$ → CalendarView.gotoDate(date)

Implementación:
  - 100% Qwik SSR (NO usa useVisibleTask$)
  - Cálculo de días con Date API nativa (sin dependencias externas)
  - Responsive: se oculta en mobile (hidden lg:block) — el sidebar colapsa
```

### 4.2 `DepartmentFilter` — Filtro por Departamentos

**Archivo:** `src/features/calendar/components/department-filter.tsx`  
**Tipo:** Componente puro, recibe datos + callbacks

```text
Props:
  - departments: Department[]
  - activeDepartmentIds: Signal<string[]>   (IDs activos, toggle local)
  - onToggle$: QRL<(departmentId: string) => void>

Cada fila:
  ● [color dot]  Nombre          Xh    [toggle]
  
  - Toggle switch: aria-pressed="true/false", aria-label="Filtrar por {dept}"
  - Color dot: bg dinámico con el color del departamento (HSL token o hex)
  - Horas: suma de duración de eventos de ese departamento (derivado)

Cabecera:
  "Departamentos"  [View All toggle]
  - View All toggle → activa/desactiva todos los departamentos

Implementación:
  - Las horas se calculan con useComputed$ dentro del DepartmentFilter
  - Toggle all = set todos activos / ninguno activo
  - Filtro altera la señal activeDepartmentIds → useComputed$ en ruta filtra eventos
```

### 4.3 `UpcomingEvents` — Próximos Eventos

**Archivo:** `src/features/calendar/components/upcoming-events.tsx`  
**Tipo:** Componente puro, recibe datos derivados

```text
Props:
  - events: UpcomingEvent[]   (ya filtrados y ordenados por fecha ascendente)

Cada fila:
  ▎[color bar]  Título           ⚠️ (priority badge)
                📅 Feb 19, 11:00 AM

  - Barra lateral izquierda: 3px border-left con el color del departamento
  - Badge de prioridad: solo si event.priority === 'high' (círculo rojo)
  - Fecha formateada: Intl.DateTimeFormat('es-ES', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

Cabecera:
  "Próximos Eventos"

Implementación:
  - Renderizado puro SSR
  - Max 5 eventos (paginación no necesaria V2)
  - Si no hay eventos: mensaje "No hay eventos próximos"
  - Los eventos ya llegan filtrados desde la ruta (useComputed$)
```

### 4.4 `CalendarSidebar` — Wrapper Sidebar

**Archivo:** `src/features/calendar/components/calendar-sidebar.tsx`  
**Tipo:** Componente composición (ensambla los 3 sub-componentes)

```text
Props:
  - selectedDate: Signal<string>
  - onDateSelect$: QRL<(date: string) => void>
  - departments: Department[]
  - activeDepartmentIds: Signal<string[]>
  - onDepartmentToggle$: QRL<(id: string) => void>
  - upcomingEvents: UpcomingEvent[]

Renderiza:
  <aside class="hidden lg:flex lg:w-[280px] flex-col gap-4 flex-shrink-0">
    <DatePickerCalendar ... />
    <DepartmentFilter ... />
    <UpcomingEvents ... />
  </aside>

Responsive:
  - Desktop (lg+): sidebar visible, 280px fijo
  - Mobile (<lg): sidebar oculto, solo calendario a full width
  - Futuro: podríamos añadir un sheet/drawer en mobile para acceder al sidebar
```

---

## 5. Schema de Base de Datos

### 5.1 Tabla `departments` (Agente: @QwikDBA)

> **NOTA V2:** Se define el schema para preparar la migración, pero la ruta usa **mock data** hasta que exista service layer.

```sql
-- Departamentos de la organización (filtros de agenda)
CREATE TABLE departments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,           -- "Ventas", "Soporte", "RRHH"
  color       TEXT NOT NULL,           -- "#0EA5E9" o "hsl(var(--primary))"
  slug        TEXT NOT NULL,           -- "ventas", "soporte"
  is_active   BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(org_id, slug)
);

CREATE INDEX idx_departments_org ON departments(org_id);
CREATE INDEX idx_departments_org_active ON departments(org_id, is_active);
```

**Drizzle schema** (a añadir en `src/lib/db/schema.ts`):

```ts
export const departments = pgTable('departments', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  color: text('color').notNull(),
  slug: text('slug').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  uniqueOrgSlug: unique().on(table.organizationId, table.slug),
  orgIdx: index('idx_departments_org').on(table.organizationId),
  orgActiveIdx: index('idx_departments_org_active').on(table.organizationId, table.isActive),
}));
```

### 5.2 Extensión de Eventos (Futuro V3)

Para V3 se añadirá `department_id` a la tabla de eventos (appointments):

```ts
departmentId: uuid('department_id').references(() => departments.id, { onDelete: 'set null' }),
```

**V2 usa `extendedProps.departmentId` en los mock** para anticipar la estructura sin migración.

---

## 6. Tipos Compartidos

### 6.1 Extensiones en `calendar.types.ts`

```ts
/** Departamento de la organización para filtrado de agenda. */
export interface Department {
  id: string;
  name: string;
  color: string;       // HSL token o hex
  slug: string;
  isActive: boolean;
}

/** Evento formateado para el sidebar de "Próximos Eventos". */
export interface UpcomingEvent {
  id: string;
  title: string;
  start: string;           // ISO 8601
  departmentColor: string; // color heredado del departamento
  departmentName: string;
  priority: 'high' | 'normal';
}
```

### 6.2 Extensión de `CalendarEventExtendedProps`

```ts
export interface CalendarEventExtendedProps {
  type: CalendarEventType;
  contactName?: string;
  contactPhone?: string;
  notes?: string;
  status?: CalendarEventStatus;
  departmentId?: string;    // 🆕 Referencia al departamento
  departmentName?: string;  // 🆕 Para display sin JOIN
  priority?: 'high' | 'normal'; // 🆕 Prioridad visual
}
```

---

## 7. Ruta Orquestadora (Refactor)

### `src/routes/(app)/dashboard/agenda/index.tsx`

```tsx
// Pseudo-código del layout refactorizado

export const useCalendarEvents = routeLoader$<CalendarEvent[]>(async () => {
  // V2: mock con departmentId en extendedProps
  return [...mockEventsWithDepartments];
});

export const useDepartments = routeLoader$<Department[]>(async () => {
  // V2: mock tipado. V3: DepartmentService.getByOrg(orgId)
  return [
    { id: 'dept-1', name: 'Ventas', color: '#0EA5E9', slug: 'ventas', isActive: true },
    { id: 'dept-2', name: 'Soporte', color: '#8B5CF6', slug: 'soporte', isActive: true },
    { id: 'dept-3', name: 'RRHH', color: '#F59E0B', slug: 'rrhh', isActive: true },
    { id: 'dept-4', name: 'Ingeniería', color: '#10B981', slug: 'ingenieria', isActive: true },
  ];
});

export default component$(() => {
  const events = useCalendarEvents();
  const departments = useDepartments();

  // Estado local
  const selectedDate = useSignal(new Date().toISOString().split('T')[0]);
  const activeDepartmentIds = useSignal(departments.value.map(d => d.id));

  // Derivación síncrona pura (useComputed$)
  const filteredEvents = useComputed$(() => {
    return events.value.filter(e =>
      activeDepartmentIds.value.includes(e.extendedProps?.departmentId ?? '')
    );
  });

  const upcomingEvents = useComputed$(() => {
    const now = new Date().toISOString();
    return filteredEvents.value
      .filter(e => e.start >= now)
      .sort((a, b) => a.start.localeCompare(b.start))
      .slice(0, 5)
      .map(e => ({
        id: e.id,
        title: e.title,
        start: e.start,
        departmentColor: e.color ?? 'hsl(var(--primary))',
        departmentName: e.extendedProps?.departmentName ?? '',
        priority: e.extendedProps?.priority ?? 'normal',
      }));
  });

  return (
    <div class="space-y-4">
      <header class="flex items-center justify-between">
        <div>
          <h2>Agenda</h2>
          <p>Visualiza citas, seguimientos y bloqueos...</p>
        </div>
        <button class="btn-primary" aria-label="Crear nuevo evento">
          + Crear Evento
        </button>
      </header>

      <div class="flex gap-6">
        {/* Sidebar: 280px, oculto en mobile */}
        <CalendarSidebar
          selectedDate={selectedDate}
          onDateSelect$={...}
          departments={departments.value}
          activeDepartmentIds={activeDepartmentIds}
          onDepartmentToggle$={...}
          upcomingEvents={upcomingEvents.value}
        />

        {/* Calendario principal: flex-1 */}
        <CalendarView events={filteredEvents.value} />
      </div>
    </div>
  );
});
```

**Principio Orchestrator cumplido:** La ruta solo coordina signals, computa derivaciones y ensambla componentes. Cero lógica de negocio.

---

## 8. Estilos y Responsive

### 8.1 Breakpoints

| Viewport | Sidebar | Calendar | Botón "Crear" |
|---|---|---|---|
| `< lg` (mobile/tablet) | `hidden` | Full width | Visible (icono `+` solo) |
| `≥ lg` (desktop) | `w-[280px]` flex-shrink-0 | `flex-1` | Visible (texto completo) |

### 8.2 Nuevos Estilos

- **DatePickerCalendar**: Grid calendar con Tailwind puro (`grid grid-cols-7`, `rounded-full` para selected)
- **DepartmentFilter**: Cada fila con toggle switch custom (Tailwind, no librería)
- **UpcomingEvents**: Cards con `border-l-3` para color del departamento
- **Transiciones**: `transition-colors duration-150` en toggles y hover states

### 8.3 Consistencia con Dashboard

- Todas las cards usan: `rounded-lg border border-border bg-card p-4`
- Títulos de sección: `text-sm font-semibold text-foreground`
- Subtexto: `text-xs text-muted-foreground`

---

## 9. Fuera de Alcance (Explícito)

| Feature | Razón | Versión |
|---|---|---|
| Modal crear/editar evento | Requiere `routeAction$` + `zod$` + form validation | V3 |
| Drag & drop (mover eventos) | Requiere `editable: true` + event handlers | V3 |
| Conexión real a DB (events+departments) | Requiere service layer `AgendaService` | V3 |
| Google Calendar sync | Integración externa | Futuro |
| Sidebar collapsible en mobile (drawer) | UX enhancement | V3 |
| RLS policies para `departments` | Requiere RLS + testing | V3 (junto con DB real) |

---

## 10. Checklist de Implementación

### 📋 Análisis de Normativa
- [x] Revisado `ARQUITECTURA_FOLDER.md` — componentes en `features/calendar/`
- [x] Revisado `CHEATSHEET_QWIK.md` — `useComputed$` para filtros, `useSignal` para state local
- [x] Revisado `QUALITY_STANDARDS.md` — cero `useVisibleTask$` nuevo (solo CalendarView existente)
- [x] Revisado `SEO_A11Y_GUIDE.md` — botones con `aria-label`, toggles con `aria-pressed`

### 🗃️ BASE DE DATOS (Agente: @QwikDBA)
- [ ] Definir `departments` en `src/lib/db/schema.ts` (tabla + relations + types)
- [ ] Generar migración: `bun run db:generate`
- [ ] Aplicar migración: `bun run db:push`

### 🏗️ LÓGICA Y COMPONENTES (Agente: @QwikBuilder)

**Fase 1: Tipos y Datos Mock**
- [ ] Extender `calendar.types.ts` con `Department`, `UpcomingEvent`, campos nuevos en `ExtendedProps`
- [ ] Crear mock data con departamentos y eventos enriquecidos

**Fase 2: Componentes Sidebar**
- [ ] Crear `date-picker-calendar.tsx` — mini calendario SSR puro
- [ ] Crear `department-filter.tsx` — lista con toggles
- [ ] Crear `upcoming-events.tsx` — lista próximos eventos
- [ ] Crear `calendar-sidebar.tsx` — wrapper compositivo

**Fase 3: Integración en Ruta**
- [ ] Refactorizar `agenda/index.tsx` — layout 2 columnas, loaders, signals, computeds
- [ ] Actualizar `index.ts` (barrel exports)
- [ ] Añadir botón "Crear Evento" (placeholder, sin acción V2)

**Fase 4: Validación**
- [ ] `bun run build` — 0 errores
- [ ] `bun run lint` — 0 warnings
- [ ] Test visual: desktop (lg+) y mobile (<lg)
- [ ] Verificar a11y: toggles con `aria-pressed`, botón con `aria-label`

---

**✅ Plan actualizado en `docs/plans/PLAN_AGENDA_V2_SIDEBAR_COMPONENTS_2026-02-19.md`. ¿Aprobado?**

Si apruebas, paso el testigo a **@QwikDBA** (schema `departments`) y luego a **@QwikBuilder** (implementación UI en 4 fases).
