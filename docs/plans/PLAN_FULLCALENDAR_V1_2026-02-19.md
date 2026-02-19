# Plan: Integración FullCalendar v6 Vanilla — Agenda Dashboard V1

**Fecha**: 19 Feb 2026  
**Autor**: QwikArchitect  
**Estado**: 🟡 Pendiente aprobación

---

## 🎯 Objetivo

Integrar FullCalendar v6 (Vanilla/JS) en la ruta `/dashboard/agenda` como vista de calendario interactivo para visualizar citas/eventos del agente IA.

---

## 📐 Decisiones Arquitectónicas

### ¿Por qué FullCalendar v6 Vanilla?

- **No existe wrapper oficial para Qwik** → Vanilla JS es la opción correcta
- **Requiere DOM real** → `useVisibleTask$` + `noSerialize()` (justificado per QUALITY_STANDARDS.md)
- **v6 modular** → Solo se cargan los plugins necesarios (tree-shaking)

### ¿Por qué NO un componente React?

- Qwik no hidrata → importar React rompería la resumability
- FullCalendar Vanilla JS pesa menos y se inicializa directamente en el DOM

---

## 📦 Paquetes npm a instalar

```bash
bun add @fullcalendar/core @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/list @fullcalendar/interaction
```

| Paquete | Propósito |
|---------|-----------|
| `@fullcalendar/core` | Motor principal, clase `Calendar` |
| `@fullcalendar/daygrid` | Vista mensual (`dayGridMonth`) y semanal grid |
| `@fullcalendar/timegrid` | Vista semanal/diaria con horas (`timeGridWeek`, `timeGridDay`) |
| `@fullcalendar/list` | Vista lista (`listWeek`) |
| `@fullcalendar/interaction` | Click en fecha (`dateClick`), drag&drop, resize |

> **Nota**: FullCalendar v6 incluye tipos TypeScript automáticamente. No se necesitan `@types/*`.

---

## 🏗️ Estructura de Archivos

```text
src/
├── features/
│   └── calendar/                          # Feature Module (aislado)
│       ├── components/
│       │   └── calendar-view.tsx          # Componente Qwik que monta FullCalendar
│       ├── config/
│       │   └── calendar.config.ts         # Configuración de plugins, vistas, locale
│       ├── types/
│       │   └── calendar.types.ts          # Tipos de eventos del calendario
│       └── index.ts                       # Barrel export
│
├── routes/
│   └── (app)/
│       └── dashboard/
│           └── agenda/
│               └── index.tsx              # Ruta orquestadora (routeLoader$ + component assembly)
│
└── assets/
    └── css/
        └── fullcalendar-theme.css         # Overrides de FullCalendar con variables HSL
```

### Justificación por Capa

| Capa | Archivo | Responsabilidad |
|------|---------|-----------------|
| **Route** | `agenda/index.tsx` | `routeLoader$` → cargar eventos desde servicio. `DocumentHead`. Ensamblar `<CalendarView>` |
| **Feature** | `calendar-view.tsx` | `useVisibleTask$` → montar `new Calendar()` en DOM. `noSerialize()`. `cleanup()` → `calendar.destroy()` |
| **Feature** | `calendar.config.ts` | Plugins, locale `es`, headerToolbar, vistas disponibles, colores por tipo de evento |
| **Feature** | `calendar.types.ts` | `CalendarEvent`, `CalendarViewType` — tipos compartidos |
| **Assets** | `fullcalendar-theme.css` | Overrides CSS para integrar colores HSL del design system |

---

## 🔧 Diseño Técnico Detallado

### 1. `calendar.types.ts` — Tipos

```ts
/** Evento del calendario normalizado para FullCalendar */
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;           // ISO 8601
  end?: string;             // ISO 8601 (opcional, para eventos puntuales)
  allDay?: boolean;
  color?: string;           // Color de fondo
  textColor?: string;
  extendedProps?: {
    type: 'appointment' | 'call' | 'follow-up' | 'blocked';
    contactName?: string;
    contactPhone?: string;
    notes?: string;
    status?: 'confirmed' | 'pending' | 'cancelled';
  };
}

/** Vistas disponibles en el calendario */
export type CalendarViewType = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';
```

### 2. `calendar.config.ts` — Configuración centralizada

```ts
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import type { CalendarOptions } from '@fullcalendar/core';

/**
 * Configuración base de FullCalendar.
 * El componente la extiende con el ref del DOM y los eventos.
 */
export const CALENDAR_CONFIG: Partial<CalendarOptions> = {
  plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
  locale: esLocale,
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
  },
  // UX
  nowIndicator: true,           // Línea roja "ahora" en timeGrid
  navLinks: true,               // Click en día navega a vista diaria
  editable: false,              // V1: solo lectura (sin drag&drop)
  selectable: false,            // V1: sin selección de rango
  dayMaxEvents: true,           // "+N más" en celdas overflow
  weekNumbers: false,           // Sin números de semana
  // Horario laboral
  slotMinTime: '08:00:00',
  slotMaxTime: '21:00:00',
  expandRows: true,             // Filas llenan toda la altura
  // Accesibilidad
  buttonText: {
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    list: 'Lista',
  },
};
```

### 3. `calendar-view.tsx` — Componente Qwik

```tsx
import { component$, useSignal, useVisibleTask$, noSerialize, type NoSerialize } from '@builder.io/qwik';
import { Calendar } from '@fullcalendar/core';
import { CALENDAR_CONFIG } from '../config/calendar.config';
import type { CalendarEvent } from '../types/calendar.types';

interface CalendarViewProps {
  events: CalendarEvent[];
}

export const CalendarView = component$<CalendarViewProps>(({ events }) => {
  const containerRef = useSignal<HTMLDivElement>();
  const calendarRef = useSignal<NoSerialize<Calendar>>();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    if (!containerRef.value) return;

    const calendar = new Calendar(containerRef.value, {
      ...CALENDAR_CONFIG,
      events: events,
      // Callbacks
      dateClick: (info) => {
        console.log('Date clicked:', info.dateStr);
        // V2: Abrir modal de creación de evento
      },
      eventClick: (info) => {
        console.log('Event clicked:', info.event.id);
        // V2: Abrir modal de detalle/edición
      },
    });

    calendar.render();
    calendarRef.value = noSerialize(calendar);

    cleanup(() => {
      calendar.destroy();
    });
  });

  return (
    <div
      ref={containerRef}
      class="fc-qwik-container min-h-[600px] rounded-lg border border-border bg-card p-4"
    />
  );
});
```

**Patrones Qwik cumplidos**:
- ✅ `useVisibleTask$` — Justificado: FullCalendar requiere DOM real
- ✅ `noSerialize()` — La instancia Calendar no es serializable
- ✅ `cleanup()` → `calendar.destroy()` — Previene memory leaks
- ✅ `eslint-disable` comentado — Reconocimiento explícito de excepción

### 4. `agenda/index.tsx` — Ruta orquestadora

```tsx
import { component$ } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';
import { CalendarView } from '~/features/calendar';
// import { AgendaService } from '~/lib/services/agenda.service';

/**
 * Loader: Carga eventos del calendario desde el servicio
 * V1: Datos mock. V2: AgendaService.getEvents(orgId, dateRange)
 */
export const useCalendarEvents = routeLoader$(async () => {
  // V1: Mock data - Reemplazar con servicio real
  return [
    {
      id: '1',
      title: 'Cita: Juan Pérez',
      start: new Date().toISOString().split('T')[0] + 'T10:00:00',
      end: new Date().toISOString().split('T')[0] + 'T11:00:00',
      color: 'hsl(211, 100%, 40%)',
      extendedProps: { type: 'appointment', contactName: 'Juan Pérez', status: 'confirmed' },
    },
    {
      id: '2',
      title: 'Llamada: María López',
      start: new Date().toISOString().split('T')[0] + 'T14:30:00',
      color: 'hsl(142, 76%, 32%)',
      extendedProps: { type: 'call', contactName: 'María López', status: 'pending' },
    },
  ];
});

export default component$(() => {
  const events = useCalendarEvents();

  return (
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-foreground">Agenda</h2>
      </div>
      <CalendarView events={events.value} />
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Agenda - Dashboard',
  meta: [{ name: 'description', content: 'Calendario de citas y eventos del agente IA' }],
};
```

### 5. `fullcalendar-theme.css` — Theme Override

```css
/**
 * FullCalendar Theme Override — HSL Design System
 * Integra los colores del dashboard con FullCalendar v6
 *
 * Importar en global.css: @import "./fullcalendar-theme.css";
 */

/* Toolbar */
.fc .fc-toolbar-title {
  font-family: Poppins, system-ui, sans-serif;
  color: hsl(var(--foreground));
  font-size: 1.25rem;
  font-weight: 600;
}

/* Botones del toolbar */
.fc .fc-button-primary {
  background-color: hsl(var(--primary));
  border-color: hsl(var(--primary));
  font-family: Poppins, system-ui, sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
}

.fc .fc-button-primary:hover {
  background-color: hsl(var(--primary-light));
  border-color: hsl(var(--primary-light));
}

.fc .fc-button-primary:not(:disabled).fc-button-active {
  background-color: hsl(var(--secondary));
  border-color: hsl(var(--secondary));
}

/* Grid */
.fc .fc-daygrid-day-number,
.fc .fc-col-header-cell-cushion {
  color: hsl(var(--foreground));
  font-family: Poppins, system-ui, sans-serif;
}

.fc .fc-daygrid-day.fc-day-today {
  background-color: hsl(var(--primary) / 0.08);
}

/* Bordes */
.fc th, .fc td, .fc .fc-scrollgrid {
  border-color: hsl(var(--border));
}

/* Eventos */
.fc .fc-event {
  border-radius: 4px;
  font-size: 0.8125rem;
  font-family: Roboto, system-ui, sans-serif;
}

/* Dark mode automático (hereda variables HSL) */
.dark .fc .fc-button-primary {
  background-color: hsl(var(--primary));
  border-color: hsl(var(--primary));
}

.dark .fc th, .dark .fc td, .dark .fc .fc-scrollgrid {
  border-color: hsl(var(--border));
}
```

---

## 📋 Checklist de Implementación

### Análisis de Normativa
- [x] Revisado `ARQUITECTURA_FOLDER.md` — Feature module en `src/features/calendar/`
- [x] Revisado `PROJECT_RULES_CORE.md` — Orchestrator pattern en ruta
- [x] Revisado `QUALITY_STANDARDS.md` — `useVisibleTask$` justificado para librería 3rd-party DOM-only

### Verificación Técnica (Context7)
- [x] FullCalendar v6 API validada: `Calendar` constructor, plugins modulares, `locale: esLocale`
- [x] Paquetes confirmados: `@fullcalendar/core`, `daygrid`, `timegrid`, `list`, `interaction`
- [x] Tipos TS incluidos en paquetes (no se necesitan `@types/*`)

---

### BASE DE DATOS (Agente: QwikDBA)

> **V1: No se requieren cambios de schema.** Los eventos se sirven como mock data.

- [ ] **Fase futura (V2)**: Tabla `appointments` con campos: `id`, `organization_id`, `title`, `start_at`, `end_at`, `type`, `contact_id`, `status`, `notes`, `created_by`, `created_at`, `updated_at`
- [ ] **Fase futura (V2)**: RLS policy: miembros solo ven citas de su organización

---

### LÓGICA Y RUTAS (Agente: QwikBuilder)

**Fase 1 — Instalación**
- [ ] Ejecutar `bun add @fullcalendar/core @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/list @fullcalendar/interaction`

**Fase 2 — Feature Module**
- [ ] Crear `src/features/calendar/types/calendar.types.ts`
- [ ] Crear `src/features/calendar/config/calendar.config.ts`
- [ ] Crear `src/features/calendar/components/calendar-view.tsx`
- [ ] Crear `src/features/calendar/index.ts` (barrel export)

**Fase 3 — Ruta**
- [ ] Crear `src/routes/(app)/dashboard/agenda/index.tsx` con `routeLoader$` (mock data V1) + `DocumentHead`

**Fase 4 — Estilos**
- [ ] Crear `src/assets/css/fullcalendar-theme.css`
- [ ] Importar en `global.css`: `@import "./fullcalendar-theme.css";`

**Fase 5 — Validación**
- [ ] `bun run build` sin errores
- [ ] Navegación desde sidebar "Agenda" carga el calendario
- [ ] Vistas: Mes, Semana, Día, Lista funcionan
- [ ] Locale español correcto (Lunes primer día, meses en español)
- [ ] Dark mode: colores respetan variables HSL
- [ ] Mobile: calendario responsive

---

## 🗺️ Roadmap futuro (fuera de V1)

| Versión | Feature |
|---------|---------|
| **V2** | Tabla `appointments` en BD + `AgendaService` real |
| **V2** | Modal crear/editar evento (dateClick → modal) |
| **V2** | Modal detalle evento (eventClick → modal) |
| **V3** | Drag & drop para mover/redimensionar citas |
| **V3** | Integración con llamadas Retell (auto-crear evento post-llamada) |
| **V3** | Sync bidireccional con Google Calendar |

---

## ⚠️ Riesgos y Mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| FullCalendar CSS choca con Tailwind | Theme override aislado en `fullcalendar-theme.css` con HSL variables |
| Bundle size incrementado | Plugins modulares (solo 4 plugins), tree-shaking automático de Vite |
| `useVisibleTask$` rompe resumability | Justificado per estándar (DOM-only 3rd party). `noSerialize()` + `cleanup()` |
| SSR: Calendar constructor falla en servidor | `useVisibleTask$` solo ejecuta en cliente — no hay riesgo |
