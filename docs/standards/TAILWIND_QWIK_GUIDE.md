# Guía de Tailwind CSS v4 para Qwik

**Propósito**: Este documento establece los patrones y directivas para la integración y personalización de **Tailwind CSS v4** en un proyecto Qwik. Está optimizado para ser una base de conocimiento para una IA, enfocándose en la nueva arquitectura de configuración "zero-JS" de Tailwind v4 y la flexibilidad de estilos híbridos.

---
## PARTE 1: CONFIGURACIÓN FUNDAMENTAL

---
### AI USAGE RULES — CONFIGURACIÓN BASE TAILWIND v4
- Tailwind CSS v4 utiliza un modelo de configuración **CSS-first**.
- NO asumir la existencia de `tailwind.config.js`.
- NO definir tokens de diseño en JavaScript.
- Toda la configuración base DEBE vivir en `src/assets/css/global.css`.
---


Tailwind CSS v4 simplifica drásticamente la configuración inicial, eliminando la necesidad de un archivo `tailwind.config.js` para el funcionamiento básico.

### 1.1 Mecanismo de Configuración en v4

El cambio fundamental en Tailwind v4 es que la configuración y las personalizaciones se realizan directamente en el archivo CSS principal.

1.  **Archivo de Entrada**: El único punto de entrada necesario es `src/assets/global.css`.
2.  **Directiva `@import`**: Para habilitar todo el conjunto de utilidades por defecto de Tailwind, la primera línea del archivo `src/assets/global.css` debe ser:
    ```css
    @import "tailwindcss";
    ```
    Esta directiva es procesada en tiempo de compilación por el plugin de PostCSS de Tailwind.

### 1.2 El Rol del `tailwind.config.ts` en v4

El archivo `tailwind.config.ts` (o `.js`) **es completamente opcional en la v4**. Su uso se reserva para casos de uso avanzados que no se pueden definir en CSS.

  * **No se usa para**: Definir colores, fuentes, espaciado, breakpoints o cualquier valor del tema.
  * **Se usa para**: Configurar **plugins** de Tailwind o integraciones con herramientas externas. Para la mayoría de los proyectos, **no es necesario**.

-----

## PARTE 2: PERSONALIZACIÓN DEL TEMA VÍA CSS

---
### AI USAGE RULES — SISTEMA DE DISEÑO

- Los tokens de diseño DEBEN definirse como variables CSS.
- Tailwind genera utilidades a partir de CSS, no de JavaScript.
- Preferir tokens semánticos frente a valores “raw”.
---

La personalización del sistema de diseño se realiza a través de la directiva `@theme` en `src/assets/css/global.css`.

### 2.1 Colores (`colors`)

Se definen nuevos colores o se sobreescriben los existentes.

  * **Sintaxis**:
    ```css
    @theme {
      --color-primary: #007bff;
      --color-secondary: #6c757d;
      --color-brand-accent: #ff4500;
    }
    ```
  * **Uso en Componentes Qwik**: Tailwind genera automáticamente las clases de utilidad (`bg-primary`, `text-secondary`, `border-brand-accent`, etc.).
    ```tsx
    <button class="bg-primary text-white hover:bg-brand-accent">
      Botón Primario
    </button>
    ```

### 2.2 Fuentes (`fontFamily`)

Se definen las pilas de fuentes para las utilidades `font-*`.

  * **Sintaxis**:
    ```css
    @theme {
      --font-family-sans: "Inter", system-ui, sans-serif;
      --font-family-serif: "Georgia", serif;
    }
    ```
  * **Uso en Componentes Qwik**:
    ```tsx
    <p class="font-sans">Texto principal.</p>
    ```

### 2.3 Breakpoints (`screens`)

Se definen los breakpoints para el diseño responsivo.

  * **Sintaxis**:
    ```css
    @theme {
      --screen-md: 768px;
      --screen-lg: 1024px;
    }
    ```
  * **Uso en Componentes Qwik**:
    ```tsx
    <div class="w-full lg:w-1/2">...</div>
    ```

-----

## PARTE 3: THEMES (MODO CLARO/OSCURO)

El patrón canónico para implementar temas se basa exclusivamente en variables de CSS y la directiva `@theme`.

---
## AI USAGE RULES — THEMING

- El dark mode se implementa SOLO con variables CSS.
- NO duplicar estilos por tema.
- El cambio de tema se basa únicamente en la clase .dark en <html>.
---

### 3.1 Definición de Variables de Tema

En `src/assets/global.css`, se definen las variables para el tema por defecto (`:root`) y se sobreescriben para el tema oscuro (`.dark`).

```css
@import "tailwindcss";

@layer base {
  :root {
    --background: 0 0% 100%; /* blanco */
    --foreground: 222.2 84% 4.9%; /* negro */
    --primary: 222.2 47.4% 11.2%;
  }

  .dark {
    --background: 222.2 84% 4.9%; /* negro */
    --foreground: 210 40% 98%; /* blanco */
    --primary: 210 40% 98%;
  }
}
```

### 3.2 Conexión de Variables al Tema de Tailwind

Para que Tailwind genere clases de utilidad semánticas (ej. `bg-background`), se referencian estas variables dentro de la directiva `@theme`. **Este paso reemplaza la configuración en `tailwind.config.ts`**.

```css
@theme {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-primary: hsl(var(--primary));
}
```

Ahora puedes usar clases como `bg-background`, `text-foreground` y `text-primary` en tus componentes.

### 3.3 Implementación del Interruptor de Tema en Qwik

---
### AI USAGE RULES — LÓGICA CLIENTE (EXCEPCIÓN JUSTIFICADA)

- useVisibleTask$ está PERMITIDO aquí por acceso a DOM y localStorage.
- NO usar useVisibleTask$ fuera de estos casos.
---

El componente para cambiar el tema sigue siendo el mismo, ya que su función es simplemente alternar la clase `.dark` en el elemento `<html>` y persistir la preferencia.

```tsx
import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';

export const ThemeToggle = component$(() => {
  const theme = useSignal<'light' | 'dark'>('light');

  // Lee el tema guardado al cargar en el cliente
  useVisibleTask$(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    theme.value = savedTheme;
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  });

  const toggleTheme = $(() => {
    const newTheme = theme.value === 'light' ? 'dark' : 'light';
    theme.value = newTheme;
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  });

  return (
    <button onClick$={toggleTheme}>
      {theme.value === 'light' ? '🌙' : '☀️'}
    </button>
  );
});
```

---
## PARTE 4: REGLAS DE INTEROPERABILIDAD (TAILWIND + MOTION)

---
### AI USAGE RULES — ANIMACIONES

- Tailwind: transiciones simples basadas en estado.
- Motion One [https://motion.dev/]: animaciones JS complejas.
- NUNCA animar la misma propiedad con ambos.
---

**Directiva Principal**: Tailwind y Motion One deben colaborar, no competir. Motion One gestiona animaciones complejas (basadas en JS) y Tailwind gestiona animaciones simples (basadas en CSS).

### Regla 1: Transiciones de Estado (CSS/Tailwind)

**Cuándo usar Tailwind (`transition-`):**
Usa las utilidades `transition` de Tailwind **solo** para animaciones simples basadas en cambios de estado o pseudo-clases de CSS.

* **Hover y Focus**: `hover:scale-105 transition-transform`
* **Modo Oscuro**: Animar el cambio de `bg-background`.
* **Clases Condicionales (Scroll)**: Perfecto para tu **Header con Glassmorphism**. El cambio de `isScrolled` (que añade/quita clases `bg-transparent` o `bg-gray-900/50`) debe ser animado con `transition-all duration-300` en el CSS del Header.

### Regla 2: Animaciones de Entrada y Secuencias (JS/Motion)

**Cuándo usar Motion One (`animate()`):**
Usa `animate()`, `timeline()` o `scroll()` de Motion One para todas las animaciones de "entrada" (al aparecer) y para secuencias coreografiadas.

* **Animaciones "On Reveal"**: *Siempre* usa `useVisibleTask$` + `animate()`.
* **Scrollytelling**: *Siempre* usa `useVisibleTask$` + `scroll()`.
* **Animaciones Coreografiadas**: *Siempre* usa `useVisibleTask$` + `timeline()`.

**Regla de Oro**: Si un elemento va a ser controlado por `animate()` de Motion One, **NO DEBES** añadirle clases de `transition-*` de Tailwind que afecten a las mismas propiedades (como `opacity` o `transform`).

### Regla 3: Sinergia de Clases

* **Estado Inicial**: Usa siempre clases de Tailwind para definir el estado inicial *antes* de la animación de Motion. (Ej. `class="opacity-0 translate-y-5"`).
* **Optimización**: Usa siempre la utilidad `will-change-*` de Tailwind en los elementos que vayas a animar con Motion One. (Ej. `class="will-change-[transform,opacity]"`).

---
## PARTE 5: ESTRATEGIAS HÍBRIDAS (CSS VANILLA & SCOPED)

---
### AI USAGE RULES — ESTRATEGIA DE ESTILOS

- Tailwind es la opción por defecto.
- CSS scoped SOLO cuando Tailwind se vuelve inmanejable o si yo lo decido.
---

Aunque Tailwind es la herramienta principal, Qwik permite y fomenta el uso de CSS estándar para casos donde las clases utilitarias se vuelven inmanejables o si yo decido usarlo explicitamente.

### 5.1 Cuándo usar `useStylesScoped$` (CSS Encapsulado)

No fuerces Tailwind para todo. Usa estilos encapsulados en estos escenarios específicos:
1.  **Componentes UI Reutilizables Complejos**: Elementos como Sliders, Calendarios o Grids avanzados donde la lógica visual ensuciaría el HTML con cientos de clases.
2.  **Selectores Avanzados y Pseudo-elementos**: Estilos complejos de `::before`, `::after`, `nth-child` o animaciones `@keyframes` personalizadas que son tediosas de escribir en línea.
3.  **Aislamiento Crítico**: Cuando necesitas garantizar que los estilos de un componente (ej. un Widget embebible) nunca se vean afectados por el CSS global ("Shadow DOM" style).

### 5.2 Patrón de Implementación Scoped

El hook `useStylesScoped$` inyecta estilos que solo aplican a este componente específico, evitando colisiones globales.

```tsx
import { component$, useStylesScoped$ } from '@builder.io/qwik';

export const ComplexCard = component$(() => {
  // CSS Vanilla, scoped automáticamente por Qwik
  useStylesScoped$(`
    .card-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      /* Ejemplo de regla difícil en Tailwind puro */
      box-shadow: 0 4px 6px -1px rgba(var(--primary-rgb), 0.1); 
    }
    
    .card-item {
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .card-item:hover::after {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at center, rgba(255,255,255,0.1), transparent);
    }
  `);

  return (
    <div class="card-container">
      <div class="card-item">Contenido</div>
    </div>
  );
});
```

### 5.3 Coexistencia (Tailwind + Scoped)

Es perfectamente válido y recomendado mezclar ambos enfoques para obtener lo mejor de los dos mundos.
* **Usa Tailwind** para el layout estructural y el espaciado (`m-4`, `p-6`, `flex`, `hidden`).
* **Usa Scoped CSS** para la decoración interna compleja y comportamientos visuales específicos.

```tsx
<div class="p-8 bg-gray-50 border border-gray-200 rounded-lg"> <div class="custom-chart-visual">...</div> </div>
```

---

## PARTE 6: DARK MODE - IMPLEMENTACIÓN

El dark mode se implementa usando variables CSS en `global.css` y lógica de toggle en `lib/utils/`.

### 6.1 Arquitectura

**Separación de responsabilidades:**
- `src/assets/css/global.css` - Variables CSS light/dark
- `src/lib/utils/dark-mode.ts` - Lógica pura (toggle, storage, system theme)
- Componentes UI (`Button`) - Sin lógica específica de dark mode

### 6.2 Activación

El tema dark se activa agregando la clase `.dark` al `<html>`:
```html
<!-- Light mode (default) -->
<html>

<!-- Dark mode -->
<html class="dark">
```

### 6.3 Utilidades (lib/utils/dark-mode.ts)

```typescript
export type Theme = 'light' | 'dark' | 'system';

// Inicializar dark mode (llamar en useVisibleTask$ del layout)
export function initDarkMode(): void;

// Toggle entre light y dark
export function toggleDarkMode(): void;

// Cambiar a tema específico
export function setTheme(theme: Theme): void;

// Obtener tema efectivo actual
export function getCurrentTheme(): 'light' | 'dark';
```

### 6.4 Implementación en Dashboard

```tsx
// src/routes/(app)/layout.tsx
import { component$, Slot, useVisibleTask$ } from '@builder.io/qwik';
import { initDarkMode } from '~/lib/utils/dark-mode';

export default component$(() => {
  useVisibleTask$(() => {
    initDarkMode(); // Inicializar al cargar
  });

  return <Slot />;
});

// src/components/layout/DashboardHeader.tsx
import { component$, useSignal, useVisibleTask$, $ } from '@builder.io/qwik';
import { toggleDarkMode, getCurrentTheme } from '~/lib/utils/dark-mode';
import { Button } from '~/components/ui';

export const DashboardHeader = component$(() => {
  const isDark = useSignal(false);

  useVisibleTask$(() => {
    isDark.value = getCurrentTheme() === 'dark';
  });

  const handleToggle = $(() => {
    toggleDarkMode();
    isDark.value = getCurrentTheme() === 'dark';
  });

  return (
    <Button variant="ghost" size="icon" onClick$={handleToggle}>
      {/* Iconos sol/luna según isDark.value */}
    </Button>
  );
});
```

### 6.5 Storage

- **Key:** `'qwik-theme'`
- **Valores:** `'light'`, `'dark'`, `'system'`
- **System theme:** Respeta `prefers-color-scheme` del OS cuando está en modo `'system'`

### 6.6 Variables CSS (Resumen)

Todas las variables semánticas cambian automáticamente:

```css
:root {
  --background: 0 0% 100%; /* #ffffff */
  --foreground: 229 33% 15%; /* #1d2033 */
  --primary: 211 100% 40%; /* WCAG AA */
}

.dark {
  --background: 229 33% 8%; /* #0f1116 */
  --foreground: 0 0% 98%; /* #fafafa */
  --primary: 196 92% 53%; /* Más brillante */
}
```

**Componentes UI (Button, Card, Input, etc.) funcionan automáticamente** en ambos temas sin modificaciones.

## PARTE 7: REGLAS ESPECÍFICAS QWIK+TAILWIND

---
## AI USAGE RULES — QWIK + TAILWIND

- NO construir clases dinámicamente.
- Todas las clases deben ser analizables en build-time.
- Usar strings completos condicionales.
---

❌ Incorrecto:
```tsx
class={`bg-${color}-500`}
```

✅ Correcto:

```tsx
class={isActive.value ? 'bg-primary' : 'bg-secondary'}
```

## MODELO MENTAL (TL;DR)

- Tailwind v4 es CSS-first
- No configuración JS para temas
- Clases estáticas
- SSR-safe
- Resumability intacta
- Motion para animación JS, Tailwind para estado