# Qwik & Qwik City: Enterprise Patterns & Snippets

> **SOURCE:** Context7 Official Docs (v1.x) & Enterprise Standards.
> **PURPOSE:** The absolute source of truth for Qwik syntax, patterns, and Bun integration.

---

## ⚡ Reglas Críticas (leer siempre — 30 segundos)
> El agente lee este bloque en TODAS las tareas.
> El resto del documento solo si la tarea requiere detalle.

1. PROHIBIDO: Cualquier hook de React/Next.js (`useState`, `useEffect`, `useContext`, etc.) — usar exclusivamente `useSignal`, `useStore`, `useTask$`, `useComputed$`, `sync$`.
2. OBLIGATORIO: `sync$()` para operaciones puras de DOM (toggle modales, clases) — evita peticiones HTTP innecesarias.
3. PATRÓN: Handlers `$()` capturan SOLO primitivos/IDs; los datos pesados se leen dentro del handler via Signal/Store, nunca en el cierre.

---

## 1. Core Reactivity (The "Resumable" Way)

---
### AI USAGE RULES — CORE REACTIVITY (APPLICATION CODE)
- These APIs are SAFE for application-level code.
- Prefer resumability and SSR-first execution.
- DO NOT use React hooks or hydration-based patterns.
- State MUST be serializable.
---

### 1.1 State Primitives: `useSignal` y `useStore`

Los dos fundamentos de estado reactivo en Qwik. Todo el sistema de reactividad (computed, tasks, resources) opera sobre estos.

#### `useSignal<T>()` — Estado atómico

Para **un solo valor** (primitivo u objeto simple). Devuelve `Signal<T>` con acceso via `.value`.

```tsx
import { component$, useSignal } from '@builder.io/qwik';

export const Counter = component$(() => {
  const count = useSignal(0);           // Signal<number>
  const name = useSignal('Qwik');       // Signal<string>
  const isOpen = useSignal(false);      // Signal<boolean>

  return (
    <button onClick$={() => count.value++}>
      {count.value}
    </button>
  );
});
```

**Cuándo usar:** Contadores, toggles, valores de input, refs a elementos DOM, cualquier dato unitario.

#### `useStore<T>()` — Estado estructurado (Proxy reactivo)

Para **objetos y arrays** con múltiples propiedades reactivas. Qwik crea un Proxy que trackea mutaciones a cualquier nivel.

```tsx
import { component$, useStore } from '@builder.io/qwik';

export const UserProfile = component$(() => {
  // deep: true es el DEFAULT — propiedades anidadas son reactivas automáticamente.
  const state = useStore({
    user: { name: 'Qwik', tags: [] as string[] },
    nested: { fields: { are: 'also tracked' } },
    list: ['Item 1'],
  });

  return (
    <>
      <p>{state.nested.fields.are}</p>
      <button onClick$={() => {
        // Mutaciones directas en objetos anidados SÍ disparan re-render.
        state.nested.fields.are = 'updated';
        state.list.push(`Item ${state.list.length + 1}`);
      }}>
        Mutar nested
      </button>
    </>
  );
});
```

**Cuándo usar:** Formularios multi-campo, listas de TODOs, estado con estructura jerárquica.

**Opciones:**
- `{ deep: true }` (default) — trackea objetos/arrays anidados.
- `{ deep: false }` — solo trackea propiedades de primer nivel (micro-optimización).
- `{ reactive: false }` — objeto estático, sin tracking (raro, solo para datos inmutables).

#### Decisión: `useSignal` vs `useStore`

| Criterio | `useSignal` | `useStore` |
|---|---|---|
| Cantidad de valores | **1 valor** | **Múltiples propiedades** |
| Acceso | `signal.value` | `store.propiedad` |
| Mutación | Reasignación: `signal.value = x` | Mutación directa: `store.prop = x` |
| Reactividad anidada | No aplica | Automática (`deep: true`) |
| Adición dinámica de props | No | Sí |
| **Preferencia** | **Default** (más eficiente) | Solo cuando necesitas estructura |

> **Regla:** Prefiere `useSignal` para todo caso simple. Usa `useStore` solo cuando necesites un objeto con múltiples propiedades reactivas.

---

### 1.2 Primitivas Reactivas: Guía Completa

Qwik ofrece **4 primitivas** para valores derivados y efectos. Cada una tiene un propósito preciso y usarlas incorrectamente **degrada la resumibilidad** o introduce **bugs sutiles de hidratación**.

#### Mapa de decisión rápido

```
¿Necesitas un valor derivado del state existente?
  ├─ ¿Es síncrono (return f(state), sin await)?
  │   └─ ✅ useComputed$
  ├─ ¿Es asíncrono (fetch, API call)?
  │   └─ ✅ useResource$
  └─ No es un valor derivado, es un Side-Effect
      ├─ ¿Necesita ejecutarse en servidor + cliente?
      │   └─ ✅ useTask$
      └─ ¿Solo necesita DOM / browser APIs?
          └─ ✅ useVisibleTask$ (⚠️ restringido)
```

#### Tabla comparativa completa

| Primitiva | Ejecución | Propósito | Devuelve | Side-effects | Bloquea render |
|---|---|---|---|---|---|
| **`useComputed$`** | Server + Client | Derivación **síncrona** pura | `Signal<T>` | ❌ Prohibidos | No |
| **`useResource$`** | Server + Client | Derivación **asíncrona** | `ResourceReturn<T>` | ❌ Prohibidos | Para SSR: sí (streaming) |
| **`useTask$`** | Server + Client | **Side-effects** reactivos | `void` | ✅ Permitidos | Sí (ejecuta antes del render) |
| **`useVisibleTask$`** | **Solo Client** | DOM, browser APIs, 3rd-party | `void` | ✅ Permitidos | No (post-render) |

---

#### 1.2.1 `useComputed$` — Estado derivado síncrono (memoizado)

**Definición oficial:** Crea un valor memoizado que se recalcula automáticamente cuando sus dependencias (signals/stores) cambian. La función **debe ser pura** — sin side-effects, sin `await`, sin mutaciones externas.

**Tracking:** Automático. Qwik detecta qué signals se leen dentro del closure.

```tsx
import { component$, useSignal, useComputed$ } from '@builder.io/qwik';

export default component$(() => {
  const firstName = useSignal('John');
  const lastName = useSignal('Doe');

  // Se recalcula SOLO cuando firstName o lastName cambian.
  // Qwik trackea las dependencias automáticamente.
  const fullName = useComputed$(() => {
    return `${firstName.value} ${lastName.value}`.trim();
  });

  return (
    <>
      <input type="text" bind:value={firstName} />
      <input type="text" bind:value={lastName} />
      <p>Full name: {fullName.value}</p>
    </>
  );
});
```

**Patrón canónico del proyecto:** Derivar permisos RBAC desde Context sin round-trip al servidor.

```tsx
import { useComputed$, useContext } from '@builder.io/qwik';
import { OrganizationContext } from '~/lib/context/organization.context';
import { canAccessBilling, canWrite, getRoleLabel, type MemberRole } from '~/lib/auth/guards';

/**
 * Hook que deriva permisos RBAC del OrganizationContext.
 * 0 round-trips: cálculo puro sobre state ya cargado por SSR (sharedMap).
 */
export function usePermissions() {
  const orgContext = useContext(OrganizationContext);

  return useComputed$(() => {
    const role = orgContext.active.role as MemberRole;
    return {
      role,
      roleLabel: getRoleLabel(role),
      canAccessBilling: canAccessBilling(role),
      canWrite: canWrite(role),
    };
  });
}
```

**Cuándo NO usar:** Si necesitas `await`, `fetch`, `setTimeout`, `localStorage`, o cualquier operación asíncrona o con side-effects.

---

#### 1.2.2 `useResource$` — Estado derivado asíncrono

**Definición oficial:** Crea un recurso asíncrono que se ejecuta en servidor (SSR) y en cliente cuando las dependencias trackeadas cambian. Devuelve `ResourceReturn<T>` con estados `pending`, `resolved`, `rejected`.

**Tracking:** Manual con `track()`. Debes declarar explícitamente qué dependencias observar.

**Cleanup:** Via `cleanup()` — patrón obligatorio con `AbortController` para cancelar fetches pendientes.

```tsx
import { component$, Resource, useResource$, useSignal } from '@builder.io/qwik';

export default component$(() => {
  const cityName = useSignal('Madrid');

  // useResource$ se ejecuta en server (SSR) y re-ejecuta en client cuando city cambia.
  const weatherResource = useResource$<WeatherData>(async ({ track, cleanup }) => {
    // 1. Declarar dependencias explícitamente
    const city = track(() => cityName.value);

    // 2. Patrón obligatorio: AbortController para cancelar requests pendientes
    const controller = new AbortController();
    cleanup(() => controller.abort());

    // 3. Lógica async
    const response = await fetch(`/api/weather/${city}`, {
      signal: controller.signal,
    });
    return await response.json();
  });

  return (
    <>
      <input type="text" bind:value={cityName} />

      {/* El componente <Resource> maneja los 3 estados automáticamente */}
      <Resource
        value={weatherResource}
        onPending={() => <p>Cargando clima...</p>}
        onResolved={(weather) => (
          <p>{weather.city}: {weather.temp}°C</p>
        )}
        onRejected={(error) => (
          <p class="text-red-500">Error: {error.message}</p>
        )}
      />
    </>
  );
});
```

**Diferencia clave con `routeLoader$`:**
- `routeLoader$` carga datos **una vez** en SSR antes del render (ideal para datos de página).
- `useResource$` **re-ejecuta** cuando cambian sus dependencias (ideal para datos reactivos al input del usuario).

**Cuándo usar:**
- Autocompletado / búsqueda en vivo (debounce + fetch).
- Datos que dependen de un signal controlado por el usuario (ej: seleccionar ciudad → fetch clima).
- APIs externas cuya respuesta cambia según input del componente.

**Cuándo NO usar:**
- Datos de página estáticos → `routeLoader$` (más eficiente, sin JS en cliente).
- Cálculos síncronos → `useComputed$`.
- Si necesitas mutar state existente → `useTask$`.

---

#### 1.2.3 `useTask$` — Side-effects reactivos (Server + Client)

**Definición oficial:** Ejecuta lógica con side-effects durante SSR y en cliente cuando las dependencias trackeadas cambian. Las tasks se ejecutan **antes del render** y pueden **bloquear el render**.

**Tracking:** Manual con `track()`. Si no se trackea nada, se ejecuta solo una vez (mount).

**Cleanup:** Via `cleanup()` para cancelar timers, abort controllers, etc.

**Comportamiento dual Server/Client:**
- En **SSR**: se ejecuta durante el streaming HTML.
- En **Client**: se re-ejecuta cuando cambian las dependencias trackeadas.
- Usa `isServer` para lógica condicional.

```tsx
import { component$, useSignal, useTask$ } from '@builder.io/qwik';
import { isServer } from '@builder.io/qwik';

export default component$(() => {
  const searchQuery = useSignal('');
  const delayedQuery = useSignal('');

  useTask$(({ track }) => {
    // track() declara la dependencia — la task se re-ejecuta cuando cambie.
    const query = track(() => searchQuery.value);

    if (isServer) {
      // En SSR: actualizar inmediatamente (no tiene sentido un delay en servidor).
      delayedQuery.value = query;
      return;
    }

    // En Client: debounce de 500ms antes de actualizar.
    const timer = setTimeout(() => {
      delayedQuery.value = query;
    }, 500);

    // cleanup se invoca cuando la task se re-ejecuta o el componente se destruye.
    // Previene race conditions y memory leaks.
    return () => clearTimeout(timer);
  });

  return (
    <>
      <input type="text" bind:value={searchQuery} />
      <p>Debounced: {delayedQuery.value}</p>
    </>
  );
});
```

**Patrón avanzado: fetch con AbortController y server guard**

```tsx
useTask$(async ({ track, cleanup }) => {
  const userId = track(() => selectedUserId.value);

  // Guard: datos iniciales vienen de routeLoader$, no re-fetchar en SSR.
  if (isServer) return;

  const controller = new AbortController();
  cleanup(() => controller.abort());

  isLoading.value = true;
  try {
    const response = await fetch(`/api/users/${userId}`, {
      signal: controller.signal,
    });
    userData.value = await response.json();
  } catch (e) {
    // DOMException = abortado (cleanup normal), no es un error real.
    if (!(e instanceof DOMException)) {
      console.error('Fetch failed:', e);
    }
  } finally {
    isLoading.value = false;
  }
});
```

**`useTask$` vs `useResource$` para async — ¿Cuándo usar cada uno?**

| Escenario | `useTask$` | `useResource$` |
|---|---|---|
| **Devuelve un valor** para renderizar | ❌ Muta signals externos | ✅ Devuelve `ResourceReturn<T>` |
| **Loading/Error states** | Manual (`isLoading.value`) | Automático (`<Resource onPending onRejected>`) |
| **Streaming SSR** | No integrado | ✅ Integrado con streaming |
| **Side-effects** (localStorage, analytics) | ✅ Propósito principal | ❌ No permitido |
| **Múltiples signals mutados** | ✅ Sin restricción | ❌ Solo devuelve 1 valor |

> **Regla:** Si el resultado se renderiza directamente en JSX → `useResource$` + `<Resource>`. Si el resultado muta state existente o ejecuta efectos colaterales → `useTask$`.

**Cuándo usar:**
- Debounce/throttle de input del usuario.
- Sincronizar state con `localStorage` o `sessionStorage`.
- Fetch reactivo donde necesitas **mutar múltiples signals**.
- Logging / analytics reactivos.

**Cuándo NO usar:**
- Para derivar un valor puro → `useComputed$`.
- Para datos que se renderizan con loading/error states → `useResource$` + `<Resource>`.
- Para acceso directo al DOM → `useVisibleTask$`.

---

#### 1.2.4 `useVisibleTask$` — DOM y APIs del navegador (Solo Client)

**Definición oficial:** Se ejecuta **exclusivamente en el navegador**, cuando el componente se hace visible en el viewport (IntersectionObserver). **Rompe la resumibilidad** porque fuerza la descarga del chunk JS del componente.

> ⚠️ **RESTRINGIDO.** Cada uso debe estar justificado. Si existe alternativa con `useTask$` o `useComputed$`, úsala.

**Strategies (controlan CUÁNDO se ejecuta):**

| Estrategia | Comportamiento | Uso típico |
|---|---|---|
| `'intersection-observer'` (default) | Se ejecuta cuando el componente entra en el viewport | Charts, mapas, lazy widgets |
| `'document-ready'` | Se ejecuta cuando el DOM está listo (sin esperar visibilidad) | Analytics globales, focus management |
| `'document-idle'` | Se ejecuta cuando el browser está idle (`requestIdleCallback`) | Pre-cargar datos no críticos |

```tsx
import {
  component$, useSignal, useVisibleTask$, useStore, noSerialize,
  type NoSerialize,
} from '@builder.io/qwik';

export default component$(() => {
  const canvasRef = useSignal<HTMLCanvasElement>();
  const time = useSignal('');
  const store = useStore<{ chart: NoSerialize<ChartInstance> }>({
    chart: undefined,
  });

  // Ejemplo 1: Reloj en tiempo real (timer del browser).
  useVisibleTask$(({ cleanup }) => {
    const update = () => { time.value = new Date().toLocaleTimeString(); };
    update();
    const interval = setInterval(update, 1000);
    cleanup(() => clearInterval(interval));
  });

  // Ejemplo 2: Librería de terceros no serializable (Chart.js, Monaco, etc.).
  useVisibleTask$(({ cleanup }) => {
    if (!canvasRef.value) return;

    const chart = new Chart(canvasRef.value, {
      type: 'line',
      data: { /* ... */ },
    });
    // noSerialize: le dice a Qwik que NO intente serializar este objeto.
    // Se perderá en la pausa/resume y debe re-inicializarse.
    store.chart = noSerialize(chart);

    cleanup(() => chart.destroy());
  });

  // Ejemplo 3: Ejecución eagerly (sin esperar IntersectionObserver).
  useVisibleTask$(
    () => {
      // Analytics que necesita ejecutarse incluso si el componente no es visible aún.
      analytics.track('page_view');
    },
    { strategy: 'document-ready' }  // Se ejecuta al cargar el documento.
  );

  return (
    <div>
      <p>Hora: {time.value}</p>
      <canvas ref={canvasRef} width={400} height={200} />
    </div>
  );
});
```

**`noSerialize()` — Datos no serializables:**
Valores marcados con `noSerialize()` **no persisten** entre SSR y client. Se resetean a `undefined` en el cliente y deben re-inicializarse (típicamente en un `useVisibleTask$`). Usar para instancias de Chart.js, Monaco Editor, WebSocket connections, etc.

**Cuándo usar (SOLO estos casos):**
- Inicializar librerías JS que manipulan DOM directamente (Chart.js, Monaco, Mapbox, D3).
- Timers del browser (`setInterval`, `requestAnimationFrame`).
- Browser APIs no disponibles en SSR (`localStorage`, `matchMedia`, `IntersectionObserver`, `navigator.geolocation`).
- Focus/scroll management que requiere referencia al DOM real.

**Cuándo NO usar (VIOLACIÓN DE PERFORMANCE):**
- Fetch de datos → `routeLoader$` o `useResource$`.
- Lógica de inicialización → `useTask$` con `isServer` guard.
- Derivar estado → `useComputed$`.
- Cualquier lógica que funcione sin el DOM.

---

### 1.3 Árbol de Decisión Completo

```
┌─────────────────────────────────────────────────────────┐
│              ¿QUÉ NECESITAS HACER?                      │
└─────────────────────┬───────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
   Obtener/derivar              Producir un
   un VALOR                     SIDE-EFFECT
        │                           │
   ¿Es síncrono?              ¿Necesita el DOM
        │                     o browser APIs?
   ┌────┴────┐                     │
   │         │                ┌────┴────┐
  SÍ        NO               │         │
   │         │               SÍ        NO
   ▼         ▼                │         │
useComputed$ useResource$     ▼         ▼
             │          useVisibleTask$ useTask$
             │          (⚠️ restringido)
             │
        ¿Datos de
        página (SSR)?
             │
        ┌────┴────┐
       SÍ        NO
        │         │
        ▼         ▼
  routeLoader$  useResource$
  (preferido)   (reactivo a input)
```

> **Regla de oro:** Si puedes escribir `return f(state)` sin `await`, usa `useComputed$`. Si necesitas `await`, evalúa `useResource$` (devuelve valor) vs `useTask$` (produce side-effect). Si necesitas el DOM, no hay alternativa a `useVisibleTask$`.

---

## 2. Server Communication & Data Flow

---
### AI USAGE RULES — SERVER COMMUNICATION
- These APIs run on the SERVER.
- DO NOT generate client-side fetch logic for these use cases.
- Prefer routeLoader$ for reads and routeAction$ / server$ for writes.
- Prefer <Form> over manual event handlers.
---

### 2.1 Server Functions (`server$`)

**RPC Style:** Execute backend logic directly from a component event. Code never ships to client.

```tsx
import { server$ } from '@builder.io/qwik-city';

// 🔒 Backend code (Never leaks to client)
const toggleUserRole = server$(async function(userId: string) {
  const db = await getDb(this.env);
  await db.users.update({ role: 'admin' }).where(eq(users.id, userId));
  return { success: true };
});

// Component usage
<button onClick$={async () => await toggleUserRole(user.userId)}>
  Make Admin
</button>

```

### 2.2 Route Loaders (routeLoader$) - Read Data

Runs on **Server** before render. Use for fetching data required for the page. Ideal for page data.

```tsx
import { routeLoader$ } from '@builder.io/qwik-city';

export const useProductLoader = routeLoader$(async (requestEvent) => {
  const supabase = createServerClient(requestEvent);
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', requestEvent.params.id)
    .single();
    
  if (error) throw requestEvent.error(404, 'Product not found');
  return data;
});

```

### 2.3 Loaders:Cookies & Headers (Enterprise)

```tsx
routeLoader$(({ cookie, headers }) => {
  const session = cookie.get('session')?.value;

  headers.set('x-page', 'dashboard');

  if (!session) {
    throw redirect(302, '/login');
  }

  return { session };
});
```

### 2.4 Actions (`routeAction$` & `globalAction$`) - Write

Runs on **Server**. Use for Form submissions and mutations.

```tsx
import { routeAction$, zod$, z } from '@builder.io/qwik-city';

export const useLoginAction = routeAction$(
  async (data, { cookie, fail }) => {
    // 'data' is typed strictly via Zod
    if (data.password !== 'secret') return fail(401, { message: 'Wrong pass' });
    
    cookie.set('session', 'abc123', { httpOnly: true, secure: true, path: '/' });
    return { success: true };
  },
  zod$({
    email: z.string().email(),
    password: z.string().min(6)
  })
);

```

### 2.5 Forms (Progressive Enhancement)

Connects `routeAction` to HTML. Handles progressive enhancement automatically.

```tsx
import { Form } from '@builder.io/qwik-city';

export default component$(() => {
  const action = useLoginAction();

  return (
    <Form action={action} class="flex flex-col gap-2">
      <input name="email" type="email" />
      {/* Show Zod Error */}
      {action.value?.fieldErrors?.email && (
        <span class="text-red-500">{action.value.fieldErrors.email}</span>
      )}
      
      <input name="password" type="password" />
      
      {/* Show Server Error */}
      {action.value?.failed && (
        <p class="text-red-500">{action.value.message}</p>
      )}

      <button type="submit" disabled={action.isRunning}>
        {action.isRunning ? 'Loggin in...' : 'Login'}
      </button>
    </Form>
  );
});

```

---

## 3. Architecture: Layouts & Context

---
### AI USAGE RULES — ARCHITECTURE
- Layouts are for orchestration and persistent UI.
- DO NOT place business logic directly in layouts.
- Use Context for dependency injection, not prop drilling.
---

### 3.1 Layouts & Middleware (`layout.tsx`)

Use for persistent UI (Headers/Sidebars) and **Auth Guards**.

```tsx
// src/routes/(app)/layout.tsx
import { Slot, component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';

// 🔒 Auth Guard Middleware
export const useAuthGuard = routeLoader$(async (ev) => {
  const session = await getSession(ev);
  if (!session) throw ev.redirect(302, '/login');
  return session.user;
});

export default component$(() => {
  return (
    <div class="dashboard-grid">
      <Sidebar />
      <main>
        {/* Render nested route here */}
        <Slot />
      </main>
    </div>
  );
});

```

### 3.2 Dependency Injection (Context)

Avoid prop-drilling. Share state/signals down the tree.

```tsx
import {
  createContextId,
  useContext,
  useContextProvider,
  useSignal,
  component$,
  Slot,
  Signal,
} from '@builder.io/qwik';
// 1. Create Key
export const ThemeContext = createContextId<Signal<string>>('app.theme');

// 2. Provide (Root/Layout)
export const AppProvider = component$(() => {
  const theme = useSignal('dark');
  useContextProvider(ThemeContext, theme);
  return <Slot />;
});

// 3. Consume (Any Child)
export const ThemeToggle = component$(() => {
  const theme = useContext(ThemeContext);
  return <button onClick$={() => theme.value = 'light'}>Toggle</button>;
});

```

---

## 4. Components & Serialization

---
### AI USAGE RULES — COMPONENT DESIGN
- Component props MUST be serializable.
- Callbacks MUST use PropFunction.
- DO NOT pass raw functions across component boundaries.
---

### 4.1 Generic Components & `PropFunction`

**CRITICAL:** How to pass callbacks safely across serialization boundaries.

```tsx
import { component$, type PropFunction } from '@builder.io/qwik';

interface ListProps<T> {
  items: T[];
  // ✅ Correct type for callbacks (serializable)
  onItemClick$?: PropFunction<(item: T) => void>;
}

export const List = component$<ListProps<any>>(({ items, onItemClick$ }) => {
  return (
    <ul>
      {items.map(item => (
        // ✅ Invoke with optional chaining
        <li onClick$={() => onItemClick$?.(item)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
});

```

### 4.2 Slots & Named Slots (Composition)

Inject content into specific areas of a component.

```tsx
// Definition (Card.tsx)
<div class="card">
  <header class="header">
    <Slot name="title" />  {/* Named */}
  </header>
  <section class="section-main">
    <Slot />               {/* Default */}
  </section>
</div>

// Usage
<Card>
  <h1 q:slot="title">Hello World</h1>
  <p>This goes to default slot</p>
</Card>

```

### 5 Browser Events (Correct Way)

```tsx
import { useOnWindow, $ } from '@builder.io/qwik';

useOnWindow(
  'resize',
  $(() => {
    console.log(window.innerWidth);
  })
);

```
---

## 6. Anti-Patterns (The "Don't Do It" List)

| ❌ Pattern | ✅ Alternative | Why? |
| --- | --- | --- |
| `useEffect` | `useTask$` | `useEffect` implies hydration. `useTask$` is resumable. |
| `onClick={() => ...}` | `onClick$={() => ...}` | Missing `$` crashes serialization. |
| `window.addEventListener` | `useOnWindow` | Manual listeners leak memory. |
| `export default function` | `component$()` | Optimizer needs `component$` wrapper. |
| **Logic in Routes** | `lib/services` | Routes are for orchestration only. |
| **Raw SQL in Components** | `drizzle` + `server$` | Keep DB access secure and structured. |
| `<form onSubmit>` | `<Form action={...}>` | Use Qwik City's progressive enhancement form. |
| `useVisibleTask$` para fetch | `routeLoader$` / `useResource$` | Rompe resumabilidad innecesariamente. |
| `useTask$` para derivar valores puros | `useComputed$` | useComputed$ es memoizado y no bloquea render. |
| `useResource$` con side-effects | `useTask$` | useResource$ es para devolver un valor, no para mutar state. |


### 7. Qwik Mental Model (TL;DR)

- SSR first
- HTML streams immediately
- JS loads only on interaction
- No hydration
- State is serializable
- Resume, don't re-run
