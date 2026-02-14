# Dashboard UI Evolution - Onucall

**Fecha:** 14 de febrero de 2026  
**Arquitecto:** QwikArchitect  
**Estado:** 🟡 En progreso iterativo  
**Baseline:** Dashboard básico con métricas dummy (src/routes/(app)/dashboard/index.tsx)

---

## 🎯 Objetivo

Evolucionar el dashboard placeholder actual hacia un panel de control profesional para gestión de agentes de voz, siguiendo la estructura visual de referencia LUNO Admin.

**Enfoque:** Iterativo y adaptativo (no big-bang)

---

## 📊 Estado Actual (Baseline)

### Inventario de componentes existentes

**Layout:**
- ✅ `src/routes/(app)/layout.tsx` - Auth guard + OrganizationContext
- ✅ `src/routes/(app)/dashboard/layout.tsx` - Wrapper del dashboard
- ✅ `src/routes/(app)/dashboard/index.tsx` - Vista principal (184 líneas)

**UI Components disponibles:**
- ✅ `Card, CardHeader, CardTitle, CardContent`
- ✅ `Alert`
- ✅ Iconos SVG inline (teléfono, check, reloj, usuarios)

**Datos actuales:**
- ⚠️ **DUMMY:** Métricas hardcodeadas (12 llamadas, 87%, 2:34, 4 usuarios)
- ⚠️ **DUMMY:** Banner demo mode
- ✅ Contexto real: `OrganizationContext` (workspace activo, multi-org)

---

## 🎨 Estructura UI Definitiva (Simplificada MVP)

### Layout Desktop (estructura correcta)

```
┌──────────┬──────────────────────────────────────────────┐
│          │ HEADER DASHBOARD                             │
│  LOGO    │ (notif, dark/light, perfil)                  │
│ "Inmo    ├──────────────────────────────────────────────┤
│ Huelva"  │                                              │
│          │  WELCOME: Hola, Juan 👋                      │
├──────────┤  Workspace: Inmo Huelva                      │
│          │                                              │
│WORKSPACE │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│ User:    │  │Calls │ │ Rate │ │ Time │ │Leads │       │
│ Juan P.  │  │  12  │ │  87% │ │ 2:34 │ │   4  │       │
│ Org:     │  └──────┘ └──────┘ └──────┘ └──────┘       │
│ Inmo H.  │                                              │
├──────────┤  ┌────────────────┐  ┌────────────────┐     │
│          │  │ Llamadas       │  │ Por motivo     │     │
│ MENU     │  │ (Line chart)   │  │ (Donut)        │     │
│ Dashboard│  └────────────────┘  └────────────────┘     │
│ Llamadas │                                              │
│ Agente   │  ┌──────────────────────────────────────┐   │
│ Números  │  │ Últimas llamadas (tabla)             │   │
│ Integrac.│  └──────────────────────────────────────┘   │
│ Base Cono│                                              │
│          │                                              │
├──────────┤                                              │
│WORKSPACE │                                              │
│ Config   │                                              │
│ Facturac.│                                              │
│          │                                              │
├──────────┤                                              │
│ FOOTER   │                                              │
│ SIDEBAR  │                                              │
│ Logout   │                                              │
│ Soporte  │                                              │
└──────────┴──────────────────────────────────────────────┤
│ Mensajes │ 14/02/2026 │ Soporte IT: +34... │ v1.0.0   │
│ app      │               (FOOTER DASHBOARD)             │
└──────────┴──────────────────────────────────────────────┘
```

**Posicionamiento CSS:**
```tsx
<div class="min-h-screen">
  {/* Sidebar: ocupa TODO el lado izquierdo */}
  <Sidebar class="fixed left-0 top-0 h-screen w-64 bg-white border-r" />
  
  {/* Header: solo a la DERECHA del sidebar */}
  <Header class="fixed top-0 left-64 right-0 h-16 bg-white border-b" />
  
  {/* Main: con márgenes para sidebar y header */}
  <main class="ml-64 mt-16 mb-12 min-h-[calc(100vh-7rem)] p-6">
    <Slot />
  </main>
  
  {/* Footer: ancho completo (incluyendo debajo de sidebar) */}
  <Footer class="fixed bottom-0 left-0 right-0 h-12 bg-white border-t" />
</div>
```

---

## 🚀 FASE 1: Sidebar Left (4 secciones) - Incremento 1

### Objetivo
Implementar sidebar izquierdo FIJO con 4 secciones verticales bien definidas.

### Componente a crear
**Ubicación:** `src/components/layouts/dashboard-sidebar.tsx`

**Estructura (4 partes obligatorias):**
```tsx
<aside class="fixed left-0 top-0 h-screen w-64 bg-white border-r flex flex-col">
  
  {/* 1. LOGO - Parte superior */}
  <div class="p-4 border-b">
    <h1 class="text-xl font-semibold text-primary">
      {orgCtx.active.name || "Onucall"}
    </h1>
  </div>

  {/* 2. WORKSPACE - Usuario y organización */}
  <div class="p-4 border-b">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
        {user.fullName?.charAt(0) || 'U'}
      </div>
      <div>
        <div class="font-medium text-sm">{user.fullName}</div>
        <div class="text-xs text-neutral-500">{orgCtx.active.name}</div>
      </div>
    </div>
  </div>

  {/* 3. MENU - Navegación principal (flex-1 para ocupar espacio) */}
  <nav class="flex-1 overflow-y-auto p-4">
    <ul class="space-y-1">
      <li>
        <a href="/dashboard" class="nav-link">
          <IconHome /> Dashboard
        </a>
      </li>
      <li>
        <a href="/dashboard/llamadas" class="nav-link">
          <IconPhone /> Llamadas
        </a>
      </li>
      <li>
        <a href="/dashboard/agente" class="nav-link">
          <IconRobot /> Agente
        </a>
      </li>
      <li>
        <a href="/dashboard/numeros" class="nav-link">
          <IconDeviceMobile /> Números
        </a>
      </li>
      <li>
        <a href="/dashboard/integraciones" class="nav-link">
          <IconPlug /> Integraciones
        </a>
      </li>
      <li>
        <a href="/dashboard/conocimiento" class="nav-link">
          <IconBook /> Base Conocimiento
        </a>
      </li>
    </ul>

    <div class="mt-6 pt-6 border-t">
      <p class="text-xs text-neutral-400 mb-2 uppercase">Workspace</p>
      <ul class="space-y-1">
        <li>
          <a href="/dashboard/settings" class="nav-link">
            <IconSettings /> Configuración
          </a>
        </li>
        <li>
          <a href="/dashboard/billing" class="nav-link">
            <IconCreditCard /> Facturación
          </a>
        </li>
      </ul>
    </div>
  </nav>

  {/* 4. FOOTER SIDEBAR - Acciones finales */}
  <div class="p-4 border-t flex justify-around">
    <button class="p-2 hover:bg-neutral-100 rounded" title="Soporte IT">
      <IconHelp class="w-5 h-5" />
    </button>
    <button onClick$={handleLogout} class="p-2 hover:bg-red-100 rounded" title="Cerrar sesión">
      <IconLogout class="w-5 h-5 text-red-600" />
    </button>
  </div>

</aside>
```

### Archivo de configuración del menú
**Ubicación:** `src/lib/config/menu-options.ts`

```typescript
export const dashboardMenu = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'home',
    url: '/dashboard',
  },
  {
    id: 'llamadas',
    label: 'Llamadas',
    icon: 'phone',
    url: '/dashboard/llamadas',
  },
  {
    id: 'agente',
    label: 'Agente',
    icon: 'robot',
    url: '/dashboard/agente',
  },
  {
    id: 'numeros',
    label: 'Números',
    icon: 'device-mobile',
    url: '/dashboard/numeros',
  },
  {
    id: 'integraciones',
    label: 'Integraciones',
    icon: 'plug',
    url: '/dashboard/integraciones',
  },
  {
    id: 'conocimiento',
    label: 'Base Conocimiento',
    icon: 'book',
    url: '/dashboard/conocimiento',
  },
];

export const workspaceMenu = [
  {
    id: 'settings',
    label: 'Configuración',
    icon: 'settings',
    url: '/dashboard/settings',
  },
  {
    id: 'billing',
    label: 'Facturación',
    icon: 'credit-card',
    url: '/dashboard/billing',
  },
];
```
- Active state: Link actual con `bg-primary-100`

### Checklist QwikBuilder
- [ ] Crear `src/components/layouts/dashboard-sidebar.tsx`
- [ ] Añadir iconos SVG para cada sección (reutilizar patrón actual)
- [ ] Implementar active link detection (`useLocation()`)
- [ ] Responsive: Hamburger menu móvil (ocultar sidebar < md)
- [ ] Integrar en `dashboard/layout.tsx`
- [ ] Testear navegación entre rutas

**BLOQUEANTE:** No crear rutas vacías. Solo skeleton con mensaje "Próximamente".

---

## 🚀 FASE 2: Header Dashboard (solo a la derecha del sidebar) - Incremento 2

### Objetivo
Barra superior FIJA que ocupa solo el área a la derecha del sidebar (left: 256px).

**Componente:** `src/components/layouts/dashboard-header.tsx`

**Posicionamiento:**
```tsx
<header class="fixed top-0 left-64 right-0 h-16 bg-white border-b z-20 flex items-center justify-between px-6">
  {/* Espacio vacío / búsqueda (opcional) */}
  <div class="flex-1">
    {/* Búsqueda global (postponer a fase 2) */}
  </div>

  {/* Acciones rápidas */}
  <div class="flex items-center gap-3">
    {/* Notificaciones (simple por ahora) */}
    <button class="relative p-2 hover:bg-neutral-100 rounded">
      <IconBell class="w-5 h-5" />
      <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
    </button>

    {/* Dark mode toggle */}
    <button class="p-2 hover:bg-neutral-100 rounded">
      <IconMoon class="w-5 h-5" />
    </button>

    {/* Perfil + dropdown */}
    <div class="relative">
      <button class="flex items-center gap-2 p-2 hover:bg-neutral-100 rounded">
        <img src={user.avatar} class="w-8 h-8 rounded-full" />
      </button>
      {/* Dropdown con: Mi perfil, Configuración, Logout */}
    </div>
  </div>
</header>
```

### Checklist QwikBuilder
- [ ] Crear `src/components/layouts/dashboard-header.tsx`
- [ ] Implementar dropdown de usuario (reutilizar patrón Header público)
- [ ] Badge de notificaciones (dummy badge rojo)
- [ ] Toggle dark mode (hook existente si hay)
- [ ] **CRÍTICO:** `left-64` para respetar sidebar (256px)
- [ ] Integrar en `dashboard/layout.tsx`

---

## 🚀 FASE 3: Footer Dashboard (2 partes) - Incremento 3

### Objetivo
Footer fijo en bottom con dos zonas: mensajes toast (izq) + datos informativos (dcha).

**Componente:** `src/components/layouts/dashboard-footer.tsx`

**Estructura:**
```tsx
<footer class="fixed bottom-0 left-0 right-0 h-12 bg-white border-t z-10 flex items-center">
  {/* Parte izquierda: Mensajes toast (debajo de sidebar) */}
  <div class="w-64 px-4 border-r">
    {toasts.length > 0 ? (
      <div class="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded">
        {toasts[0].message}
      </div>
    ) : (
      <span class="text-xs text-neutral-400">Sin mensajes</span>
    )}
  </div>

  {/* Parte derecha: Datos informativos */}
  <div class="flex-1 px-6 flex items-center justify-between text-sm text-neutral-600">
    <span>14/02/2026</span>
    <span>Soporte IT: +34 123 456 789</span>
    <span class="text-neutral-400">v1.0.0</span>
  </div>
</footer>
```

**Toast system (simplificado):**
```typescript
// src/lib/stores/toast.store.ts
import { useSignal } from '@builder.io/qwik';

export const useToastStore = () => {
  const toasts = useSignal<Array<{ message: string; color: string }>>([]);
  
  const addToast = (message: string, color = 'blue') => {
    toasts.value = [{ message, color }];
    setTimeout(() => { toasts.value = []; }, 5000);
  };
  
  return { toasts, addToast };
};
```

### Checklist QwikBuilder
- [ ] Crear `src/components/layouts/dashboard-footer.tsx`
- [ ] Implementar toast store básico (useSignal)
- [ ] Colores pastel para toast backgrounds (blue-50, green-50, yellow-50, red-50)
- [ ] Fecha actual dinámica con `new Date().toLocaleDateString('es-ES')`
- [ ] Versión desde `package.json` (importar estáticamente)
- [ ] Integrar en `dashboard/layout.tsx`

---

## 🚀 FASE 4: Cards de métricas superiores (Incremento 4)

### Objetivo
4 cards con KPIs principales + indicador de cambio (%, flecha)

**Componente:** `src/components/dashboard/metric-card.tsx`

**Props:**
```tsx
interface MetricCardProps {
  title: string;          // "Llamadas hoy"
  value: string | number; // "12" o "87%"
  trend: number;          // 13 (positivo) o -5 (negativo)
  icon: QRL;              // SVG icon component
  color?: 'primary' | 'success' | 'warning' | 'neutral';
}
```

**Visual:**
- Título (text-sm, neutral-500)
- Valor grande (text-3xl, bold)
- Trend (badge con flecha, verde/rojo según signo)
- Icono en círculo con background color

### Datos (dummy evolución)
Por ahora mantener datos estáticos, pero estructurados como si vinieran de API:

```tsx
const metrics = {
  callsToday: { value: 12, trend: 13 },
  resolutionRate: { value: 87, trend: 5 },
  avgDuration: { value: "2:34", trend: -8 }, // Negativo = mejor (menos tiempo)
  leadsGenerated: { value: 4, trend: 55 }
}
```

### Checklist QwikBuilder
- [ ] Crear `src/components/dashboard/metric-card.tsx`
- [ ] Implementar badge de trend con flechas
- [ ] Grid responsive (2 cols móvil, 4 desktop)
- [ ] Colores por tipo de métrica
- [ ] Integrar en `dashboard/index.tsx`

---

## 🚀 FASE 4: Gráfico de llamadas (Incremento 4)

### Objetivo
Chart de barras mostrando evolución de llamadas en último mes.

**Decisión técnica:** 
- ❌ NO usar librerías pesadas (Chart.js, Recharts)
- ✅ Usar solución ligera: **Tremor** o **SVG puro**

**Recomendación:** Evaluar Tremor (compatible Qwik, Tailwind-first)

### Datos dummy
```tsx
const callsData = [
  { month: 'Jan', calls: 45 },
  { month: 'Feb', calls: 52 },
  // ... 12 meses
]
```

### Checklist QwikBuilder
- [ ] Investigar Tremor compatibility con Qwik
- [ ] Si no compatible: implementar BarChart SVG básico
- [ ] Responsive: scroll horizontal en móvil
- [ ] Tooltip on hover (opcional fase 1)
- [ ] Integrar en grid de `dashboard/index.tsx`

**POSTERGABLE:** Si toma > 2h, dejar placeholder y continuar.

---

## 🚀 FASE 5: Tabla de actividad reciente (Incremento 5)

### Objetivo
Lista de últimas 10 llamadas con datos clave.

**Componente:** `src/components/dashboard/recent-calls-table.tsx`

**Columnas:**
- Fecha/hora
- Número origen
- Duración
- Motivo (badge con color)
- Estado (Resuelto/Escalado)
- Acción (ver detalles)

### Datos dummy
```tsx
const recentCalls = [
  {
    id: '1',
    timestamp: '2026-02-14 10:23',
    phoneNumber: '+34 612 345 678',
    duration: '2:15',
    reason: 'Ventas',
    resolved: true
  },
  // ... 9 más
]
```

### Checklist QwikBuilder
- [ ] Crear tabla responsive (card list en móvil)
- [ ] Badge de colores por motivo
- [ ] Link a detalle (ruta `/dashboard/llamadas/[id]` placeholder)
- [ ] Skeleton loading state (preparar para datos reales)
- [ ] Integrar en `dashboard/index.tsx`

---

## 📋 Orden de Ejecución (Prioridad)

1. **FASE 1: Sidebar** → Navegación base
2. **FASE 2: Header** → Layout completo
3. **FASE 3: Metric Cards** → KPIs visuales
4. **FASE 5: Tabla actividad** → Datos accionables
5. **FASE 4: Gráfico** → Vista temporal (postponer si complejo)

---

## 🛡️ Restricciones Arquitectónicas

### Patrón Orchestrator (obligatorio)
- ❌ NO poner lógica de negocio en componentes UI
- ✅ Componentes reciben datos vía props
- ✅ Eventos emiten QRLs, lógica en servicios

### Performance (QUALITY_STANDARDS.md)
- ❌ NO usar `useVisibleTask$()` salvo gráficos interactivos
- ✅ Usar `useSignal()` para estado local
- ✅ Lazy loading de tabs/secciones pesadas

### Responsive (Mobile-first)
- ✅ Sidebar colapsable < 768px
- ✅ Cards en grid fluido
- ✅ Tabla → Card list móvil

---

## 💾 Preparación para Datos Reales (Fase futura)

### Schema necesario (no crear ahora, solo documentar)

**Tabla: `calls` (llamadas)**
```sql
CREATE TABLE calls (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  phone_number VARCHAR(20),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INT,
  call_reason VARCHAR(50), -- 'sales', 'support', 'info'
  resolved BOOLEAN,
  sentiment VARCHAR(20), -- 'positive', 'neutral', 'negative'
  transcript TEXT,
  recording_url TEXT
);
```

**Tabla: `call_metrics_daily` (agregados)**
```sql
CREATE TABLE call_metrics_daily (
  date DATE,
  organization_id UUID,
  total_calls INT,
  resolved_calls INT,
  avg_duration_seconds INT,
  leads_generated INT,
  PRIMARY KEY (date, organization_id)
);
```

**NO crear schema ahora** → Esperar a implementar backend de llamadas.

---

## 🎯 Criterios de Éxito (Fase 1 completada)

- [ ] Navegación funcional entre secciones
- [ ] Header con logout funcional
- [ ] 4 metric cards visualmente pulidos
- [ ] Tabla de actividad con datos dummy
- [ ] Responsive en móvil/tablet/desktop
- [ ] Lighthouse Performance > 90
- [ ] CLS < 0.1

---

## 📝 Notas de Implementación

**Stack UI:**
- Tailwind v4 (ya configurado)
- Componentes en `src/components/ui/` existentes
- Nuevos componentes en `src/components/dashboard/`

**Iconos:**
- Mantener patrón SVG inline actual (optimizado)
- Biblioteca opcional: Heroicons (copiar SVGs, no instalar)

**Decisión de charts:**
- **Propuesta:** Postponer a Fase 2 (después de métricas base)
- **Alternativa:** Usar Tremor si fácil integración (<2h setup)

---

## ✅ Aprobación para Continuar

**@QwikBuilder:** Puedes empezar con FASE 1 (Sidebar) sin esperar aprobación de fases siguientes. Enfoque iterativo.

**Ajustes sobre la marcha:** User feedback aplicable en cualquier fase.
