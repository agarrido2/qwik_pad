# Guía de Componentes UI - CVA Pattern

**Última Actualización:** 12 de febrero de 2026  
**Stack:** Qwik + CVA (Class Variance Authority) + Tailwind v4

---

## 📋 Índice

1. [Filosofía y Arquitectura](#filosofía-y-arquitectura)
2. [Patrón Canónico (CVA)](#patrón-canónico-cva)
3. [Catálogo de Componentes](#catálogo-de-componentes)
4. [Guía de Extensión](#guía-de-extensión)
5. [Mejores Prácticas](#mejores-prácticas)

---

## 1. Filosofía y Arquitectura

### 🎯 Principios del Sistema de Diseño

1. **Tipado Automático**: CVA genera tipos TypeScript desde las variantes CSS.
2. **Composición > Configuración**: Los componentes se componen, no se configuran.
3. **Separación de Responsabilidades**: UI pura, sin lógica de negocio.
4. **Accesibilidad Primero**: ARIA, keyboard navigation, semantic HTML.

### 📐 Ubicación en Arquitectura

```
src/components/ui/
  ├── button.tsx       → Botones con variantes semánticas
  ├── input.tsx        → Campos de formulario validables
  ├── select.tsx       → Dropdown personalizado con iconos
  ├── card.tsx         → Contenedores de contenido
  ├── alert.tsx        → Notificaciones contextuales
  ├── spinner.tsx      → Indicador de carga
  ├── form-field.tsx   → Wrapper de formulario Qwik City
  └── index.ts         → Barrel export
```

**Regla:** Componentes en `ui/` NUNCA importan de `lib/services` o `lib/db`.

---

## 2. Patrón Canónico (CVA)

### 🔧 Anatomía de un Componente UI

```tsx
/**
 * [Nombre] Component - [Descripción breve]
 * 
 * [Descripción extendida del propósito y comportamiento]
 * 
 * @example
 * // [Caso de uso principal]
 * <Component variant="..." size="...">
 *   ...
 * </Component>
 */

import { component$, Slot, type PropFunction } from '@builder.io/qwik'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '~/lib/utils/cn'

// 1. Definición de variantes con CVA
const componentVariants = cva(
  // Base: Clases compartidas por TODAS las variantes
  'base-classes focus-visible:ring-2 transition-all',
  {
    variants: {
      // Cada variant representa un estado/propósito semántico
      variant: {
        default: 'variant-specific-classes',
        // ...más variantes
      },
      size: {
        sm: 'size-specific-classes',
        default: 'size-specific-classes',
        lg: 'size-specific-classes',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

// 2. Interfaz con tipado automático desde CVA
export interface ComponentProps extends VariantProps<typeof componentVariants> {
  /** Clases CSS adicionales (composición vía cn()) */
  class?: string
  
  /** Props específicas del componente */
  disabled?: boolean
  onClick$?: PropFunction<() => void>
  
  /** Props de accesibilidad */
  'aria-label'?: string
}

// 3. Componente con destructuring y defaults
export const Component = component$<ComponentProps>(
  ({ variant, size, class: className, ...props }) => {
    return (
      <element class={cn(componentVariants({ variant, size }), className)} {...props}>
        <Slot />
      </element>
    )
  }
)
```

---

## 3. Catálogo de Componentes

### 🔘 Button

**Variantes:** `default`, `destructive`, `success`, `outline`, `secondary`, `ghost`, `link`  
**Tamaños:** `sm`, `default`, `lg`, `xl`, `icon`

```tsx
// Botón primario estándar
<Button variant="default" size="default">
  Guardar cambios
</Button>

// Botón destructivo (acciones peligrosas)
<Button variant="destructive" size="lg">
  Eliminar cuenta
</Button>

// Botón con loading state (patrón post-refactor)
<Button type="submit" disabled={action.isRunning}>
  {action.isRunning && <Spinner size="sm" />}
  Crear usuario
</Button>

// Botón ícono (sin texto)
<Button variant="ghost" size="icon" aria-label="Cerrar">
  <XIcon />
</Button>
```

**Micro-interacciones:**
- ✅ `active:scale-95` → Feedback táctil
- ✅ `hover:shadow-md` → Depth visual
- ✅ `duration-200` → Transición suave

---

### ⌨️ Input

**Variantes:** `default`, `error`, `success`  
**Tamaños:** `sm`, `default`, `lg`

```tsx
// Input básico con validación
<Input
  name="email"
  type="email"
  label="Email"
  placeholder="tu@email.com"
  required
  error={emailError.value}
/>

// Input con helper text
<Input
  name="username"
  label="Usuario"
  helperText="Solo letras y números (min. 3 caracteres)"
  variant="success"
/>

// Input compacto para tablas
<Input
  name="search"
  type="text"
  placeholder="Buscar..."
  size="sm"
/>
```

**Accesibilidad:**
- ✅ Asociación automática `label` → `input` via IDs únicos
- ✅ `aria-invalid` cuando hay error
- ✅ `aria-describedby` para error/helper text

---

### 📝 Select

**Variantes:** `default`, `error`, `success`  
**Tamaños:** `sm`, `default`, `lg`

```tsx
// Select con iconos y descripciones
<Select
  name="industry"
  label="Sector"
  options={[
    { 
      value: 'tech', 
      label: 'Tecnología', 
      icon: '💻', 
      description: 'Software y hardware' 
    },
    { 
      value: 'retail', 
      label: 'Retail', 
      icon: '🛍️', 
      description: 'Venta al por menor' 
    },
  ]}
  value={selectedIndustry.value}
  onChange$={(value) => { selectedIndustry.value = value }}
  error={industryError.value}
/>
```

---

### 🃏 Card

**Variantes:** `default`, `outlined`, `elevated`, `interactive`  
**Padding:** `none`, `sm`, `md`, `lg`

```tsx
// Card estándar
<Card variant="default" padding="md">
  <CardHeader>
    <CardTitle>Dashboard Metrics</CardTitle>
    <CardDescription>Últimos 30 días</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Contenido */}
  </CardContent>
  <CardFooter>
    <Button>Ver detalles</Button>
  </CardFooter>
</Card>

// Card interactiva (clickeable)
<Card variant="interactive" padding="lg">
  <h3>Feature destacado</h3>
  <p>Click para explorar</p>
</Card>

// Card con imagen full-width
<Card padding="none">
  <img src="hero.jpg" class="rounded-t-lg" />
  <div class="p-6">
    <h3>Título</h3>
  </div>
</Card>
```

---

### 🔔 Alert

**Variantes:** `info`, `success`, `warning`, `error`

```tsx
// Alert informativo
<Alert variant="info" title="Nueva característica">
  Ahora puedes exportar datos en CSV.
</Alert>

// Alert de error
<Alert variant="error">
  {loginAction.value?.message}
</Alert>

// Alert sin título
<Alert variant="success">
  Cambios guardados correctamente
</Alert>
```

**Iconos automáticos:** Cada variante tiene su ícono contextual (info: ℹ️, success: ✓, warning: ⚠️, error: ✗).

---

### ⏳ Spinner

**Tamaños:** `sm`, `md`, `lg`

```tsx
// En botón con loading
<Button disabled={isLoading.value}>
  {isLoading.value && <Spinner size="sm" />}
  Guardar
</Button>

// Overlay de pantalla completa
<div class="flex items-center justify-center h-screen">
  <Spinner size="lg" />
</div>

// Custom color (hereda currentColor)
<div class="text-green-500">
  <Spinner size="md" />
</div>
```

---

## 4. Guía de Extensión

### ➕ Añadir Nueva Variante a Componente Existente

**Ejemplo:** Añadir `variant="info"` a Button.

1. **Actualizar CVA:**
   ```tsx
   const buttonVariants = cva(
     'base-classes...',
     {
       variants: {
         variant: {
           // ... variantes existentes
           info: 'bg-blue-500 text-white hover:bg-blue-600 shadow rounded-md',
         },
       },
     }
   )
   ```

2. **TypeScript:** Automático. `VariantProps<typeof buttonVariants>` infiere el nuevo tipo.

3. **Documentación:** Actualizar este archivo con ejemplo de uso.

---

### 🆕 Crear Nuevo Componente UI

1. **Crear archivo:** `src/components/ui/badge.tsx`

2. **Estructura:**
   ```tsx
   import { component$, Slot } from '@builder.io/qwik'
   import { cva, type VariantProps } from 'class-variance-authority'
   import { cn } from '~/lib/utils/cn'

   const badgeVariants = cva(
     'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
     {
       variants: {
         variant: {
           default: 'bg-neutral-100 text-neutral-800',
           success: 'bg-green-100 text-green-800',
           error: 'bg-red-100 text-red-800',
         },
       },
       defaultVariants: { variant: 'default' },
     }
   )

   export interface BadgeProps extends VariantProps<typeof badgeVariants> {
     class?: string
   }

   export const Badge = component$<BadgeProps>(
     ({ variant, class: className }) => {
       return (
         <span class={cn(badgeVariants({ variant }), className)}>
           <Slot />
         </span>
       )
     }
   )
   ```

3. **Exportar:** Añadir a `src/components/ui/index.ts`
   ```tsx
   export { Badge, type BadgeProps } from './badge'
   ```

4. **Documentar:** Añadir sección a este archivo.

---

## 5. Mejores Prácticas

### ✅ Hacer

- **Usar CVA para variantes:** Inferencia automática de tipos.
- **Composición con `cn()`:** Permite override de clases sin conflictos.
- **Accesibilidad obligatoria:** `aria-label`, `role`, semantic HTML.
- **Loading states externos:** Usar `<Spinner />` en composición, no props internas.
- **Mobile-first:** `sm:`, `md:`, `lg:` breakpoints de Tailwind.

### ❌ Evitar

- **Lógica de negocio en UI:** No llamar services o DB.
- **Props booleanas para variantes:** Usar variantes semánticas (`variant="error"` en lugar de `isError={true}`).
- **Strings mágicos:** Record<> manual en lugar de CVA.
- **Hidratación innecesaria:** No usar `useVisibleTask$` para lógica visual.

---

## 📚 Referencias

- [CVA Docs](https://cva.style/docs)
- [Tailwind v4 Guide](../standards/TAILWIND_QWIK_GUIDE.md)
- [Arquitectura Folder](../standards/ARQUITECTURA_FOLDER.md)
- [Qwik Cheatsheet](../standards/CHEATSHEET_QWIK.md)

---

**Mantenido por:** QwikBuilder  
**Revisado por:** QwikArchitect  
**Próxima Revisión:** Cada actualización de componente
