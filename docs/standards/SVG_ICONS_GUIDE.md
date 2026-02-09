# Guía de Iconos SVG - Qwik

**Propósito**: Estándares para el uso de iconos SVG en la aplicación Qwik, garantizando código limpio, type-safety y rendimiento óptimo.

---

## 🎯 Estrategia de Implementación

### Patrón Principal: Componentes Type-Safe (Opción 3)

**Ubicación:** `src/components/icons/`

**Todos los iconos reutilizables** deben seguir este patrón:

```tsx
import type { PropsOf } from '@builder.io/qwik'

/**
 * Icono ChevronDown
 * @description Flecha hacia abajo, usado en accordions, dropdowns
 * 
 * @param props - Acepta todas las props de <svg> (class, aria-hidden, etc.)
 * @example
 * <ChevronDown aria-hidden="true" class="h-4 w-4" />
 */
export function ChevronDown(props: PropsOf<'svg'>, key: string) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      key={key}
    >
      <path d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export default ChevronDown
```

### Beneficios

1. **Type-Safety:** `PropsOf<'svg'>` garantiza que solo se pasen props válidas
2. **Flexibilidad:** Acepta todas las props de SVG (`class`, `aria-hidden`, `onClick$`, etc.)
3. **Theming:** `currentColor` hereda el color del texto padre automáticamente
4. **Tamaño:** `1em x 1em` se escala con `font-size` o clases Tailwind (`h-4 w-4`)
5. **Código Limpio:** Componentes sin SVG inline embebido

---

## 📋 Matriz de Decisión

| Caso de Uso | Solución | Ubicación | Ejemplo |
|-------------|----------|-----------|---------|
| **Iconos reutilizables** (chevrons, x, loader, etc.) | Componentes con `PropsOf<'svg'>` | `src/components/icons/` | `<ChevronDown />` |
| **Ilustraciones grandes** (hero, decoraciones) | Importación `?jsx` | `src/assets/images/` | `import Hero from '~/assets/hero.svg?jsx'` |
| **Logos únicos** con props limitadas | Const arrow function | Componente específico | `export const QwikLogo = ({ width, height }) => <svg>...</svg>` |
| **Iconos decorativos CSS** repetitivos | Data URI en CSS | `global.css` o módulo CSS | `.icon:before { background-image: url("data:image/svg...") }` |
| **SVG inline** | ❌ **PROHIBIDO** en componentes reutilizables | N/A | ❌ Solo en prototipos temporales |

---

## 🚀 Uso en Componentes

### Antes (❌ Código Sucio)

```tsx
// Button.tsx - SVG inline embebido
{loading && (
  <svg class="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" />
    <path fill="currentColor" d="M4 12a8 8 0 018-8V0..." />
  </svg>
)}
```

### Después (✅ Código Limpio)

```tsx
// Button.tsx - Componente importado
import { Loader } from '~/components/icons';

{loading && <Loader aria-hidden="true" class="mr-2 h-4 w-4 animate-spin" />}
```

---

## 📦 Iconos Disponibles

### Core Icons (`src/components/icons/`)

| Icono | Componente | Uso |
|-------|------------|-----|
| ▼ | `ChevronDown` | Accordions, dropdowns, sort indicators |
| ✕ | `X` | Cerrar modals, alerts, tags |
| ⟳ | `Loader` | Estados de carga (ya incluye `animate-spin`) |
| ☾ | `Moon` | Dark mode toggle (luna) |
| ☀ | `Sun` | Light mode toggle (sol) |
| 🔵🔴🟡🟢 | `GoogleLogo` | OAuth login button (Google brand colors) |
| ✓ | `Check` | Listas de features, confirmaciones |
| ⚠ | `AlertTriangle` | Warnings, trial expired |
| ⚡ | `Zap` | Upgrade, pro features |

### Agregar Nuevos Iconos

1. Crear archivo en `src/components/icons/IconName.tsx`
2. Seguir el patrón con `PropsOf<'svg'>`
3. Exportar en `src/components/icons/index.ts`
4. Actualizar esta tabla

**Plantilla:**

```tsx
import type { PropsOf } from '@builder.io/qwik'

/**
 * Icono [Nombre]
 * @description [Descripción de uso]
 */
export function IconName(props: PropsOf<'svg'>, key: string) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
      key={key}
    >
      {/* Path data */}
    </svg>
  )
}

export default IconName
```

---

## ♿ Accesibilidad

### Iconos Decorativos (mayoría)

```tsx
<ChevronDown aria-hidden="true" class="h-4 w-4" />
```

### Iconos con Significado Semántico

```tsx
<button aria-label="Cerrar modal">
  <X aria-hidden="true" class="h-4 w-4" />
</button>
```

**Regla:** El icono siempre tiene `aria-hidden="true"`. El `aria-label` va en el elemento padre (`button`, `a`, etc.).

---

## 🎨 Theming y Estilos

### Color

Los iconos usan `stroke="currentColor"` o `fill="currentColor"`:

```tsx
// Hereda color del texto padre
<p class="text-primary">
  <ChevronDown aria-hidden="true" class="h-4 w-4" />
</p>

// Override con class
<ChevronDown aria-hidden="true" class="h-4 w-4 text-error" />
```

### Tamaño

Base: `1em x 1em` (escala con font-size)

```tsx
// Con clases Tailwind (recomendado)
<ChevronDown class="h-4 w-4" />  // 16px
<ChevronDown class="h-6 w-6" />  // 24px

// Con font-size
<div class="text-2xl">
  <ChevronDown />  // Se escala automáticamente
</div>
```

### Animaciones

```tsx
// Clase Tailwind en el icono
<Loader class="h-5 w-5 animate-spin" />

// Transición CSS en contenedor
<div class="transition-transform [&[aria-expanded=true]>svg]:rotate-180">
  <ChevronDown class="h-4 w-4" />
</div>
```

---

## 📊 Performance

### Bundle Size

- **Componentes:** Tree-shaking automático (solo iconos usados se incluyen)
- **Data URI CSS:** Incluido en CSS bundle (cacheado)
- **`?jsx` imports:** Code splitting automático por Vite

### Optimización

1. ✅ Usar `stroke` en vez de `fill` cuando sea posible (menos path data)
2. ✅ Simplificar paths (herramientas: SVGOMG, svgo)
3. ✅ viewBox `0 0 24 24` estándar para consistencia
4. ❌ Evitar gradientes complejos o filtros (usar CSS si es necesario)

---

## 🔍 Auditoría

**Comando para buscar SVG inline:**

```bash
grep -r "svg xmlns" src/components/ui/ src/routes/
```

**Acción:** Migrar a componentes de `src/components/icons/`

---

## 📚 Referencias

- [Qwik Docs - Image Optimization](https://qwik.builder.io/docs/cookbook/media/)
- [WAI-ARIA: Using aria-hidden](https://www.w3.org/WAI/ARIA/apg/practices/hiding-semantics/)
- [Tailwind CSS: Sizing](https://tailwindcss.com/docs/width)