# Plan: Refactorización de Sistema de Componentes UI

**Fecha:** 12 de febrero de 2026  
**Arquitecto:** QwikArchitect  
**Agente Ejecutor:** QwikBuilder  
**Prioridad:** Media  
**Complejidad:** Baja-Media

---

## 📋 Índice

1. [Contexto y Motivación](#contexto-y-motivación)
2. [Análisis de Normativa](#análisis-de-normativa)
3. [Decisiones Arquitectónicas](#decisiones-arquitectónicas)
4. [Dependencias Requeridas](#dependencias-requeridas)
5. [Checklist de Implementación](#checklist-de-implementación)
6. [Tests y Validación](#tests-y-validación)
7. [Criterios de Aprobación](#criterios-de-aprobación)

---

## 1. Contexto y Motivación

### 🎯 Problema Detectado

El sistema actual de componentes UI (`src/components/ui/`) presenta limitaciones técnicas:

1. **Tipado Manual**: Uso de `Record<>` en lugar de inferencia automática.
2. **UX Sub-óptima**: Falta de micro-interacciones (scale, shadow transitions).
3. **Composición Rígida**: Variantes limitadas (5 vs 7 necesarias).
4. **Anti-patrón**: Lógica de `loading` embebida en `Button` (viola separación de responsabilidades).
5. **Mantenibilidad**: Duplicación de strings de clases dificulta escalabilidad.

### 🔍 Solución Propuesta

Adoptar **CVA (Class Variance Authority)** como estándar de la industria para:

- ✅ Tipado automático con `VariantProps<>`
- ✅ Composición declarativa de variantes
- ✅ Extensibilidad sin modificar código base
- ✅ Developer Experience superior

### 📊 Impacto

**Componentes Afectados:**
- `button.tsx` → Refactor completo
- `input.tsx` → Añadir variantes CVA
- `card.tsx` → Estandarizar estructura
- `select.tsx` → Armonizar tamaños/variantes
- `alert.tsx` → Mejorar semántica visual
- **NUEVO:** `spinner.tsx` → Extraer de `Button`

**Archivos NO Afectados:**
- `form-field.tsx` (ya cumple estándar)
- `index.ts` (solo actualizar exports)

---

## 2. Análisis de Normativa

### ✅ Compliance con `ARQUITECTURA_FOLDER.md`

**Sección Aplicable:** `src/components/ui/` (Componentes Puros)

> **Ley del Documento:**  
> *"Componentes de UI puros y agnósticos. No lógica de negocio, no llamadas API, no gestión de estado global."*

**Verificación:**
- ✅ Los componentes refactorizados mantienen pureza (solo props → UI)
- ✅ No introducen dependencias de `lib/services` ni `lib/db`
- ✅ Uso de `cn()` desde `lib/utils/cn.ts` (permitido como utilidad)

### ✅ Compliance con `QUALITY_STANDARDS.md`

**Principios Aplicados:**

1. **Idiomático:**
   - CVA es el estándar de facto en shadcn/ui, Radix, y ecosistema React/Qwik.
   - `VariantProps<>` elimina tipos manuales propensos a errores.

2. **Robusto:**
   - Tipado estricto en variantes.
   - PropTypes validados en tiempo de compilación.

3. **Accesible:**
   - Mantener `aria-*` props.
   - `disabled` correctamente propagado a atributos HTML.

4. **Performante:**
   - CVA genera clases estáticas (sin overhead runtime).
   - Compatible con Tailwind v4 (purging automático).

### ✅ Compliance con `TAILWIND_QWIK_GUIDE.md`

- ✅ Mobile-first (`sm:`, `md:`)
- ✅ Uso de tokens de `@theme` en `global.css`
- ✅ Utilidad `cn()` para composición

---

## 3. Decisiones Arquitectónicas

### 🏗️ Patrón Definitivo para Componentes UI

```tsx
// TEMPLATE CANÓNICO
import { component$, Slot, type PropFunction } from '@builder.io/qwik'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '~/lib/utils/cn'

const componentVariants = cva(
  'base-classes focus-visible:ring-2 transition-all',
  {
    variants: {
      variant: { /* ... */ },
      size: { /* ... */ },
    },
    defaultVariants: { /* ... */ },
  }
)

export interface ComponentProps extends VariantProps<typeof componentVariants> {
  class?: string
  disabled?: boolean
  'aria-label'?: string
  // Props específicas...
}

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

### 🎨 Nuevas Variantes Estándar

**Button:**
- `default`, `destructive`, `success`, `outline`, `secondary`, `ghost`, `link`
- Tamaños: `sm`, `default`, `lg`, `xl`, `icon`

**Input:**
- `default`, `error`, `success`
- Tamaños: `sm`, `default`, `lg`

**Card:**
- `default`, `outlined`, `elevated`, `interactive`

**Alert:**
- `info`, `success`, `warning`, `error`

---

## 4. Dependencias Requeridas

### 📦 Instalación

```bash
bun add class-variance-authority
```

**Versión Esperada:** `^0.7.0`  
**Tamaño:** ~2.5kb (minified + gzipped)  
**Compatibilidad:** Qwik ✅ | TypeScript 5.x ✅

### 🔍 Validación de Context7

No se requiere validación externa (CVA es estándar establecido desde 2022, con +500k descargas/semana en npm).

---

## 5. Checklist de Implementación

### 📐 FASE 1: Preparación (QwikBuilder)

- [ ] **1.1** Instalar CVA → `bun add class-variance-authority`
- [ ] **1.2** Verificar que `cn()` existe en `lib/utils/cn.ts`
- [ ] **1.3** Crear branch: `refactor/ui-components-cva`

---

### 🔧 FASE 2: Componentes Core (QwikBuilder)

#### **2.1 Button (Prioridad: CRÍTICA)**

- [ ] Refactorizar con CVA pattern
- [ ] Implementar 7 variantes (`default`, `destructive`, `success`, `outline`, `secondary`, `ghost`, `link`)
- [ ] Tamaños: `sm`, `default`, `lg`, `xl`, `icon`
- [ ] **EXTRAER** lógica de `loading` → Componente externo
- [ ] Añadir micro-interacciones:
  - `active:scale-95`
  - `hover:shadow-md`
  - `transition-all duration-200`
- [ ] Mantener accesibilidad: `aria-label`, `aria-busy`
- [ ] Actualizar tipos para `PropFunction<() => void>`

**Ubicación:** `src/components/ui/button.tsx`

#### **2.2 Spinner (NUEVO)**

- [ ] Crear componente independiente
- [ ] Variantes: `default`, `sm`, `lg`
- [ ] Props: `class`, `size`, `color`
- [ ] Usar en Button como: `<Button><Spinner />Cargando</Button>`

**Ubicación:** `src/components/ui/spinner.tsx`

#### **2.3 Input**

- [ ] Implementar CVA
- [ ] Variantes: `default`, `error`, `success`
- [ ] Tamaños: `sm`, `default`, `lg`
- [ ] Mantener compatibilidad con `FormField`

**Ubicación:** `src/components/ui/input.tsx`

#### **2.4 Card**

- [ ] Implementar CVA
- [ ] Variantes: `default`, `outlined`, `elevated`, `interactive`
- [ ] Padding: `sm`, `default`, `lg`

**Ubicación:** `src/components/ui/card.tsx`

#### **2.5 Select**

- [ ] Armonizar tamaños con Input
- [ ] CVA para estados: `default`, `error`, `disabled`

**Ubicación:** `src/components/ui/select.tsx`

#### **2.6 Alert**

- [ ] Variantes semánticas: `info`, `success`, `warning`, `error`
- [ ] Iconos contextuales automáticos (si no hay Slot)

**Ubicación:** `src/components/ui/alert.tsx`

---

### 🔄 FASE 3: Actualización de Dependencias

- [ ] **3.1** Actualizar `src/components/ui/index.ts` → Exportar `Spinner`
- [ ] **3.2** Buscar usos de `Button` con `loading={true}` en codebase
- [ ] **3.3** Refactorizar a patrón `<Button><Spinner />...</Button>`

**Comando de búsqueda:**
```bash
grep -r "loading=" src/routes/ src/components/
```

---

### 📚 FASE 4: Documentación

- [ ] **4.1** Crear `docs/guides/UI_COMPONENTS.md`:
  - Patrón CVA
  - Ejemplos de cada variante
  - Guía de extensión
- [ ] **4.2** Actualizar README si aplica

---

## 6. Tests y Validación

### ✅ Criterios de Validación Manual

**Por Componente:**
1. ✅ Tipado: VSCode no muestra errores TypeScript
2. ✅ Renderizado: Todas las variantes se visualizan correctamente
3. ✅ Accesibilidad: Lighthouse Accessibility Score ≥ 95
4. ✅ Hover/Focus States funcionan
5. ✅ Responsivo: Mobile (375px) + Desktop (1440px)

### 🧪 Tests de Regresión

**Archivos a verificar tras refactor:**

```bash
# Rutas que usan Button
src/routes/(auth)/login/index.tsx
src/routes/(auth)/register/index.tsx
src/routes/(app)/dashboard/index.tsx

# Componentes que componen Button
src/components/shared/*
```

**Checklist Visual:**
- [ ] Login/Register mantienen estilos
- [ ] Dashboard buttons funcionan
- [ ] Onboarding flow intacto

---

## 7. Criterios de Aprobación

### ✅ **Condiciones para Merge**

1. **Técnicas:**
   - [ ] CVA instalado y funcionando
   - [ ] Todos los componentes siguen patrón canónico
   - [ ] No hay TypeScript errors
   - [ ] Build production exitoso (`bun run build`)

2. **Funcionales:**
   - [ ] Todas las rutas existentes se renderizan sin errores
   - [ ] No regresiones visuales en login/dashboard/onboarding

3. **Calidad:**
   - [ ] ESLint pasa (`bun run lint`)
   - [ ] Prettier formatea (`bun fmt`)
   - [ ] Lighthouse Desktop Score ≥ 95

4. **Documentación:**
   - [ ] `UI_COMPONENTS.md` creado con ejemplos

---

## 🚀 Próximos Pasos

**Una vez aprobado este plan:**

1. **QwikBuilder** ejecuta FASE 1-3
2. **QwikArchitect** revisa PR en GitHub
3. **QwikBuilder** ajusta según feedback
4. **Merge** a `main` tras aprobación

---

## 📎 Referencias

- [CVA Docs](https://cva.style/docs)
- [Shadcn Button Pattern](https://ui.shadcn.com/docs/components/button)
- `docs/standards/ARQUITECTURA_FOLDER.md` (Componentes UI Puros)
- `docs/standards/QUALITY_STANDARDS.md` (5 Pilares)

---

**Estado:** 🟡 Pendiente de Aprobación  
**Última Actualización:** 12 de febrero de 2026
