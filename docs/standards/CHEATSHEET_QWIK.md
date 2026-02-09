T
# Qwik & Qwik City: Enterprise Patterns & Snippets

> **SOURCE:** Context7 Official Docs (v1.x) & Enterprise Standards.
> **PURPOSE:** The absolute source of truth for Qwik syntax, patterns, and Bun integration.

---

## 1. Core Reactivity (The "Resumable" Way)

---
### AI USAGE RULES — CORE REACTIVITY (APPLICATION CODE)
- These APIs are SAFE for application-level code.
- Prefer resumability and SSR-first execution.
- DO NOT use React hooks or hydration-based patterns.
- State MUST be serializable.
---

### 1.1 State Primitives
- **`useSignal`**: For primitives (string, number, boolean). Access via `.value`.
- **`useStore`**: For deep objects/arrays. Auto-proxied.
- **`useComputed$`** → derived state (optimized ≥1.17)

```tsx

import { component$, useSignal, useStore, useComputed$} from '@builder.io/qwik';
export const Counter = component$(() => {
  const count = useSignal(0);
  const state = useStore({ user: { name: 'Qwik', tags: [] as string[] } });

  // Computed (Optimized in v1.17.1)
  const double = useComputed$(() => count.value * 2);

  return (
    <button onClick$={() => {
      count.value++;
      state.user.tags.push('clicked');
    }}>
      {count.value} / {double.value}
    </button>
  );
});

```

### 1.2 `useTask$` (Resumable Reactive Logic)

Runs during SSR streaming and re-runs on resume when tracked signals change.

Use cases:
- Side-effect based on state
- Debounce/throttle
- Syncing derived state
- Safe async logic.
 Not a 1:1 useEffect replacement — closer to a mix of useEffect, useMemo, and Vue watchers.

```tsx
import { useTask$ } from '@builder.io/qwik';
useTask$(({ track, cleanup }) => {
  const txt = track(() => state.searchQuery); // 1. Track dependency
  
  const controller = new AbortController();
  cleanup(() => controller.abort()); // 2. Cleanup on re-run

  const timer = setTimeout(async () => {
    // 3. Safe logic (runs on server & client)
    state.results = await fetchResults(txt, controller.signal);
  }, 300);
  
  cleanup(() => clearTimeout(timer));
});

```

### 1.3 `useVisibleTask$` (Client-only DOM)

**WARNING:** Forces eager loading of the component’s JS chunk.
Use ONLY for: DOM access / manipulation, 3rd party libs (Charts, Maps), focus / scroll management.

```tsx
import { useVisibleTask$ } from '@builder.io/qwik';
// ⚠️ Runs only in the browser, after render
useVisibleTask$(({ track, cleanup }) => {
  // Explicit reactive dependency (client-only)
  track(() => someSignal.value);
  // Good place for direct DOM access
  const el = document.getElementById('my-chart');
  const chart = new ChartLib(el);

  cleanup(() => chart.destroy());
});

```

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

| ❌ Pattern | ✅ Alternative | 🧠 Why? |
| --- | --- | --- |
| `useEffect` | `useTask$` | `useEffect` implies hydration. `useTask$` is resumable. |
| `onClick={() => ...}` | `onClick$={() => ...}` | Missing `$` crashes serialization. |
| `window.addEventListener` | `useOnWindow` | Manual listeners leak memory. |
| `export default function` | `component$()` | Optimizer needs `component$` wrapper. |
| **Logic in Routes** | `lib/services` | Routes are for orchestration only. |
| **Raw SQL in Components** | `drizzle` + `server$` | Keep DB access secure and structured. |
| `<form onSubmit>` | `<Form action={...}>` | Use Qwik City's progressive enhancement form. |


### 7. Qwik Mental Model (TL;DR)

- SSR first
- HTML streams immediately
- JS loads only on interaction
- No hydration
- State is serializable
- Resume, don’t re-run
```