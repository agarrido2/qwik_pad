# Estándares de Calidad - Qwik Design.

**Propósito**: Este documento define criterios medibles y objetivos para los 5 pilares de calidad que todo código debe cumplir: **Performante**, **Idiomático**, **Robusto**, **Accesible** y **Seguro**.

## CONVENCIÓN DE AUDITORÍA

- OBLIGATORIO: El incumplimiento genera fallo directo.
- MEDIBLE: Puede ser evaluado automáticamente por el agente.
- CONTEXTUAL: Requiere juicio humano o revisión manual.

---

## 1. PERFORMANTE

### Métricas Cuantificables (OBLIGATORIO · MEDIBLE)

| Métrica | Objetivo | Herramienta |
|--------|----------|-------------|
| **Bundle inicial JS** | Ideal: < 1KB (Qwik puro). Aceptable: < 5KB sin justificación. > 5KB requiere justificación explícita | Vite build analysis |
| **Time to Interactive (TTI)** | < 3s | Lighthouse |
| **Largest Contentful Paint (LCP)** | < 2.5s | Lighthouse |
| **Cumulative Layout Shift (CLS)** | < 0.1 | Lighthouse |
| **First Input Delay (FID)** | < 100ms | Lighthouse |
| **Hydration** | **CERO** (resumability, no hydration) | N/A (arquitectura) |

> **Nota**  
> Las métricas definen objetivos de calidad.  
> El incumplimiento de métricas marcadas como **OBLIGATORIO** debe ser reportado explícitamente por el agente.

---

### Checklist de Verificación (OBLIGATORIO)

- Usa `routeLoader$` para obtención de datos en servidor (SSR).
- Lazy loading de imágenes con `loading="lazy"` o mediante `@unpic/qwik`.
- **Dimensiones explícitas**: toda imagen define `width` y `height` o `aspect-ratio` (prevención de CLS).
- **Scripts de terceros** ejecutados obligatoriamente vía **Partytown** (Web Worker).
- Componentes pesados cargados *on-demand* (code splitting automático de Qwik).
- **`useVisibleTask$` RESTRINGIDO**. Solo permitido para:
  - Acceso directo al DOM
  - APIs del navegador (`localStorage`, `matchMedia`, `IntersectionObserver`, etc.)
  - Integraciones JavaScript puramente cliente
- Usa `useTask$` para lógica reactiva y efectos resumables (no hidrata).
- Prefiere `useSignal()` sobre `useStore()` para valores primitivos.
- Cualquier uso de `useVisibleTask$` fuera de los casos permitidos se considera **incumplimiento de performance**.

---

### Ejemplos

#### ✅ CORRECTO

```ts
// routeLoader$ para datos SSR (cero JS en cliente)
export const useUserData = routeLoader$(async () => {
  return await fetchUserData();
});

export default component$(() => {
  const userData = useUserData();
  return <div>{userData.value.name}</div>;
});
```
### ❌ INCORRECTO
```tsx
// useVisibleTask$ innecesario (hidrata en cliente)
export default component$(() => {
  const userData = useSignal(null);

  useVisibleTask$(async () => {
    userData.value = await fetchUserData(); // 🔴 Hidrata
  });

  return <div>{userData.value?.name}</div>;
});
```

---
## 2. IDIOMÁTICO (Qwik)

Esta sección define **cómo debe escribirse el código en Qwik**.  
Un código puede funcionar y aun así **no ser idiomático**, lo que rompe la resumability, degrada performance y genera deuda técnica invisible.

---

### Patrones Correctos (OBLIGATORIOS)

| Patrón | Descripción |
|------|-------------|
| `component$()` | Todo componente **DEBE** declararse con `component$()` |
| `useSignal()` | Estado reactivo para valores primitivos |
| `useStore()` | Estado reactivo para objetos y arrays |
| `useTask$()` | Efectos reactivos resumables (equivalente idiomático a `useEffect`) |
| `useVisibleTask$()` | Solo para lógica **exclusivamente cliente** |
| `routeLoader$` | Carga de datos server-side (SSR) |
| `routeAction$` | Mutaciones server-side |
| `server$` | RPC functions para lógica de servidor |
| Sufijo `$` | Obligatorio en funciones serializables |
| JSX | Sintaxis de template |

> Nota: El uso de APIs correctas no es opcional.  
> Usar patrones de otros frameworks dentro de Qwik se considera **incumplimiento idiomático**.

---

### ⚠️ Regla de Oro: Serialización

Qwik pausa y reanuda la aplicación serializando el estado.  
Todo lo que forme parte del estado **DEBE ser serializable**.

#### Tipos Permitidos

- Strings
- Numbers
- Booleans
- Objects y Arrays serializables
- QRLs (`$()`)
- `Date`
- `URL`

#### Tipos Prohibidos

- Instancias de clases (`new User()`, `new Map()`, etc.)
- Promesas no resueltas
- Referencias circulares
- Callbacks sin `$`
- Objetos con métodos
- Estados derivados de closures no serializables

> Regla:  
> Si no puede convertirse de forma segura a JSON, **no debe vivir en el estado de Qwik**.

---

### Gestión Correcta de Reactividad

- Usa `useSignal()` para valores simples.
- Usa `useStore()` solo cuando:
  - Necesites múltiples propiedades reactivas
  - El estado sea estructural
- Usa `useTask$()` con `track()` para reaccionar a cambios explícitos.
- Evita efectos implícitos o dependencias ocultas.

Ejemplo correcto con `track()`:

```ts
useTask$(({ track }) => {
  track(() => count.value);
  console.log(count.value);
});
```
* No usar track() cuando el efecto depende de señales es un **error idiomático**.

### Anti-patrones a EVITAR (NO NEGOCIABLE)

- useEffect (React)
- useState (React)
- Hidratación innecesaria con useVisibleTask$
- Event handlers inline sin $
- Props no serializables
- Lógica de servidor ejecutándose en cliente
- Side-effects en el render

* Cada anti-patrón detectado deber ser **reportado por el agente auditor**.

* Ejemplos:
- ✅ CORRECTO:
```tsx
export default component$(() => {
  const count = useSignal(0);

  const increment = $(() => {
    count.value++;
  });

  return (
    <button onClick$={increment}>
      Count: {count.value}
    </button>
  );
});
```

- ❌ INCORRECTO:
```tsx
// Anti-patrón: Mezclando React con Qwik
export default component$(() => {
  const [count, setCount] = useState(0); // 🔴 Hook de React

  useEffect(() => { // 🔴 Hook de React
    console.log(count);
  }, [count]);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button> // 🔴 Handler sin $
  );
});
```
* Regla primordial de Auditoria
Si un fragmento de código:
- Parece React
- Se comporta como React
- Usa patrones de React

Entonces **no es código Qwik idiomático**, aunque funcione. 
El código idiomático en Qwik:
- Es serializable
- Es explicita
- Es resumable
- Es predecible

---
## 3. ROBUSTO

Un código robusto no es el que “no falla”,  
es el que **asume que todo puede fallar** y se comporta de forma predecible.

La robustez en Qwik se mide por:
- Validación explícita
- Manejo claro de estados
- Fallos controlados
- Comportamiento consistente ante escenarios no ideales

---

### Checklist Mínimo (NO NEGOCIABLE)

- ✅ **TypeScript strict mode** habilitado (`strict: true` en tsconfig.json).
- ✅ **Tipado correcto de Loaders y Actions** (inferir tipos, manejar `null` y `undefined`).
- ✅ **Validación de inputs** de usuario con Zod **en servidor**.
- ✅ **Estados de error visibles en UI** (nunca errores silenciosos).
- ✅ **Estados de carga explícitos** (`isRunning`, skeletons, spinners).
- ✅ **Fallbacks defensivos** (`?.`, `??`) para datos opcionales.
- ✅ **Try-catch** en operaciones async críticas.
- ✅ **Manejo de edge cases**:
  - Array vacío
  - `null` / `undefined`
  - Errores de red
  - Timeouts
- ✅ **Diferenciar errores esperados** (validación, permisos, negocio)
  de **errores inesperados** (500, excepciones, infraestructura).

> Regla:  
> Si un error es posible, **debe estar representado en la UI**.

---

### Distribución Correcta de Responsabilidades

- **Cliente**
  - Feedback visual
  - Estados de carga
  - Estados de error legibles
- **Servidor**
  - Validación
  - Autorización
  - Lógica de negocio
- **UI**
  - Nunca asumir datos válidos
  - Nunca romperse ante datos incompletos

La robustez **no se delega al usuario**.

---

### Nice to Have (Recomendado)

- Error boundaries (Qwik ErrorBoundary)
- Retry logic en peticiones críticas (exponential backoff)
- Logging estructurado de errores (ej. Sentry)
- Tests unitarios para lógica crítica

Estas prácticas aumentan resiliencia,
pero **no sustituyen la checklist mínima**.

---

### Ejemplos

#### ✅ CORRECTO

```ts
import { z } from 'zod';
import { routeAction$, zod$ } from '@builder.io/qwik-city';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const useLoginAction = routeAction$(
  async (data) => {
    try {
      const user = await loginUser(data.email, data.password);
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error
          ? error.message
          : 'Login failed',
      };
    }
  },
  zod$(loginSchema)
);

export default component$(() => {
  const loginAction = useLoginAction();

  return (
    <form action={loginAction}>
      {loginAction.value?.success === false && (
        <div role="alert">
          {loginAction.value.error}
        </div>
      )}

      <input name="email" type="email" required />
      <input name="password" type="password" required />

      <button type="submit" disabled={loginAction.isRunning}>
        {loginAction.isRunning ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
});
```

#### ❌ INCORRECTO:

```tsx
// Sin validación, sin manejo de errores, sin estado de carga
export default component$(() => {
  return (
    <form action="/api/login">
      <input name="email" />
      <input name="password" />
      <button>Login</button>
    </form>
    // 🔴 Errores silenciosos
    // 🔴 UX impredecible
  );
});
```

### Regla Final de Auditoria - ROBUSTO.
Si un componente:
- Puede fallar y no lo comunica
- Asume datos válidos sin validarlos
- No contempla estados intermedios
- Se rompe ante un edge case trivial

Entonces **NO ES ROBUSTO**, aunque "funcione".

La robustez no se prueba en el happy path, se prueba cuando algo sale mal.

---

## 4. ACCESIBLE (a11y)

La accesibilidad no es una feature, es un requisito estructural de calidad.

Un sistema accesible es:
- Más usable
- Más robusto
- Más fácil de mantener
- Mejor interpretado por motores de búsqueda

En Qwik, la accesibilidad comienza en el HTML
y se mantiene en el comportamiento.

---

### Estándar de Referencia

WCAG 2.1 AA (mínimo obligatorio)

No se aceptan desviaciones sin justificación explícita.

---

### Checklist Obligatorio (NO NEGOCIABLE)

- HTML semántico correcto:
  - `<button>` para acciones
  - `<nav>` para navegación
  - `<main>` para contenido principal
  - `<article>`, `<header>`, `<footer>` cuando aplique
- Contraste de color:
  - Mínimo 4.5:1 para texto normal
  - Mínimo 3:1 para texto grande
- Alt text:
  - Todas las imágenes con `alt` descriptivo
  - No usar valores genéricos como “imagen” o “icono”
- Interactividad descriptiva:
  - Botones-icono con `aria-label`
  - Elementos interactivos con propósito explícito
- Navegación por teclado:
  - Tab, Enter y Escape funcionan correctamente
  - Ninguna acción crítica depende solo del ratón
- Focus visible:
  - Indicador de foco claro (`:focus-visible`)
  - Nunca eliminar `outline` sin alternativa accesible
- Formularios:
  - Inputs con `<label>` asociado correctamente
  - No usar `placeholder` como sustituto de label
- Roles ARIA:
  - Solo cuando sea necesario
  - Correctos para widgets personalizados (ej. `role="dialog"`)

> Regla:
> Si un componente no se puede usar solo con teclado,
> no es accesible.

---

### Accesibilidad como Reducción de Carga Cognitiva

La accesibilidad no solo cubre discapacidades permanentes, también cubre contextos reales de uso:

- Uso intensivo (B2B)
- Fatiga visual
- Multitarea
- Pantallas pequeñas
- Uso con una sola mano

Un sistema accesible:
- Reduce errores
- Reduce fricción
- Reduce abandono

Estas señales impactan directamente en:
- UX
- SEO
- Calidad percibida del producto

---

### Herramientas de Validación

- Lighthouse:
  - Accessibility score > 90
- axe DevTools:
  - 0 violaciones críticas
- Validación manual:
  - Navegación completa solo con teclado
- Screen readers:
  - VoiceOver (macOS)
  - NVDA (Windows)

Las herramientas automatizadas detectan errores.
La validación manual detecta problemas reales.

---

### Ejemplos

#### ✅ CORRECTO

```tsx
export default component$(() => {
  return (
    <>
      {/* Botón semántico con texto */}
      <button onClick$={() => handleClick()}>
        Guardar cambios
      </button>

      {/* Botón-icono con aria-label */}
      <button
        aria-label="Cerrar modal"
        onClick$={() => closeModal()}
      >
        <IconClose />
      </button>

      {/* Input con label asociado */}
      <label for="email">Email</label>
      <input id="email" type="email" required />

      {/* Navegación semántica */}
      <nav aria-label="Navegación principal">
        <ul>
          <li><a href="/">Inicio</a></li>
          <li><a href="/about">Nosotros</a></li>
        </ul>
      </nav>
    </>
  );
});
```
#### ❌ INCORRECTO

```tsx
export default component$(() => {
  return (
    <>
      {/* 🔴 Div clickable sin semántica */}
      <div onClick$={() => handleClick()}>
        Guardar
      </div>

      {/* 🔴 Botón-icono sin aria-label */}
      <button onClick$={() => closeModal()}>
        <IconClose />
      </button>

      {/* 🔴 Input sin label */}
      <input type="email" placeholder="Email" />

      {/* 🔴 Navegación no semántica */}
      <div class="menu">
        <div onClick$={() => navigate('/')}>Inicio</div>
        <div onClick$={() => navigate('/about')}>Nosotros</div>
      </div>
    </>
  );
});
```

### Regla Final de Auditoria - ACCESIBLE

Si un componente:
- Depende del color para comunicar estado
- No es usable sin ratón
- No expone su proposito a lectores de pantalla
- Rompe el flujo de teclado

Entonces **NO es accesible**, aunque "se vea bien".

La accesibilidad no se valida mirando la UI, se valida usándola en condiciones perfectas.

* 📘 Implementación detallada de HTML semántico, SEO y a11y:
Ver "SEO_A11Y_GUIDE.md" — reglas no negociables con ejemplos prácticos.

---

## 5. SEGURO

La seguridad no es una capa adicional, es una propiedad emergente de cómo se diseña y se estructura el sistema.

Un código inseguro puede:
- Comprometer datos
- Romper confianza
- Invalidar cualquier optimización previa (SEO, performance, UX)

En este proyecto, **la seguridad es obligatoria por defecto**.

---

### Checklist Obligatorio (NO NEGOCIABLE)

- Sanitización de inputs:
  - Prevenir XSS
  - Nunca renderizar HTML no sanitizado
- Validación server-side:
  - NUNCA confiar solo en validación client-side
  - El servidor es la fuente de verdad
- Protección CSRF:
  - Debe estar activa
  - Nunca deshabilitarla explícitamente sin justificación
- Content Security Policy (CSP):
  - Configurada en producción
  - Restringir scripts, estilos y orígenes externos
- HTTPS:
  - Obligatorio en producción
  - Ningún endpoint sensible sin TLS
- Gestión de secretos:
  - API keys y tokens solo en servidor
  - Usar `.env.local, .env` o variables de entorno
  - Nunca en código frontend
- Validación con Zod:
  - Obligatoria en `routeAction$` y `server$`
  - Especialmente en mutaciones
- Autorización explícita:
  - Verificar permisos y ownership
  - No basta con estar autenticado

> Regla:
> Si una acción modifica estado,
> debe validarse y autorizarse en el servidor.

---

### Seguridad como Control de Superficie de Ataque

Cada input, acción o endpoint expone una superficie de ataque.

Buenas prácticas reducen esa superficie:
- Menos lógica en cliente
- Más validación estructural
- Estados claros y explícitos

Malas prácticas la amplían:
- Mutaciones desde cliente
- Validaciones parciales
- Confianza implícita en el usuario

---

### Anti-patrones a Evitar

- `dangerouslySetInnerHTML` sin sanitización
- `eval()` o `new Function()` con input de usuario
- API keys hardcodeadas en frontend
- Validación solo en cliente
- Queries SQL construidas por concatenación
- Autorización basada solo en UI (botones ocultos)

> Regla:
> Si el backend confía en que el frontend “haga lo correcto”,
> el sistema es inseguro.

---

### Ejemplos

#### ✅ CORRECTO

```tsx
import { z } from 'zod';
import { routeAction$, zod$ } from '@builder.io/qwik-city';

const commentSchema = z.object({
  text: z.string().min(1).max(500),
  authorId: z.string().uuid(),
});

export const useCreateComment = routeAction$(
  async (data, { env, sharedMap }) => {
    // Acceso a secrets solo en servidor
    const apiKey = env.get('API_KEY');

    // Autorización explícita
    const userId = sharedMap.get('userId');
    if (userId !== data.authorId) {
      return { success: false, error: 'Unauthorized' };
    }

    try {
      // ORM evita SQL injection
      const comment = await db.insert(comments).values({
        text: data.text,
        authorId: data.authorId,
      });

      return { success: true, comment };
    } catch {
      return { success: false, error: 'Failed to create comment' };
    }
  },
  zod$(commentSchema)
);

export default component$(() => {
  const createComment = useCreateComment();

  return (
    <form action={createComment}>
      {/* CSRF incluido automáticamente por Qwik City */}
      <textarea name="text" required maxLength={500} />
      <button type="submit">Post comment</button>
    </form>
  );
});
```
#### ❌ INCORRECTO
```tsx
// Sin validación server-side
export const useCreateComment = routeAction$(async (data) => {
  const comment = await db.query(
    `INSERT INTO comments (text) VALUES ('${data.text}')`
  ); // SQL injection
  return { success: true };
});

// Secret expuesto en frontend
const API_KEY = 'sk-1234567890abcdef';

export default component$(() => {
  return (
    <form>
      <textarea name="text" />
      <button
        onClick$={async () => {
          await fetch('/api/comments', {
            method: 'POST',
            headers: { 'X-API-Key': API_KEY },
          });
        }}
      >
        Post
      </button>
    </form>
  );
});
```
### Regla Final de Auditoria - SEGURO.

Si una acción:
- Modifica datos
- Afecta a otros usuarios
- Accede a recursos sensibles
- Depende de identidad o permisos

Entonces debe:
- Validar datos
- Verificar autorización
- Ejecutarse exclusivamente en servidor

Sin excepciones.

### Principio General

La seguridad no se "incorpora", se diseña desde el inicio.

Un sistema seguro:
- Es más predecible
- Es más fácil de razonar
- Falla de forma controlada

La seguridad no es paranoia, es ingeniería responsable.

---

## PROTOCOLO DE VALIDACIÓN

Este protocolo define **cuándo** y **cómo** el agente auditor debe emitir una validación explícita.

El objetivo es:
- Garantizar calidad en código crítico
- Evitar ruido innecesario en código trivial
- Mantener señales claras y accionables para humanos y sistemas automatizados

---

### Código Crítico (Validación Automática OBLIGATORIA)

Para los siguientes tipos de código, el agente **DEBE** generar un **Checklist de Calidad** al finalizar la revisión:

- Formularios  
  (inputs de usuario, envío de datos, validaciones)
- Autenticación  
  (login, register, password reset, sesiones)
- Manejo de datos  
  (`routeLoader$`, `routeAction$`, `server$`)
- Componentes con estado complejo  
  (múltiples `useSignal`, `useStore`, lógica condicional relevante)

Si el código entra en cualquiera de estas categorías,
**no se permite omitir la validación**.

---

### Formato Canónico de Validación

El checklist debe seguir **exactamente** este formato:

🔍 VALIDACIÓN DE CALIDAD

Esta validación se aplica únicamente a **código crítico** según lo definido en
`QUALITY_STANDARDS.md`.

La validación evalúa **calidad estructural**, no solo funcionamiento.

---

✅ Performante
- Bundle inicial coherente con arquitectura Qwik (sin hidratación innecesaria)
- Uso correcto de `routeLoader$` / `routeAction$` / `server$` cuando aplica
- No uso indebido de `useVisibleTask$`
- Imágenes con dimensiones explícitas o `@unpic/qwik`
- Scripts de terceros ejecutados vía Partytown
- No bloqueos innecesarios del hilo principal

---

✅ Idiomático (Qwik)
- Uso exclusivo de APIs Qwik (`component$`, `useSignal`, `useStore`, etc.)
- Eventos serializables con sufijo `$`
- Props serializables (sin funciones crudas, clases o referencias circulares)
- No patrones de React (`useEffect`, `useState`, hydration mental model)
- Separación clara entre lógica de servidor y cliente

---

✅ Robusto
- Validación de datos de entrada (Zod u otro esquema equivalente)
- Manejo explícito de errores esperados e inesperados
- Estados de carga definidos para operaciones async
- Fallbacks para `null`, `undefined` y estados vacíos
- No supuestos implícitos sobre datos externos
- Tipado estricto respetado (TypeScript strict)

---

✅ Accesible
- HTML semántico correcto (`main`, `nav`, `button`, `form`, etc.)
- Navegación por teclado funcional (Tab, Enter, Escape)
- Focus visible en elementos interactivos
- Inputs con `<label>` asociado
- Botones/iconos con `aria-label` cuando no hay texto visible
- Contraste de color suficiente según WCAG 2.1 AA

---

✅ Seguro
- Validación server-side obligatoria (nunca solo cliente)
- Protección CSRF activa (no deshabilitada)
- Autorización verificada (no solo autenticación)
- Secrets accesibles solo desde servidor (`env`)
- No exposición de datos sensibles en frontend
- No uso inseguro de HTML dinámico o ejecución de código

---

📌 Resultado

- Todos los checks marcados deben tener evidencia en el código.
- Si un punto no aplica, debe indicarse explícitamente.
- Si existe una violación crítica, la validación **NO es satisfactoria**.

[CITE: QUALITY_STANDARDS.md]


Reglas:
- No inventar métricas
- No marcar checks sin evidencia
- Si un punto no aplica, debe indicarse explícitamente

---

### Código No Crítico (Sin Validación Explícita)

Para componentes simples, el agente **NO DEBE** generar checklist explícito.

Ejemplos:
- Botón estático
- Card de presentación
- Elementos puramente visuales
- Componentes sin estado ni lógica

En estos casos:
- El agente aplica los estándares de forma implícita
- Solo reporta errores si hay violaciones claras

Objetivo:
Reducir ruido sin reducir calidad.

---

### Regla de Clasificación

Si existe duda razonable sobre si un código es crítico o no,
**se considera crítico por defecto**.

Es preferible una validación extra
a una omisión silenciosa.

---

### Principio General

El protocolo no evalúa “si funciona”.
Evalúa **si es correcto, sostenible y seguro**.

La validación no es un castigo.
Es una herramienta de confianza.

## REFERENCIAS

- Qwik Docs – Best Practices  
  https://qwik.builder.io/docs/advanced/best-practices/

- Web Vitals – Google  
  https://web.dev/vitals/

- WCAG 2.1 – W3C  
  https://www.w3.org/WAI/WCAG21/quickref/

- OWASP Top 10  
  https://owasp.org/www-project-top-ten/

- Lighthouse  
  https://developers.google.com/web/tools/lighthouse
