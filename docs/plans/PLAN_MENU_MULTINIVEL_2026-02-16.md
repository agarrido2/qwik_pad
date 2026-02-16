# Plan: Menú Multi-Nivel (Grupos, Categorías, Separadores)

**Fecha:** 2026-02-16  
**Agente:** QwikArchitect  
**Dificultad:** 2/5  
**Estimación:** ~2 horas  
**Prerequisito:** Config-driven RBAC completado (2026-02-15)

---

## Índice
1. [Análisis de Normativa](#1-análisis-de-normativa)
2. [Verificación Técnica](#2-verificación-técnica)
3. [Arquitectura Propuesta](#3-arquitectura-propuesta)
4. [Modelo de Datos](#4-modelo-de-datos)
5. [Cambios por Archivo](#5-cambios-por-archivo)
6. [Asignación de Tareas](#6-asignación-de-tareas)

---

## 1. Análisis de Normativa

- [x] **`ARQUITECTURA_FOLDER.md`**: Verificado. Los cambios se limitan a `src/lib/config/` (tipos + config), `src/components/` (UI pura) y tests. No se añade lógica de negocio en rutas.
- [x] **Principio de Pureza**: El sidebar sigue siendo UI "tonta" — recibe datos filtrados del config, renderiza con props. Sin imports de DB/ORM/servicios.
- [x] **Principio de Orquestación**: Las rutas no se tocan. La protección sigue siendo via `checkRouteAccess` en middleware.
- [x] **`section` preservado**: Se mantiene la propiedad `section: 'main' | 'workspace'` por petición del usuario.

## 2. Verificación Técnica

- [x] **Qwik `useSignal`**: Validado via Context7. Se usa `useSignal<boolean>` para toggle de collapse/expand en grupos. Patrón estándar: `signal.value = !signal.value`.
- [x] **Qwik `useStore`**: Para rastrear qué grupos están expandidos (`Record<string, boolean>`). Referencia: Qwik docs state management.
- [x] **No se necesita `useVisibleTask$`**: El collapse/expand se maneja con CSS condicional + signals. Sin APIs del DOM. ✅ No rompe resumabilidad.
- [x] **Tailwind v4**: `group-*` variants no necesarios aquí. Se usa `cn()` con clases condicionales.

---

## 3. Arquitectura Propuesta

### 3.1 Estructura Visual del Menú

```
┌──────────────────────────────┐
│  Logo / Org Name             │
├──────────────────────────────┤
│  Avatar + Workspace Info     │
├──────────────────────────────┤
│  ── SECTION: main ─────────  │
│                              │
│  ▸ Dashboard                 │  ← item sin hijos (link directo)
│  ▸ Llamadas                  │  ← item sin hijos
│  ▾ Agente IA                 │  ← item CON hijos (expandible)
│     · Configuración          │  ← hijo nivel 2 (indentado)
│     · Flujos                 │  ← hijo nivel 2
│     · Base Conocimiento      │  ← hijo nivel 2
│  ─────────────────────────── │  ← separador (dividerAfter)
│  ▸ Números                   │
│  ▸ Integraciones             │
│                              │
├──────────────────────────────┤
│  ── SECTION: workspace ────  │
│                              │
│  ▸ Usuarios                  │
│  ▸ Configuración             │
│  ▸ Facturación               │
│  ─────────────────────────── │
│  ▸ Soporte                   │
│  ▸ Cerrar sesión             │
└──────────────────────────────┘
```

### 3.2 Reglas de Profundidad

| Nivel | Qué es | Comportamiento |
|-------|--------|----------------|
| **1** | Item raíz | Link directo (sin hijos) o grupo expandible (con hijos) |
| **2** | Item hijo | Siempre link directo. **Máximo**. No se permiten hijos de hijos. |

> **Restricción hard**: `children` de un `MenuItem` NO pueden tener su propio `children`. Se valida en runtime con `buildRouteMap()`.

### 3.3 RBAC en Hijos

- Cada `MenuItem` (padre o hijo) tiene su propio `roles[]`.
- Un padre se oculta si **ninguno** de sus hijos es visible para el rol actual.
- Un hijo se oculta individualmente si su `roles[]` no incluye el rol.
- Protección de rutas: los hijos con `href` se registran independientemente en `PROTECTED_ROUTES`.

### 3.4 Separadores

- `dividerAfter?: boolean` en cualquier item de nivel 1.
- Renderiza un `<hr>` temático después del item.
- No afecta la lógica de acceso, es puramente visual.

---

## 4. Modelo de Datos

### 4.1 Tipo `MenuItem` (actualizado)

```typescript
export interface MenuItem {
  /** Texto visible en la navegación */
  text: string;
  /** URL de destino (obligatorio en hijos, opcional en padres con children) */
  href?: string;
  /** Identificador del icono (mapeado a SVG en IconMap) */
  icon: string;
  /** Roles con acceso a esta ruta (type-safe!) */
  roles: MemberRole[];
  /** Sección del sidebar donde se muestra */
  section: 'main' | 'workspace';
  /** Badge numérico opcional (ej: notificaciones pendientes) */
  badge?: number;
  /** Sub-items (máx 1 nivel de profundidad). Si existen, el padre actúa como grupo expandible */
  children?: MenuItem[];
  /** Renderiza separador visual debajo de este item (solo nivel 1) */
  dividerAfter?: boolean;
}
```

**Cambios vs actual:**
- `href`: pasa de `string` a `string | undefined` (padres-grupo pueden no tener href propio)
- `children?: MenuItem[]`: nuevo
- `dividerAfter?: boolean`: nuevo

### 4.2 Ejemplo de Config con Hijos

```typescript
export const MENU_CONFIG: MenuItem[] = [
  // Item sin hijos — funciona exactamente como antes
  {
    text: 'Dashboard',
    href: '/dashboard',
    icon: 'home',
    roles: ['owner', 'admin', 'member'],
    section: 'main',
  },
  // Item CON hijos — actúa como grupo expandible
  {
    text: 'Agente IA',
    icon: 'bot',
    roles: ['owner', 'admin'],       // Restricción del grupo
    section: 'main',
    children: [
      {
        text: 'Configuración',
        href: '/dashboard/agente/config',
        icon: 'settings',
        roles: ['owner', 'admin'],
        section: 'main',
      },
      {
        text: 'Base Conocimiento',
        href: '/dashboard/agente/kb',
        icon: 'book',
        roles: ['owner', 'admin', 'member'],
        section: 'main',
      },
    ],
    dividerAfter: true,              // Separador después del grupo
  },
];
```

---

## 5. Cambios por Archivo

### 5.1 `src/lib/config/menu.config.ts`

| Cambio | Detalle |
|--------|---------|
| Tipo `MenuItem` | Añadir `children?`, `dividerAfter?`, hacer `href` opcional |
| `buildRouteMap()` | Traversal recursivo: registrar rutas de hijos en `PROTECTED_ROUTES` |
| `canAccessRoute()` | Sin cambios (ya busca por prefijo en `PROTECTED_ROUTES`, funciona con hijos) |
| `getVisibleMenu()` | Filtrar recursivamente: ocultar hijos sin permiso, ocultar padre si 0 hijos visibles |
| Exportar nuevo type | `MenuItemWithChildren` (tipo utility para componentes que necesiten discriminar) |

**`buildRouteMap` nuevo pseudocódigo:**
```typescript
function buildRouteMap() {
  function traverse(items: MenuItem[]) {
    for (const item of items) {
      if (item.href) {
        PROTECTED_ROUTES.push([item.href, item.roles]);
      }
      if (item.children) {
        traverse(item.children);
      }
    }
  }
  traverse(MENU_CONFIG);
  PROTECTED_ROUTES.sort((a, b) => b[0].length - a[0].length);
}
```

**`getVisibleMenu` nuevo pseudocódigo:**
```typescript
export function getVisibleMenu(role: MemberRole, section: 'main' | 'workspace'): MenuItem[] {
  return MENU_CONFIG
    .filter(item => item.section === section && item.roles.includes(role))
    .map(item => {
      if (!item.children) return item;
      const visibleChildren = item.children.filter(child => child.roles.includes(role));
      if (visibleChildren.length === 0) return null; // Padre sin hijos visibles → ocultar
      return { ...item, children: visibleChildren };
    })
    .filter(Boolean) as MenuItem[];
}
```

### 5.2 `src/components/dashboard/dashboard-sidebar.tsx`

| Cambio | Detalle |
|--------|---------|
| Estado expandido | `useStore<Record<string, boolean>>({})` para trackear qué grupos están abiertos |
| Renderizado items | Función `renderMenuItem` que discrimina: con hijos → grupo expandible, sin hijos → link directo |
| Indentación | Hijos tienen `pl-8` (padding-left extra) |
| Chevron icono | Padres con hijos muestran `▸` / `▾` rotado con `transition-transform` |
| Separadores | Si `item.dividerAfter`, renderiza `<hr class="my-2 border-neutral-200">` después |
| Auto-expand | Si un hijo está activo (`isActive(child.href)`), el padre se abre automáticamente |

**Estructura del componente:**

```tsx
// Dentro de DashboardSidebar component$
const expandedGroups = useStore<Record<string, boolean>>({});

// Auto-expand: si un hijo está activo, expandir su padre
for (const item of mainMenu) {
  if (item.children?.some(c => c.href && isActive(c.href))) {
    expandedGroups[item.text] = true;
  }
}

// Rendering
{mainMenu.map(item => (
  <div key={item.href ?? item.text}>
    {item.children ? (
      // GRUPO EXPANDIBLE
      <>
        <button onClick$={() => expandedGroups[item.text] = !expandedGroups[item.text]}>
          {renderIcon(item.icon)}
          {item.text}
          <ChevronIcon rotated={expandedGroups[item.text]} />
        </button>
        {expandedGroups[item.text] && (
          <div class="ml-4 space-y-1">
            {item.children.map(child => (
              <Link href={child.href} class="pl-4 ...">
                {renderIcon(child.icon)}
                {child.text}
              </Link>
            ))}
          </div>
        )}
      </>
    ) : (
      // LINK DIRECTO (sin cambios respecto a actual)
      <Link href={item.href} ...>
        {renderIcon(item.icon)}
        {item.text}
      </Link>
    )}
    {item.dividerAfter && <hr class="my-2 border-neutral-200" />}
  </div>
))}
```

### 5.3 `src/components/icons/dashboard-icons.tsx`

| Cambio | Detalle |
|--------|---------|
| Nuevo icono `chevron` | SVG de flecha para expand/collapse de grupos. Rotación via CSS `rotate-90`. |

### 5.4 `src/tests/unit/auth/guards.test.ts`

| Cambio | Detalle |
|--------|---------|
| Tests `canAccessRoute` | Añadir tests para rutas hijas (ej: `/dashboard/agente/config`) |
| Tests `getVisibleMenu` | Verificar que hijos se filtran por rol, padre se oculta si 0 hijos visibles |
| Tests `MENU_CONFIG validation` | Verificar que no hay `children` en items de nivel 2 (max depth = 2) |
| Tests separadores | Verificar presencia de `dividerAfter` en items esperados |

**Nuevos tests (pseudocódigo):**

```typescript
describe('multi-level menu', () => {
  it('child routes are registered in PROTECTED_ROUTES', () => {
    // Si hay un hijo con href='/dashboard/agente/config' y roles=['owner','admin']
    expect(canAccessRoute('admin', '/dashboard/agente/config')).toBe(true);
    expect(canAccessRoute('member', '/dashboard/agente/config')).toBe(false);
  });

  it('parent is hidden when no children visible for role', () => {
    // Si "Agente IA" tiene hijos todos con roles=['owner']
    // → getVisibleMenu('member', 'main') no incluye "Agente IA"
  });

  it('children are filtered independently by role', () => {
    // Padre visible pero hijo individual oculto por rol
  });

  it('max depth = 2 (no nested children)', () => {
    for (const item of MENU_CONFIG) {
      if (item.children) {
        for (const child of item.children) {
          expect(child.children).toBeUndefined();
        }
      }
    }
  });
});
```

### 5.5 Archivos NO tocados

| Archivo | Razón |
|---------|-------|
| `middleware.ts` | `canAccessRoute()` ya soporta hijos porque busca por startsWith. Sin cambios. |
| `guards.ts` | No tiene conocimiento del menú. Sin cambios. |
| `auth.context.ts` | No depende de la estructura del menú. Sin cambios. |
| `layout.tsx` (todos) | No renderizan menú directamente. Sin cambios. |

---

## 6. Asignación de Tareas

### Checklist de Implementación

- [x] **Análisis de Normativa**: Revisado `ARQUITECTURA_FOLDER.md`. Cumple al 100%.
- [x] **Verificación Técnica (Context7)**: Validado `useSignal`/`useStore` para toggle state. No se necesita `useVisibleTask$`. Resumabilidad preservada.

### Tareas para QwikBuilder

#### LÓGICA (`src/lib/config/menu.config.ts`)
- [x] Actualizar interface `MenuItem`: `href` opcional, `children?`, `dividerAfter?`
- [x] Actualizar `buildRouteMap()`: traversal recursivo de hijos
- [x] Actualizar `getVisibleMenu()`: filtrado recursivo, ocultar padre sin hijos visibles
- [x] (Opcional) Exportar type guard `hasChildren(item): item is MenuItem & { children: MenuItem[] }`
- [x] Añadir al menos un ejemplo de item con `children` en `MENU_CONFIG` (puede ser comentado)

#### UI (`src/components/`)
- [x] Añadir icono `chevron` a `dashboard-icons.tsx`
- [x] Refactorizar `dashboard-sidebar.tsx`:
  - `useStore<Record<string, boolean>>` para grupos expandidos
  - Auto-expand si hijo activo
  - Renderizado condicional: grupo expandible vs link directo
  - Separadores (`dividerAfter`)
  - Indentación hijos (`pl-8`)
  - Transición rotación chevron (`transition-transform duration-200`)

#### TESTS (`src/tests/unit/auth/guards.test.ts`)
- [x] Tests para `canAccessRoute` con rutas hijas
- [x] Tests para `getVisibleMenu` con hijos (filtrado por rol, padre oculto)
- [x] Test de validación: max depth = 2
- [x] Test de separadores en config

---

## Notas de Diseño

1. **Backward compatible**: Items sin `children` funcionan exactamente como antes. Migración gradual.
2. **Performance**: `buildRouteMap()` se ejecuta una sola vez al cargar el módulo. `getVisibleMenu()` es O(n) donde n = items totales (planos + hijos). Negligible.
3. **Accesibilidad**: Grupos expandibles usan `<button>` con `aria-expanded`. Hijos dentro de `<div role="group">`.
4. **Mobile**: El collapse/expand funciona igual en mobile. Futuro hamburger menu hereda esta estructura.
