# Plan: Estructura de Menú MVP + Principio de Flexibilidad

> **Agente**: @QwikArchitect  
> **Fecha**: 2026-02-15  
> **Estado**: ✅ IMPLEMENTADO (QwikBuilder)  
> **Handoff a**: @QwikAuditor (validación final), NO requiere @QwikDBA

---

## 📌 Índice

1. [Contexto y Principio Rector](#1-contexto-y-principio-rector)
2. [Estructura de Menú MVP](#2-estructura-de-menú-mvp)
3. [Asignación RBAC por Item](#3-asignación-rbac-por-item)
4. [Iconos Nuevos Requeridos](#4-iconos-nuevos-requeridos)
5. [Principio de Flexibilidad Sectorial](#5-principio-de-flexibilidad-sectorial)
6. [Impacto en Archivos](#6-impacto-en-archivos)
7. [Checklist de Implementación](#7-checklist-de-implementación)

---

## 1. Contexto y Principio Rector

### Decisiones Tomadas

- **Opción A (CMS hardcoded)**: El item "CMS" del menú será estático en MVP. No derivará dinámicamente de `AuthContext.organization.industry`.
- **Principio de Flexibilidad**: Los 6-7 sectores iniciales NO son definitivos. La app debe ser **sector-agnostic** en su arquitectura interna.
- **Config as Code**: Datos controlados por el dueño de producto (sectores, menú, planes de suscripción, etc.) van a **archivos de configuración tipados** (`src/lib/config/*.config.ts`), NO a base de datos. Ver §5 para detalle completo.
- **Landing page**: Es tonta (sin operatividad). Las menciones a sectores en landing NO afectan la arquitectura de la app.

### Principios Rectores

> **P1: "Hardcodea hoy, diseña la abstracción para mañana."**

Toda pieza hardcoded en MVP debe:
1. Vivir en UN solo lugar (single source of truth)
2. Usar interfaces que NO asuman valores fijos (ej: `industry: string | null`, nunca union types)

> **P2: "Si lo decide el Product Owner → config file. Si lo decide el usuario → DB."**

Criterio para decidir dónde vive un dato:
- ¿Cambia con release del producto? → `src/lib/config/*.config.ts` (git, deploy)
- ¿Cambia por acción del usuario final? → tabla en DB (Supabase/Drizzle)

**El schema ya lo cumple**: `organizations.industry` es `text` (no enum rígido). Flexible para recibir cualquier slug de config.

---

## 2. Estructura de Menú MVP

```
┌─────────────────────────────────────────────┐
│  MAIN SECTION                               │
│                                             │
│  📊 Dashboard ▾            [all]            │
│     📅 Agenda              (hereda)         │
│     📈 Analítica           (hereda)         │
│  ─────────────── separator ──────────────── │
│  📥 Buzón                  [all]            │
│  👤 Contactos              [all]            │
│  🏢 CMS                   [all]            │
│  🤖 Agente IA ▾           [owner, admin]   │
│     📞 Teléfonos           (hereda)         │
│     🔀 Prompt / Flujo      (hereda)         │
│     📚 Base Conocimiento   (hereda)         │
│  ─────────────── separator ──────────────── │
│                                             │
│  WORKSPACE SECTION                          │
│                                             │
│  ⚙️ Configuración          [owner, admin]   │
│  🧩 Integraciones          [owner, admin]   │
│  🏛️ Organización           [owner]          │
│  👥 Equipo                 [owner, admin]   │
│  💳 Facturación            [owner]          │
│                                             │
│  ─────────────── hardcoded ──────────────── │
│  🛟 Soporte               (fuera de config) │
│  🚪 Cerrar sesión         (fuera de config) │
└─────────────────────────────────────────────┘
```

### Rutas correspondientes

| Item               | `href`                              | Grupo padre? |
|--------------------|------------------------------------|:---:|
| Dashboard          | —                                  | ▾ |
| → Agenda           | `/dashboard/agenda`                | hijo |
| → Analítica        | `/dashboard/analitica`             | hijo |
| Buzón              | `/dashboard/buzon`                 | — |
| Contactos          | `/dashboard/contactos`             | — |
| CMS                | `/dashboard/cms`                   | — |
| Agente IA          | —                                  | ▾ |
| → Teléfonos        | `/dashboard/agente/telefonos`      | hijo |
| → Prompt / Flujo   | `/dashboard/agente/flujos`         | hijo |
| → Base Conocimiento| `/dashboard/agente/kb`             | hijo |
| Configuración      | `/dashboard/configuracion`         | — |
| Integraciones      | `/dashboard/integraciones`         | — |
| Organización       | `/dashboard/organizacion`          | — |
| Equipo             | `/dashboard/equipo`                | — |
| Facturación        | `/dashboard/facturacion`           | — |

---

## 3. Asignación RBAC por Item

| Item | Roles explícitos | Roles efectivos (con herencia) |
|---|---|---|
| Dashboard (grupo) | `['owner','admin','member']` | — |
| → Agenda | _(hereda)_ | `['owner','admin','member']` |
| → Analítica | _(hereda)_ | `['owner','admin','member']` |
| Buzón | `['owner','admin','member']` | — |
| Contactos | `['owner','admin','member']` | — |
| CMS | `['owner','admin','member']` | — |
| Agente IA (grupo) | `['owner','admin']` | — |
| → Teléfonos | _(hereda)_ | `['owner','admin']` |
| → Prompt / Flujo | _(hereda)_ | `['owner','admin']` |
| → Base Conocimiento | _(hereda)_ | `['owner','admin']` |
| Configuración | `['owner','admin']` | — |
| Integraciones | `['owner','admin']` | — |
| Organización | `['owner']` | — |
| Equipo | `['owner','admin']` | — |
| Facturación | `['owner']` | — |

**Nota**: Ningún hijo necesita restringir más que su padre en esta estructura. Todos heredan.

---

## 4. Iconos Nuevos Requeridos

Iconos actuales disponibles en `IconMap`: `home`, `phone`, `bot`, `hash`, `puzzle`, `book`, `settings`, `credit-card`, `logout`, `support`, `users`, `chevron`.

### Iconos a AÑADIR

| Key icon | Uso | SVG sugerido (Heroicons outline) |
|---|---|---|
| `calendar` | Agenda | CalendarIcon |
| `chart` | Analítica | ChartBarIcon |
| `inbox` | Buzón | InboxIcon |
| `contact` | Contactos | UserCircleIcon |
| `building` | CMS / Organización | BuildingOfficeIcon |
| `workflow` | Prompt / Flujo | ArrowPathRoundedSquareIcon o similar |

### Iconos EXISTENTES reutilizados

| Key existente | Uso nuevo |
|---|---|
| `home` | → ya no se usa directamente (Dashboard pasa a ser grupo con icono `chart` o `home`) |
| `hash` | → Teléfonos (renombrar uso, no el icono) |
| `book` | → Base Conocimiento (mantener) |
| `settings` | → Configuración (mantener) |
| `puzzle` | → Integraciones (mantener) |
| `users` | → Equipo (mantener) |
| `credit-card` | → Facturación (mantener) |

**Decisión**: Dashboard grupo usará `home` (mantener familiaridad). `chart` para Analítica como hijo.

---

## 5. Principio "Config as Code" (Decisión Arquitectónica)

### Principio

> **Datos que controla el dueño del producto y cambian con poca frecuencia → archivos de configuración tipados, NUNCA base de datos.**

**Justificación:**
- Zero latencia (no hay query, no hay roundtrip)
- Tipado estricto en compilación (errores en build, no en runtime)
- Versionado en git (historial, rollback, code review)
- Sin migrations para cambiar un label o añadir un sector
- Deploy = el cambio está live

**¿Cuándo SÍ va a DB?** Solo cuando el dato lo controla el usuario final (ej: configuración de su agente, contactos, llamadas).

### Catálogo de Config Files

| Archivo | Propósito | Existe? |
|---|---|:---:|
| `src/lib/config/menu.config.ts` | Menú del dashboard + RBAC de rutas | ✅ |
| `src/lib/config/industries.config.ts` | Catálogo de sectores/industrias | 🔜 Crear |
| _(futuros)_ | Planes de suscripción, templates de onboarding, etc. | — |

### `industries.config.ts` (a crear por @QwikBuilder cuando se necesite)

```ts
// src/lib/config/industries.config.ts
// Catálogo de sectores - Source of Truth
// Reemplaza: industrySectorEnum (schema), industry_types (tabla DB)

export interface IndustryConfig {
  slug: string;        // 'concesionario', 'clinica', etc.
  name: string;        // 'Concesionario de Vehículos'
  icon: string;        // Emoji o icon key
  description?: string;
}

export const INDUSTRIES: IndustryConfig[] = [
  { slug: 'concesionario', name: 'Concesionario de Vehículos', icon: '🚗' },
  { slug: 'inmobiliaria',  name: 'Inmobiliaria',               icon: '🏠' },
  { slug: 'retail',        name: 'Retail y Distribución',      icon: '🛒' },
  { slug: 'alquiladora',   name: 'Empresa Alquiladora',        icon: '🔑' },
  { slug: 'sat',           name: 'Servicio Técnico (SAT)',      icon: '🔧' },
  { slug: 'despacho',      name: 'Despacho Profesional',        icon: '⚖️' },
  { slug: 'clinica',       name: 'Clínica / Centro Médico',     icon: '🏥' },
  // Añadir nuevos sectores aquí — NO requiere migration ni cambio de schema
];

// Helpers
export const getIndustryBySlug = (slug: string) =>
  INDUSTRIES.find((i) => i.slug === slug);
export const getIndustryNames = () =>
  INDUSTRIES.map((i) => ({ value: i.slug, label: i.name, icon: i.icon }));
```

### Impacto en Schema (decisión pendiente para @QwikDBA)

| Componente DB actual | Decisión |
|---|---|
| `industrySectorEnum` (pgEnum) | **DEPRECAR a futuro.** El enum fuerza migration para añadir sectores. En MVP se mantiene por compatibilidad con onboarding existente. Migración futura: `organizations.industry` pasa a leer de `industries.config.ts` y el enum se elimina. |
| `industry_types` tabla | **DEPRECAR a futuro.** Reemplazada por `industries.config.ts`. No invertir más esfuerzo en esta tabla. |
| `organizations.industry` (text) | **Mantener como `text`.** Ya es flexible. El valor almacenado será el `slug` del config. |

> ⚠️ La deprecación de enum/tabla es para un sprint futuro. NO se toca en esta tarea.

### Reglas para @QwikBuilder

1. **En `menu.config.ts`**: El item CMS lleva comentario `// MVP: texto fijo — futuro: condicionado por org.industry`
2. **No crear tipos/interfaces que listen sectores como union types**: Usar `string`, nunca `'concesionario' | 'inmobiliaria'`
3. **No importar `industrySectorEnum`** en código de app (solo en schema y onboarding legacy). La app interna trabaja con `organization.industry: string | null`
4. **Si una feature depende del sector** (ej: "solo concesionarios ven X"), hacerlo por flag genérico o leer de config, nunca por string comparison hardcoded disperso
5. **Nuevos catálogos estáticos** → siempre en `src/lib/config/*.config.ts`, nunca en tablas DB

---

## 6. Impacto en Archivos

### Archivos a MODIFICAR (asignados a @QwikBuilder)

| Archivo | Cambio |
|---|---|
| `src/lib/config/menu.config.ts` | Reemplazar `MENU_CONFIG` completo con estructura MVP |
| `src/components/icons/dashboard-icons.tsx` | Añadir 6 iconos nuevos al `IconMap` |
| `src/components/dashboard/dashboard-sidebar.tsx` | Revisar que renderiza correctamente la nueva estructura (mínimo cambio esperado) |
| `src/tests/unit/auth/guards.test.ts` | Actualizar tests de `canAccessRoute` y `getVisibleMenu` para las nuevas rutas |

### Archivos que NO cambian

- `src/lib/auth/guards.ts` — funciones puras, no dependen de rutas concretas
- `src/lib/auth/middleware.ts` — genérico, lee de config
- `src/lib/context/auth.context.ts` — ya expone `industry: string | null`
- `src/routes/(app)/dashboard/layout.tsx` — middleware genérico

### Rutas nuevas (src/routes/) — NO crear aún

Las carpetas de rutas (`/dashboard/agenda/`, `/dashboard/buzon/`, etc.) se crearán cuando se implemente cada feature. El menú puede apuntar a rutas que aún no existen (404 hasta que se creen). Esto es intencional: **el menú define la estructura futura**.

---

## 7. Checklist de Implementación

### Análisis de Normativa
- [x] Revisado `docs/standards/ARQUITECTURA_FOLDER.md` — cambios solo en `lib/config`, `components/icons`, `components/dashboard`
- [x] Revisado `docs/standards/PROJECT_RULES_CORE.md` — sin violaciones
- [x] Verificación Context7 — N/A (sin librerías externas nuevas)
- [x] Principio "Config as Code" documentado — catálogos de producto en `src/lib/config/*.config.ts`, NO en DB

### BASE DE DATOS (Agente: @QwikDBA)
- [x] **No se requieren cambios de schema para esta tarea.** El schema actual (`industry: text`, `industry_types` table) ya soporta flexibilidad.

### LÓGICA Y UI (Agente: @QwikBuilder)
- [x] **Tarea 1**: Actualizar `MENU_CONFIG` en `menu.config.ts` con la estructura MVP completa (§2)
  - Incluir comentario `// MVP: hardcoded` en item CMS
  - 2 grupos expandibles (Dashboard, Agente IA)
  - 2 separadores (`dividerAfter: true`)
  - Rutas correctas según tabla §2
- [x] **Tarea 2**: Añadir 6 iconos nuevos a `IconMap` en `dashboard-icons.tsx` (§4)
  - `calendar`, `chart`, `inbox`, `contact`, `building`, `workflow`
  - Mismo patrón: SVG outline, `h-5 w-5`, `stroke="currentColor"`
- [x] **Tarea 3**: Verificar `dashboard-sidebar.tsx` renderiza correctamente
  - Dos grupos expandibles funcionan en paralelo
  - Separadores se muestran correctamente
  - Auto-expand del grupo activo sigue funcionando
- [x] **Tarea 4**: Actualizar tests unitarios
  - Tests con rutas nuevas del MVP
  - Verificar herencia en ambos grupos
  - Verificar filtrado por rol (member no ve Agente IA ni workspace items)
- [x] **Tarea 5**: Build + lint sin errores

---

## Apéndice: MENU_CONFIG Concreto (referencia para @QwikBuilder)

```ts
export const MENU_CONFIG: MenuItem[] = [
  // ── Main Section ──────────────────────────────────────────
  {
    text: 'Dashboard',
    icon: 'home',
    roles: ['owner', 'admin', 'member'],
    section: 'main',
    children: [
      { text: 'Agenda',    href: '/dashboard/agenda',    icon: 'calendar' },
      { text: 'Analítica', href: '/dashboard/analitica',  icon: 'chart'    },
    ],
    dividerAfter: true,
  },
  {
    text: 'Buzón',
    href: '/dashboard/buzon',
    icon: 'inbox',
    roles: ['owner', 'admin', 'member'],
    section: 'main',
  },
  {
    text: 'Contactos',
    href: '/dashboard/contactos',
    icon: 'contact',
    roles: ['owner', 'admin', 'member'],
    section: 'main',
  },
  {
    // MVP: hardcoded — futuro: condicionado por org.industry o eliminado
    text: 'CMS',
    href: '/dashboard/cms',
    icon: 'building',
    roles: ['owner', 'admin', 'member'],
    section: 'main',
  },
  {
    text: 'Agente IA',
    icon: 'bot',
    roles: ['owner', 'admin'],
    section: 'main',
    children: [
      { text: 'Teléfonos',          href: '/dashboard/agente/telefonos', icon: 'hash'     },
      { text: 'Prompt / Flujo',     href: '/dashboard/agente/flujos',    icon: 'workflow'  },
      { text: 'Base Conocimiento',  href: '/dashboard/agente/kb',        icon: 'book'      },
    ],
    dividerAfter: true,
  },

  // ── Workspace Section ─────────────────────────────────────
  {
    text: 'Configuración',
    href: '/dashboard/configuracion',
    icon: 'settings',
    roles: ['owner', 'admin'],
    section: 'workspace',
  },
  {
    text: 'Integraciones',
    href: '/dashboard/integraciones',
    icon: 'puzzle',
    roles: ['owner', 'admin'],
    section: 'workspace',
  },
  {
    text: 'Organización',
    href: '/dashboard/organizacion',
    icon: 'building',
    roles: ['owner'],
    section: 'workspace',
  },
  {
    text: 'Equipo',
    href: '/dashboard/equipo',
    icon: 'users',
    roles: ['owner', 'admin'],
    section: 'workspace',
  },
  {
    text: 'Facturación',
    href: '/dashboard/facturacion',
    icon: 'credit-card',
    roles: ['owner'],
    section: 'workspace',
  },
];
```

---

> **Siguiente paso**: Si aprobado, pasar testigo a **@QwikBuilder** para ejecutar Tareas 1-5.
