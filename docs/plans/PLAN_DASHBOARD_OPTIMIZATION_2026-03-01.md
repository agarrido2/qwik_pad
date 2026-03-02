# Plan de Optimización del Dashboard (Layout y Componentes)

**Fecha:** 1 de marzo de 2026  
**Arquitecto:** @QwikArchitect  
**Estado:** � Aprobado (Esperando inicio de implementación por @QwikBuilder)

---

## 🎯 1. Contexto y Objetivos

El usuario ha solicitado optimizar el layout del dashboard y sus componentes (`DashboardLayout`, `DashboardSidebar`, `DashboardHeader`, etc.). El objetivo es lograr una arquitectura frontend **óptima**, centrándonos en:

- **Resumability & Reactividad (O(1)):** Minimizar la ejecución de código en el render inicial y evitar re-renders innecesarios aislando el estado con `useComputed$` y `useSignal`.
- **Performance CSS:** Mejorar las transiciones del layout (colapsado/expandido) para evitar _layout thrashing_ o repaints costosos.
- **Mantenibilidad:** Refactorizar componentes grandes (ej. `dashboard-sidebar.tsx` con ~380 líneas) extrayendo sub-componentes lógicos.

---

## 🔍 2. Puntos de Mejora Detectados (Auditoría Rápida)

### A. Reactividad y Ejecución en el Render (`dashboard-sidebar.tsx`)

- **Problema:** Actualmente se llama a `getVisibleMenu(auth.organization.role, ...)` directamente en el cuerpo del componente. Esto significa que cada vez que el componente se re-renderiza, se recalcula todo el menú.
- **Solución:** Envolver el cálculo de los menús en un `useComputed$()` para que solo se vuelva a calcular si el rol (`auth.organization.role`) cambia.

### B. Gestión del Estado de Expansión del Menú

- **Problema:** `useTask$` calcula los grupos expandidos basándose en la URL. Esto puede generar un pequeño retardo percibido o ejecutar lógica redundante.
- **Solución:** Extraer la lógica de rutas activas a funciones derivadas puras o usar derivación de estado síncrona siempre que sea posible.

### C. Refactorización Estructural (Componentes "gordos")

- **Problema:** `dashboard-sidebar.tsx` mezcla la lógica del menú principal, el menú de workspace, recursividad y renderizado de nodos (`renderMenuItem`).
- **Solución:** Extraer `<SidebarGroup>`, `<SidebarItem>` como componentes o funciones modulares colocalizadas en el mismo archivo para mejorar la legibilidad.

### D. Layout Shifts en Transiciones (`dashboard-layout.tsx`)

- **Problema:** Se usan transiciones de clases como `transition-[margin-left]` y `transition-[left]`. A nivel de navegador, animar `margin` y `left` provoca repaints completos de la pantalla (Layout/Reflow).
- **Solución:** Reemplazar las transiciones basadas en `margin-left` por transiciones basadas en transformaciones GPU (`translate-x`) o CSS Grid, que son mucho más baratas a nivel de rendimiento. (Nota: Si el requerimiento es desplazar la pantalla principal, evaluaremos la viabilidad de modernizarlo con CSS variables u optimizaciones directas).

---

## 🛠️ 3. Plan de Acción (Fases)

### Fase 1: Optimización de Reactividad (Qwik Core)

- Refactorizar `DashboardSidebar` aplicando `useComputed$()` para `mainMenu` y `workspaceMenu`.
- Simplificar el chequeo de "Active Link" (`isActive`) transformándolo en una propiedad derivada pura sin atrapar todo el objeto `location`.

### Fase 2: Modularización del Sidebar

- Extraer `SidebarItem` y `SidebarGroup` (o dividirlos semánticamente) dentro de `src/components/dashboard/`.
- Limpiar el closure principal del Sidebar para que sea un simple limitador de estructura.

### Fase 3: Revisión de CSS y Rendering (DOM)

- Auditar y convertir las clases de Tailwind de transición de márgenes hacia medidas más amigables (o variables de CSS inyectadas) si se detectan cuellos de botella.
- Revisar que el `DashboardHeader` y el `DashboardFooter` no re-rendericen cuando solo cambia la navegación del Sidebar.

---

## 📦 4. Fronteras $() y Serialización (Leyes de Qwik)

- No se capturarán funciones complejas no serializables en los manejadores `$()`.
- Los estados globales como `isCollapsed` se leen en las hojas, evitando renderizar padres innecesariamente.
- Tipos de `ResolvedMenuItem` cruzarán fronteras estrictamente como objetos planos (POJOs).

---

## 📋 5. Checklist de Implementación (@QwikBuilder)

**LÓGICA Y RUTAS (Agente: @QwikBuilder)**

- [x] Implementar Fase 1 (`useComputed$` en rutinas de Sidebar).
- [x] Implementar Fase 2 (Extracción de sub-componentes: `SidebarGroup`, `SidebarItem`).
- [x] Implementar Fase 3 (Optimización de layouts y selectores Tailwind).
- [x] Validar Zero-React APIs (Ningún hook de React utilizado importado por error o hábito).

**CALIDAD (Agente: @QwikAuditor) [POST-BUILDER]**

- [x] Verificar Resumability (Fronteras `$()` minimizadas).
- [x] Asegurar snapshot state lo más pequeño posible.
