# Plan: Refactor Dashboard Header

**Fecha:** 2026-02-15  
**Estado:** 🟢 Implementado y validado  
**Agente Origen:** @QwikArchitect  
**Agentes Ejecución:** @QwikBuilder (no requiere @QwikDBA — 0 cambios de schema)

---

## 📋 Índice

1. [Contexto y Objetivos](#1-contexto-y-objetivos)
2. [Análisis de Normativa](#2-análisis-de-normativa)
3. [Arquitectura Propuesta](#3-arquitectura-propuesta)
4. [Fase 1: Icon Components](#fase-1-icon-components)
5. [Fase 2: Dropdown UI Component](#fase-2-dropdown-ui-component)
6. [Fase 3: Refactor Dashboard Header](#fase-3-refactor-dashboard-header)
7. [Fuera de Alcance (Explícito)](#fuera-de-alcance)
8. [Checklist de Implementación](#checklist-de-implementación)

---

## 1. Contexto y Objetivos

El `dashboard-header.tsx` actual tiene 217 líneas con **~80 líneas de SVG inline**, avatar hardcodeado como "U", y el dropdown del perfil implementado directamente sin componente UI reutilizable ni overlay click-outside.

### Objetivos
1. **Avatar dinámico** — Iniciales reales del usuario desde `AuthContext` (igual que `OrgSwitcher`)
2. **Dropdown como UI component** — Extraer a `src/components/ui/dropdown.tsx`
3. **SVGs a icon components** — Seguir patrón de `notification-icon.tsx` (función pura + `PropsOf<'svg'>`)
4. **Click-outside** — El nuevo componente Dropdown UI maneja overlay transparente (patrón OrgSwitcher)

### NO se toca (por decisión del usuario)
- Dark mode toggle → funcionalidad placeholder, se mantiene
- Notificaciones → botón se mantiene pero usa `NotificationIcon`
- Links a rutas inexistentes (`/dashboard/perfil`, `/dashboard/configuracion`) → se trabajará pronto
- Responsive del dashboard completo → tema separado (el usuario reconoce que afecta a todo el dashboard, no solo al header)

---

## 2. Análisis de Normativa

| Documento | Validación |
|---|---|
| `ARQUITECTURA_FOLDER.md` § Principio de Pureza | ✅ Los icon components y Dropdown UI son componentes puros sin lógica de negocio |
| `ARQUITECTURA_FOLDER.md` § src/components/ui/ | ✅ Dropdown se ubica en la capa UI existente |
| `ARQUITECTURA_FOLDER.md` § src/components/icons/ | ✅ Carpeta existente — los nuevos iconos siguen el patrón establecido |
| `PROJECT_RULES_CORE.md` | ✅ No se añade lógica de negocio a componentes visuales |
| `CHEATSHEET_QWIK.md` | ✅ `useSignal` para estado del dropdown, `Slot` named para composición |

### Verificación Externa (Context7)
- **No requerida** — No hay integraciones externas. Todo es UI pura con APIs estándar de Qwik (`Slot`, `useSignal`, `component$`).

---

## 3. Arquitectura Propuesta

### Convención de Icon Components

Dos patrones coexisten en el proyecto:

| Patrón | Archivo | Uso |
|---|---|---|
| **IconMap (Record)** | `dashboard-icons.tsx` | Sidebar — iconos mapeados por string key desde `menu-options.ts` |
| **Function Component** | `notification-icon.tsx`, `chevronDown-icon.tsx` | Uso directo en JSX — aceptan `PropsOf<'svg'>` + `key` |

**Decisión:** Los iconos del header usan el patrón **Function Component** (referencia: `notification-icon.tsx`):

```tsx
// Patrón canónico — función pura, NO component$
import type { PropsOf } from '@builder.io/qwik'

export function IconName(props: PropsOf<'svg'>, key: string) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props} key={key}>
      {/* paths */}
    </svg>
  )
}

export default IconName
```

**Razón:** Permite pasar `class`, `aria-hidden`, `aria-label` etc. de forma natural. Sin overhead de serialización QRL.

### Dropdown UI Component — API Design

```
src/components/ui/dropdown.tsx
```

**Patrón:** Compound component con named slots + overlay click-outside.

```tsx
// Uso previsto en dashboard-header.tsx
<Dropdown align="right">
  <button q:slot="trigger" class="..." aria-label="Menú de perfil">
    {/* avatar + nombre + chevron */}
  </button>
  
  <DropdownItem href="/dashboard/perfil">
    <UserIcon aria-hidden="true" class="h-4 w-4" />
    Mi perfil
  </DropdownItem>
  
  <DropdownItem href="/dashboard/configuracion">
    <SettingsIcon aria-hidden="true" class="h-4 w-4" />
    Configuración
  </DropdownItem>
  
  <DropdownSeparator />
  
  <DropdownItem variant="danger" onClick$={...}>
    <LogoutIcon aria-hidden="true" class="h-4 w-4" />
    Cerrar sesión
  </DropdownItem>
</Dropdown>
```

**Props del Dropdown:**

```tsx
interface DropdownProps {
  /** Alineación del panel respecto al trigger */
  align?: 'left' | 'right';
  /** Ancho del panel (default: 'w-48') */
  width?: string;
}
```

**Implementación interna:**
- `useSignal<boolean>` para estado open/closed
- `<Slot name="trigger" />` envuelto en div con `onClick$` toggle
- Overlay transparente `fixed inset-0 z-30` para click-outside (mismo patrón que `OrgSwitcher`)
- Panel posicionado con `absolute mt-2 z-40`
- Prop `align` controla `right-0` vs `left-0`
- El `Dropdown` expone `aria-expanded` en el wrapper del trigger

**Subcomponentes (export desde mismo archivo):**

| Componente | Responsabilidad |
|---|---|
| `Dropdown` | Contenedor con estado open/close, overlay, posicionamiento |
| `DropdownItem` | Item con soporte a `href` (Link) o `onClick$`, variante `danger` |
| `DropdownSeparator` | Línea divisoria `border-t` |

**Nota sobre Logout:** El logout actual usa `<Form action={logoutAction}>` con un button `type="submit"`. El `DropdownItem` debe poder envolver un `<Form>` internamente o usar `Slot` para contenido custom. Para simplificar, el logout se implementará como `Slot` directo dentro del Dropdown, no como `DropdownItem`.

### Mapa de Archivos

```
src/
├── components/
│   ├── icons/
│   │   ├── notification-icon.tsx    ← YA EXISTE (creado por usuario)
│   │   ├── chevronDown-icon.tsx     ← YA EXISTE
│   │   ├── dashboard-icons.tsx      ← YA EXISTE (no tocar)
│   │   ├── moon-icon.tsx            ← NUEVO
│   │   ├── user-icon.tsx            ← NUEVO
│   │   ├── settings-icon.tsx        ← NUEVO
│   │   └── logout-icon.tsx          ← NUEVO
│   ├── ui/
│   │   ├── dropdown.tsx             ← NUEVO
│   │   ├── index.ts                 ← EDITAR (añadir export)
│   │   └── ...
│   └── dashboard/
│       └── dashboard-header.tsx     ← REFACTORIZAR
```

---

## Fase 1: Icon Components

**Agente:** @QwikBuilder  
**Esfuerzo:** Bajo (~15 min)

### Tareas

- [ ] **Crear `src/components/icons/moon-icon.tsx`** — SVG de luna (dark mode). Extraer del SVG actual del header (L78-L89). Patrón: `notification-icon.tsx`
- [ ] **Crear `src/components/icons/user-icon.tsx`** — SVG de persona/perfil. Extraer del SVG actual del header (L141-L151). Patrón: `notification-icon.tsx`
- [ ] **Crear `src/components/icons/settings-icon.tsx`** — SVG de engranaje. Extraer del SVG actual del header (L160-L178). Patrón: `notification-icon.tsx`
- [ ] **Crear `src/components/icons/logout-icon.tsx`** — SVG de logout. Extraer del SVG actual del header (L189-L199). Patrón: `notification-icon.tsx`

### Referencia SVG Source

Los SVGs originales están en `dashboard-header.tsx`. Se pueden buscar versiones más limpias/consistentes en [icones.js.org](https://icones.js.org/) como recomienda el patrón de `notification-icon.tsx`, siempre que la semántica visual sea equivalente.

---

## Fase 2: Dropdown UI Component

**Agente:** @QwikBuilder  
**Esfuerzo:** Medio (~30 min)

### Tareas

- [ ] **Crear `src/components/ui/dropdown.tsx`** con los subcomponentes:
  - `Dropdown` — contenedor compound, named slot `"trigger"`, overlay click-outside, `align` prop
  - `DropdownItem` — soporta `href` (renderiza `<Link>`) o `onClick$` (renderiza `<button>`), props: `variant?: 'default' | 'danger'`, class pass-through
  - `DropdownSeparator` — separador visual

- [ ] **Editar `src/components/ui/index.ts`** — Añadir exports:
  ```ts
  export { Dropdown, DropdownItem, DropdownSeparator } from './dropdown';
  ```

### Criterios de Aceptación
- Overlay transparente cierra el dropdown al click-outside ✅
- `aria-expanded` en el div que envuelve el trigger ✅
- Animación sutil de entrada (opacity/scale transition) — opcional, no bloqueante
- Variante `danger` aplica `text-red-600 hover:bg-red-50` ✅
- Items con `href` renderizan `<Link>` de Qwik City ✅
- Items con `onClick$` renderizan `<button>` nativo ✅

---

## Fase 3: Refactor Dashboard Header

**Agente:** @QwikBuilder  
**Esfuerzo:** Medio (~30 min)

### Tareas

- [ ] **Avatar dinámico** — Reemplazar `"U"` hardcodeado (L103) con helper `getInitials()` que extraiga iniciales de `auth.user.fullName` (fallback: primer carácter de email). Mismo patrón que `OrgSwitcher`

- [ ] **Reemplazar SVGs inline por icon components:**

  | Líneas | SVG actual | Reemplazar con |
  |---|---|---|
  | L49-L63 | Bell notification | `<NotificationIcon aria-hidden="true" class="h-5 w-5" />` |
  | L78-L89 | Moon dark mode | `<MoonIcon aria-hidden="true" class="h-5 w-5" />` |
  | L113-L126 | Chevron down | `<ChevronDown aria-hidden="true" class={cn("h-4 w-4 ...", ...)} />` |
  | L141-L151 | User profile | `<UserIcon aria-hidden="true" class="h-4 w-4" />` |
  | L160-L178 | Settings gear | `<SettingsIcon aria-hidden="true" class="h-4 w-4" />` |
  | L189-L199 | Logout arrow | `<LogoutIcon aria-hidden="true" class="h-4 w-4" />` |

- [ ] **Usar `<Dropdown>` UI component** para el profile menu, reemplazando el div+signal+conditional render manual

- [ ] **Eliminar `useSignal` de `profileMenuOpen`** — el estado lo maneja internamente `<Dropdown>`

- [ ] **Eliminar import de `cn`** si ya no se usa (el Dropdown y los iconos manejan sus propias clases). Verificar antes de eliminar.

### Resultado Esperado

El header pasa de **~217 líneas** a **~70-80 líneas**, con:
- 0 SVGs inline
- Avatar con iniciales reales
- Dropdown reutilizable con click-outside
- Imports claros de icon components

---

## Fuera de Alcance

| Tema | Razón | Cuándo |
|---|---|---|
| Dark mode funcional | Usuario: "dejalo como esta" | Futura iteración |
| Notificaciones funcionales | Usuario: "dejalo como esta despues te digo" | Futura iteración |
| Links a `/dashboard/perfil` y `/dashboard/configuracion` | Usuario: "vamos a trabajar con esto dentro de poco" | Próxima sesión |
| Responsive del dashboard completo | "No solo el header está mal diseñado" — requiere plan propio | Plan separado |
| `left-72` hardcodeado | Forma parte del tema responsive global | Se soluciona en plan responsive |

---

## Checklist de Implementación

### ✅ Análisis de Normativa
- [x] Revisado `docs/standards/ARQUITECTURA_FOLDER.md` — icon components y UI dropdown en capas correctas
- [x] Revisado `docs/standards/PROJECT_RULES_CORE.md` — sin lógica de negocio en componentes visuales

### ✅ Verificación Técnica (Context7)
- [x] No requerida — 100% UI pura con APIs estándar de Qwik

### BASE DE DATOS (Agente: @QwikDBA)
- **No aplica** — 0 cambios de schema

### LÓGICA Y RUTAS (Agente: @QwikBuilder)
- [x] **Fase 1:** Crear 4 icon components en `src/components/icons/`
- [x] **Fase 2:** Crear `Dropdown` + `DropdownItem` + `DropdownSeparator` en `src/components/ui/dropdown.tsx`
- [x] **Fase 2:** Exportar desde `src/components/ui/index.ts`
- [x] **Fase 3:** Refactorizar `dashboard-header.tsx` — avatar, iconos, dropdown UI
- [x] **Verificación:** Build OK + Typecheck OK + Tests pass
