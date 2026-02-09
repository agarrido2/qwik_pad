
# **Arquitectura Canónica Definitiva para Qwik + Supabase**

**Propósito**:  
Este documento establece la arquitectura y las reglas canónicas para la construcción de aplicaciones Qwik con secciones públicas y privadas.

Su objetivo es servir como la **única fuente de verdad** para la organización del código, eliminando ambigüedades arquitectónicas y asegurando:

- Escalabilidad real
- Mantenibilidad a largo plazo
- Separación estricta de responsabilidades
- Compatibilidad con el modelo de ejecución de Qwik (SSR, streaming, resumability)

Este documento no describe “una posible arquitectura”, sino **la arquitectura de referencia del proyecto**.

---

## **SECCIÓN 0: EL PATRÓN ORCHESTRATOR**

### La Filosofía Central

En Qwik City, el sistema de archivos **ES** el router.  
Pero el router **NO ES** lógica de negocio.

Las rutas existen para **orquestar**:
- qué datos se cargan
- qué servicios se ejecutan
- qué componentes se renderizan
- en qué orden ocurre todo

No existen para **decidir cómo funciona el sistema**.

**Analogía Musical**  
`routes/` es el **director de orquesta**.  
Los músicos (`lib/`, `services/`, `features/`, `components/`) ejecutan la lógica.

El director:
- No toca instrumentos
- No compone la música
- Solo coordina **CUÁNDO** y **QUIÉN** actúa

---

### Principio de Separación de Responsabilidades

Las rutas **pueden**:
- Invocar `routeLoader$`, `routeAction$`, `onGet`, `onPost`
- Orquestar flujos
- Importar servicios
- Ensamblar vistas

Las rutas **NO deben**:
- Contener lógica de negocio reutilizable
- Ejecutar queries directas
- Implementar reglas de dominio
- Tomar decisiones que no sean de orquestación

```tsx
// ❌ ANTI-PATRÓN: Lógica de negocio en la ruta
export const useProfile = routeLoader$(async ({ params }) => {
  const sql = postgres(process.env.DATABASE_URL);
  const result = await sql`
    SELECT * FROM profiles WHERE id = ${params.id}
  `;
  return result[0];
});
```

```tsx
// ✅ PATRÓN CORRECTO: La ruta orquesta, el servicio ejecuta
export const useProfile = routeLoader$(async ({ params }) => {
  return await AuthService.getProfile(params.id);
});
```

>Nota:
>Que una función viva en un routeLoader$ **no la convierte automáticamente en lógica de orquestación**.
>Si esa lógica sería reutilizable fuera de la ruta, **no pertenece** a routes/.

### Regla de Oro del Orchestrator

**“Si borrando `src/routes/` pierdes lógica de negocio, la arquitectura está rota.”**

Las rutas deben ser:
- Finas
- Sustituibles
- Reescribibles

Si mañana se migra:
- de Qwik a Next.js
- de Qwik City a otra capa de transporte
- de web a workers o APIs

solo debería reescribirse:
- el enrutamiento
- la orquestación

**Nunca la lógica de dominio** (`lib/`, `features/`, `services/`).

---

### Relación Directa con Qwik

Este patrón está alineado con el modelo de ejecución de Qwik:

- **SSR y Streaming**  
  Las rutas coordinan *cuándo* se resuelve cada fragmento de datos.

- **Resumability**  
  La lógica de negocio vive fuera del ciclo de renderizado y no depende de hidratación.

- **routeLoader$ / routeAction$**  
  Actúan como adaptadores entre el router y los servicios reales.

La ruta **no es el sistema**.  
Es la capa de entrada al sistema.

---

### Ventajas del Patrón Orchestrator

1. **Testeable**  
   Los servicios (`AuthService`, `BillingService`, etc.) se testean sin levantar rutas ni servidor.

2. **Reutilizable**  
   La misma lógica sirve para:
   - Rutas web
   - APIs
   - Webhooks
   - Jobs
   - Workers

3. **Mantenible**  
   Cambios en reglas de negocio o queries no obligan a modificar decenas de archivos de rutas.

4. **Seguro**  
   La lógica sensible queda aislada en capas no públicas, reduciendo la superficie de ataque.

---

### Principio Canónico

Las rutas **no son el dominio**.  
Las rutas **no son el sistema**.  
Las rutas **no son el lugar donde vive la lógica**.

Las rutas **orquestan**.  
Nada más.

---
### **PARTE 1: PRINCIPIOS FUNDAMENTALES DE ARQUITECTURA**

Esta sección define las leyes estructurales del proyecto.  
No son sugerencias: son restricciones diseñadas para garantizar escalabilidad, claridad y seguridad en Qwik.

---

### 1. Separación Estricta de Dominios

La estructura del proyecto impone una separación **inflexible** entre dominios con responsabilidades claramente delimitadas:

- **Presentación y Orquestación (`src/routes`)**  
  Gestiona el enrutamiento, la carga de datos y el ensamblado de vistas.  
  Actúa como adaptador entre el router de Qwik City y la lógica real del sistema.

- **Sistema de Diseño y UI (`src/components`)**  
  Contiene componentes de interfaz reutilizables, predecibles y agnósticos de negocio.  
  No conoce rutas, no conoce servicios, no conoce reglas de dominio.

- **Lógica de Negocio y Servicios (`src/lib`)**  
  Encapsula:
  - Reglas de negocio
  - Estado compartido
  - Acceso a datos
  - Comunicación con servicios externos

> Regla estructural:  
> **`routes` y `components` dependen de `lib`.  
> `lib` no depende nunca de `routes` ni de `components`.**

---

### 2. Orquestación en las Rutas

El directorio `src/routes` es el **orquestador del sistema**, no su implementación.

Su responsabilidad se limita a:
- Invocar loaders y actions
- Consumir servicios de `src/lib`
- Componer vistas con componentes de `src/components`

**Regla de Oro**  
Las rutas **NUNCA** deben contener lógica de negocio reutilizable.

Si una lógica:
- se repite
- contiene reglas
- accede a datos
- valida permisos

entonces **NO pertenece a una ruta**.

---

### 3. Seguridad Centralizada en el Servidor

La protección de rutas privadas **DEBE** implementarse en servidor, nunca en cliente.

**Patrón Canónico: Auth Guard en Layout**

- El `routeLoader$` del layout del grupo protegido  
  (`src/routes/(app)/layout.tsx`)
- Actúa como *Auth Guard*
- Verifica sesión y permisos
- Redirige antes de renderizar cualquier contenido

Esto garantiza:
- No fugas de información
- No flashes de UI protegida
- No dependencia de JS en cliente para seguridad

> Regla:  
> **Si el usuario no está autorizado, la UI no debe existir.**

---

### 4. Gestión de Estado Explícita y Controlada

El estado debe ser **predecible**, **localizable** y **limitado en alcance**.

#### Estado Local
- Usar `useSignal()`
- Para estado:
  - Local a un componente
  - Simple
  - Efímero

Ejemplos:
- Inputs
- Toggles
- Estados visuales

#### Estado Global
- Usar `useContext()`
- Solo cuando:
  - El estado debe compartirse entre ramas del árbol
  - Representa sesión, identidad o configuración global

**Ubicación Canónica**
- Definición del contexto (`createContextId`) → `src/lib/contexts`
- Proveedor lógico (`AuthProvider`, etc.) → `src/lib/*`

> Regla:  
> **No usar context para estado derivable, local o fácilmente recomputable.**

El abuso de estado global genera:
- Acoplamiento
- Bugs difíciles de rastrear
- Pérdida de claridad arquitectónica

---

### Principio Final de la PARTE 1

La arquitectura no existe para organizar carpetas.  
Existe para **limitar errores**, **guiar decisiones** y **hacer el sistema obvio**.

Si una decisión arquitectónica requiere explicación constante,  
la arquitectura no está cumpliendo su función.

---
### **PARTE 2: ESTRUCTURA DE DIRECTORIOS CANÓNICA**

Esta es la estructura de directorios oficial y definitiva del proyecto.  
Es el plano maestro que materializa los principios de esta guía.  
Aplícala sin desviaciones.

```text
/
├── public/                     # favicon.svg, manifest.json, robots.txt y otros ficheros estáticos sin procesar.
│
└── src/                        # 📂 Directorio raíz del código fuente de la aplicación Qwik.
    │
    ├── assets/                 # 📦 Ficheros estáticos que SÍ se procesan por el bundler.
    │   ├── css/                # Estilos globales y base del proyecto.
    │   │   ├── global.css      # 🌍 Estilos globales (reset, tokens, base styles).
    │   │   └── fonts.css       # Declaración de fuentes (@font-face).
    │   │
    │   └── fonts/              # Fuentes locales (woff2, ttf).
    │
    ├── components/             # 🧩 Componentes de UI reutilizables.
    │   ├── icons/              # Iconos SVG como componentes type-safe (PropsOf<'svg'>).
    │   │
    │   ├── ui/                 # Componentes de UI puros y agnósticos.
    │   │                        # (Botones, Inputs, Badges, Cards, Modales).
    │   │
    │   ├── shared/             # Componentes de composición reutilizables.
    │   │                        # (Header, Footer, Hero, FeatureSection, etc.)
    │   │                        # Pueden usar componentes de `ui/` pero no lógica de negocio.
    │   │
    │   └── layout/             # Componentes estructurales de aplicación.
    │                            # (AppLayout, SidebarLayout, DashboardShell).
    │
    ├── hooks/                  # 🪝 Hooks personalizados (`use...$`) reutilizables.
    │
    ├── lib/                    # 🧠 Lógica de negocio y código no visual (cerebro de la app).
    │   ├── auth/               # Lógica de autenticación (AuthProvider, helpers).
    │   ├── contexts/           # Definiciones de contextos (createContextId).
    │   ├── db/                 # Cliente de base de datos y ORM (Drizzle).
    │   ├── schemas/            # Schemas de validación (Zod).
    │   ├── services/           # Integraciones externas (Stripe, Email, etc.).
    │   ├── supabase/           # Configuración de clientes Supabase (server / client).
    │   ├── types/              # Tipos e interfaces globales de TypeScript.
    │   └── utils/              # Utilidades genéricas reutilizables.
    │
    └── routes/                 # 🗺️ Enrutador de Qwik City (páginas y endpoints).
        │
        ├── api/                # Endpoints de backend (JSON, webhooks, integraciones).
        │   └── products/
        │       └── index.ts    # Handlers onGet / onPost.
        │
        ├── (public)/           # 🌐 Rutas públicas (Landing Page).
        │   ├── layout.tsx      # Layout público (Header/Footer de marketing).
        │   └── index.tsx       # Home pública.
        │
        ├── (auth)/             # 🔐 Flujo de autenticación.
        │   ├── layout.tsx      # Layout centrado en formularios.
        │   ├── login/
        │   ├── register/
        │   ├── forgot-password/
        │   └── reset-password/
        │
        ├── (app)/              # 🧭 Rutas privadas (dashboard).
        │   ├── layout.tsx      # Layout protegido (Auth Guard + App Shell).
        │   └── dashboard/
        │       └── index.tsx
        │
        ├── layout.tsx          # 🚪 Layout raíz global (Providers globales).
        │
        └── service-worker.ts   # ⚙️ Service Worker (PWA, caching, offline).
```

### Principios Implícitos de esta Estructura

- `assets/` define **la base visual global** del sistema (estilos, fuentes, tokens).
- `components/ui/` contiene **componentes atómicos y agnósticos**:
  - No conocen rutas
  - No conocen lógica de negocio
  - No conocen contexto de aplicación
- `components/shared/` agrupa **bloques de composición visual reutilizables**:
  - Header, Footer, Hero, FeatureSection, etc.
  - Pueden componer `ui/`
  - No contienen lógica de negocio
- `components/layout/` define **estructuras de página o aplicación**:
  - AppShell
  - DashboardLayout
  - Wrappers estructurales de vistas completas
- `lib/` contiene **toda la lógica que importa**:
  - Negocio
  - Autenticación
  - Integraciones
  - Validación
  - Estado global
- `routes/` **orquesta**:
  - Decide qué se renderiza
  - Decide cuándo se carga
  - Nunca implementa lógica de negocio

> Regla mental:
> Si un archivo no encaja claramente en uno de estos dominios,  
> **la arquitectura debe revisarse antes de escribir código**.

---

### **PARTE 3: REGLAS DETALLADAS POR DOMINIO**

Esta sección define de forma explícita:
- Qué responsabilidad tiene cada dominio
- Qué tipo de código puede vivir en cada uno
- Qué dependencias están permitidas
- Qué dependencias están estrictamente prohibidas

Estas reglas no son sugerencias.  
Son **contratos arquitectónicos**.

---

#### 3.1 `src/components/` — El Sistema de Diseño

**Directiva**  
Este directorio contiene exclusivamente componentes de UI.

Los componentes deben ser:
- Puros
- Reutilizables
- Serializables
- Agnósticos a la lógica de negocio

**Está prohibido** que un componente en `components/`:
- Acceda a base de datos
- Ejecute lógica de dominio
- Realice validaciones de negocio
- Tome decisiones de autorización
- Importe desde `lib/services`, `lib/db` o `routes`

---

##### `components/icons/`

Sistema de iconos SVG reutilizables.

- **Regla**:  
  Todos los iconos son componentes tipados con `PropsOf<'svg'>`.

- **Patrón canónico**:
  ```ts
  export function IconName(
    props: PropsOf<'svg'>,
    key: string
  ) {
    return <svg {...props} key={key}>...</svg>;
  }
    ```

- **Uso**:
    ```tsx
        <ChevronDown aria-hidden="true" class="h-4 w-4" />
        ```
- **Beneficios**:
    - Type-safety completo
    - Eliminación de SVG inline
    - Herencia automática de currentColor
    - Mejor accesibilidad (aria-hidden)
    - Theming consistente


---
##### `components/ui/`

Componentes **atómicos y agnósticos** del sistema de diseño.

- Ejemplos:
  - Button
  - Input
  - Card
  - Modal

- **Regla**:
  - Reciben datos por `props`
  - Emiten eventos por callbacks serializables
  - No conocen contexto de aplicación

- **Prohibido**:
  - Lógica de negocio
  - Acceso a contextos globales
  - Side-effects
  - Fetch de datos

Estos componentes son **reutilizables en cualquier proyecto**.

---

##### `components/shared/`

Componentes de **composición visual reutilizable**.

Representan secciones completas de UI formadas por componentes `ui`.

Ejemplos:
- Header
- Footer
- Hero
- FeatureSection
- PricingSection

**Reglas**:
- Pueden componer múltiples componentes `ui`
- Pueden recibir datos por props
- Pueden consumir contextos de solo lectura (ej. usuario para mostrar nombre)
- **No ejecutan lógica de negocio**
- **No hacen fetch de datos**
- **No implementan reglas de dominio**

---

##### `components/layout/`

Componentes responsables de la **estructura de página o aplicación**.

Ejemplos:
- AppLayout
- AuthLayout
- DashboardLayout
- Shells estructurales

**Reglas**:
- Pueden consumir contextos globales
- Pueden organizar `<Slot />`
- Pueden definir estructura visual
- **Nunca implementan lógica de dominio**
- **Nunca validan permisos**

#### 3.2 `src/lib/` — Lógica de Negocio y Servicios

**Directiva**  
Este directorio es el **cerebro de la aplicación**.

Toda lógica relevante vive aquí.

**Reglas de dependencia**:
- `routes/` → puede importar desde `lib/`
- `components/` → puede importar desde `lib/contexts` (lectura)
- `lib/` → **NUNCA** importa desde `components` ni `routes`

---

##### `lib/auth/`

Único lugar para la lógica de autenticación.

- Define:
  - `AuthProvider`
  - Helpers para `routeLoader$`
  - Helpers para `routeAction$`

Centraliza:
- Sesión
- Roles
- Autorización
- Reglas de acceso

---

##### `lib/supabase/`

Centraliza toda la configuración de Supabase.

- Define y exporta:
  - Cliente servidor
  - Cliente autenticado

**Regla**:  
Ningún cliente Supabase se inicializa fuera de este dominio.

---

##### `lib/schemas/`

Fuente única de verdad para validación de datos.

- Schemas Zod para:
  - Formularios
  - Acciones
  - APIs

Uso obligatorio en:
- `routeAction$`
- `server$`
- Servicios

---

##### `lib/types/`

Centraliza tipos e interfaces compartidas.

**Regla**:  
Si un tipo se usa en más de un dominio, debe vivir aquí.

---

##### `lib/contexts/`

Contiene exclusivamente definiciones de `createContextId`.

- Separa definición del contexto
- De su implementación (Provider)

---

##### `lib/services/`

Encapsula comunicación con APIs externas.

Ejemplos:
- Stripe
- Email
- Servicios externos

Las rutas consumen servicios.  
Los servicios **nunca conocen rutas**.

---

#### 3.3 `src/routes/` — El Orquestador

Las rutas **no son el sistema**.  
Son la capa de coordinación.

---

##### `(public)` y `(auth)`

- Rutas públicas
- Optimizadas para SEO y performance
- `(auth)` agrupa flujos de autenticación

---

##### `(app)` — Rutas Protegidas

- El `layout.tsx` es el **punto único de control**
- Su `routeLoader$`:
  - Verifica sesión
  - Redirige antes del render
  - Importa lógica desde `lib/auth` o `lib/supabase`

Nada bajo `(app)` se renderiza sin sesión válida.

---

##### `api/`

- Endpoints de servidor:
  - Webhooks
  - APIs externas

**No usar** para formularios internos.

---

##### `layout.tsx` (raíz)

- Proveedores globales
- Guards iniciales
- Lógica transversal mínima

#### 3.4 `src/tests/` — Estrategia de Testing

**Directiva**  
Los tests deben reflejar la arquitectura.

Si un test obliga a romper capas,
la arquitectura está mal.

---

##### 3.4.1 Organización

- Unit tests junto al archivo testeado
- Integration y E2E centralizados en `src/tests`

```md
src/
├── lib/
│   └── auth/
│       ├── auth.service.ts
│       └── auth.service.test.ts
│
├── features/
│   └── billing/
│       ├── billing.service.ts
│       └── billing.service.test.ts
│
└── tests/
    ├── integration/
    │   ├── auth-flow.test.ts
    │   └── payment-flow.test.ts
    ├── e2e/
    │   ├── onboarding.spec.ts
    │   └── checkout.spec.ts
    └── fixtures/
        ├── users.ts
        └── products.ts
```

##### 3.4.2 Estrategia por Capa

- **Unit tests**:
  - Servicios (`lib/`)
  - Features (`features/`)
    Example:
    ```typescript
        // src/lib/auth/auth.service.test.ts
        import { describe, it, expect, vi } from 'vitest';
        import { AuthService } from './auth.service';
        import { db } from '~/lib/db/client';

        // Mock de DB
        vi.mock('~/lib/db/client', () => ({
            db: { query: { profiles: { findFirst: vi.fn() } } }
        }));

        describe('AuthService.getProfile', () => {
            it('debe retornar perfil existente', async () => {
            const mockProfile = { id: '1', fullName: 'Test User' };
            vi.mocked(db.query.profiles.findFirst).mockResolvedValue(mockProfile);
    
        const result = await AuthService.getProfile('1');
        expect(result).toEqual(mockProfile);
            });
        });
    ```
- **Integration tests**:
  - Flujos completos
    Example:
    ```typescript
        // src/tests/integration/auth-flow.test.ts
        import { test, expect } from '@playwright/test';

        test('flujo completo de autenticación', async ({ page }) => {
        // 1. Visitar login
        await page.goto('/login');
  
        // 2. Llenar formulario
        await page.fill('[name="email"]', 'test@example.com');
        await page.fill('[name="password"]', 'password123');
        await page.click('button[type="submit"]');
  
        // 3. Verificar redirección a dashboard
        await expect(page).toHaveURL('/dashboard');
        });
        ```
- **Component tests**:
  - UI aislada
    Example:
    ```typescript
    // src/components/ui/Button.test.tsx
    import { describe, it, expect } from 'vitest';
    import { render } from '@builder.io/qwik/testing';
    import { Button } from './Button';

    describe('<Button />', () => {
        it('debe renderizar children', async () => {
        const { screen } = await render(<Button>Click me</Button>);
        expect(screen.getByText('Click me')).toBeTruthy();
        });
    });
    ```
##### 3.4.3 Reglas de Testing

1. Unit tests obligatorios para servicios críticos
2. Testear comportamiento, no implementación
3. Mock solo dependencias externas
4. E2E para user journeys críticos
5. No testear rutas directamente

##### 3.4.4 Coverage Targets

| Capa | Cobertura | Prioridad |
|------|-----------|----------|
| `lib/services/` | 90%+ | 🔴 Crítica |
| `features/*/services/` | 85%+ | 🔴 Crítica |
| `lib/utils/` | 95%+ | 🟡 Alta |
| `components/ui/` | 80%+ | 🟢 Media |
| `routes/` | 50%+ | 🟢 Baja (E2E cubre) |

**Comando:**  
`bun test --coverage`(Vitest)

---


*********
### **PARTE 4: PATRÓN HÍBRIDO — FEATURES COMPLEJAS**

Esta parte define **cuándo**, **por qué** y **cómo** introducir `src/features/`
sin romper la arquitectura canónica ni el principio de orquestación.

El patrón híbrido **NO sustituye** a `lib/`.  
Lo complementa cuando la complejidad lo exige.

---

#### 4.1 Concepto

Para **features complejas** con múltiples archivos relacionados
(**más de 5 archivos**), se permite usar el patrón
**Feature-Sliced Design** mediante la carpeta `src/features/`.

Este patrón híbrido mantiene explícitamente:

- ✅ **`src/lib/`**
  - Core fundamental
  - Servicios transversales
  - API pública estable

- ✅ **`src/features/`**
  - Implementación interna de una feature concreta
  - Código cohesionado y altamente relacionado

> Regla clave  
> `lib/` define **la API pública**  
> `features/` contiene **la implementación privada**

#### 4.2 Estructura de Features

```md
src/
├── lib/                        # 🧠 Core fundamental (transversal)
│   ├── auth/                   #    - Facade de autenticación (punto de entrada único)
│   │   └── index.ts            #    - Re-exports públicos
│   ├── supabase/               #    - Cliente Supabase
│   └── utils/                  #    - Utilidades genéricas
│
└── features/                   # 📦 Features complejas (Feature-Sliced Design)
    └── auth/                   #    - Implementación detallada de autenticación
        ├── auth-context.ts     #    - Definición del AuthContext
        ├── hooks/
        │   └── use-auth-context.ts
        ├── schemas/
        │   └── auth-schemas.ts
        ├── services/
        │   └── auth-helpers.ts
        ├── components/
        │   └── UserProfileCard.tsx
        └── index.ts            #    - Barrel export interno
```
>Importante
>El ´index.ts´ dentro de ´features´ **NO es un facade público**, sólo sirve para **organización interna** de la feature.


---

#### 4.3 Reglas del Patrón Híbrido

##### Cuándo usar `src/features/[feature-name]/`

Se **DEBE** usar `features/` cuando se cumplan **todas o la mayoría**:

1. Feature con **más de 5 archivos** relacionados
2. Requiere **múltiples subcarpetas**
   - hooks
   - schemas
   - services
   - components
3. Tiene **lógica específica** no reutilizable en otras features
4. Puede **crecer significativamente**
   - OAuth
   - MFA
   - Roles
   - Workflows complejos

Ejemplos válidos:

- `auth`
- `billing`
- `notifications`
- `workflows`

---

##### Cuándo usar `src/lib/[module]/`

Usar `lib/` cuando el código sea:

1. **Transversal** (usado por varias features)
2. **Fundamental** para la aplicación
3. **Simple** en complejidad estructural (<5 archivos)

Ejemplos:

- `supabase`
- `database`
- `utils`
- `constants`

---



#### 4.4 Patrón Facade - Punto de Entrada Único

Toda feature ubicada en `src/features/` **DEBE** exponer un único punto de entrada público en `src/lib/`.

Ese punto es el **facade**.

**Ejemplo: Sistema de Autenticación**

```ts
// ✅ src/lib/auth/index.ts (FACADE - Punto de entrada único)
export { AuthProvider } from '~/components/auth/AuthProvider'
export { AuthContext } from '~/features/auth/auth-context'
export { useAuth } from '~/features/auth/hooks/use-auth-context'
export { RouteClassifier, getAuthRedirect } from '~/lib/routing/route-guards'
export type { AuthContextValue } from '~/features/auth/auth-context'
```
>Regla
>routes/ solo importa desde lib/, nunca desde features/.

**Patrón de Importación:**

```typescript
// ✅ CORRECTO: Importar desde lib/auth (facade)
import { useAuth, AuthProvider, RouteClassifier } from '~/lib/auth'

// ✅ CORRECTO: Features específicas cuando sea necesario
import { authSchemas } from '~/features/auth'
import { withSupabase } from '~/features/auth'
import { UserProfileCard } from '~/features/auth'

// ❌ INCORRECTO: No importar internals directamente
import { useAuthContext } from '~/features/auth/hooks/use-auth-context'
```

#### 4.5 Flujo de Dependencias

```
routes/ (Orquestador)
    ↓ importa
lib/auth/ (Facade - API pública)
    ↓ usa internamente
features/auth/ (Implementación privada)
    ├── hooks/
    ├── schemas/
    ├── services/
    └── components/
```

**Reglas de Oro:**

1. 🚫 `routes/` → **NUNCA** importa desde `features/` directamente → usa `lib/` (facade)
2. ✅ `lib/auth/` → puede re-exportar desde `features/auth/`
3. 🚫 `features/auth/` → **NUNCA** importa desde `lib/auth/` (evitar ciclos)
4. ✅ `features/auth/` → puede usar `lib/supabase/`, `lib/utils/` (servicios base)

#### 4.6 Patrón de Namespaces para Servicios

Para mejorar la Developer Experience (DX) y evitar colisiones de nombres, todos los servicios **deben** usar el patrón de namespace:

**Estructura Recomendada:**

```ts
// ✅ CORRECTO: src/lib/auth/auth.service.ts
export const AuthService = {
  async getProfile(userId: string) {
    return await db.query.profiles.findFirst({
      where: eq(profiles.id, userId),
    });
  },

  async updateProfile(userId: string, data: ProfileUpdate) {
    return await db.update(profiles)
      .set(data)
      .where(eq(profiles.id, userId))
      .returning();
  },

  async deleteProfile(userId: string) {
    return await db.delete(profiles)
      .where(eq(profiles.id, userId));
  },
} as const;
```
**Ventajas del Patrón:**

1. ✅ **Autocomplete Mejorado:** Escribir `AuthService.` muestra todos los métodos disponibles
2. ✅ **Organización Visual:** Agrupa funciones relacionadas en un solo namespace
3. ✅ **Previene Colisiones:** Evita conflictos entre `getProfile()` de Auth vs. Billing
4. ✅ **Tree-Shaking:** El `as const` ayuda a bundlers a eliminar métodos no usados
5. ✅ **Type-Safety:** TypeScript infiere tipos automáticamente

**Comparación con Funciones Sueltas:**

```ts
// ❌ ANTI-PATRÓN: Funciones sueltas
export async function getProfile(userId: string) { ... }
export async function updateProfile(userId: string, data: ProfileUpdate) { ... }

// Problema 1: No hay agrupación visual en imports
import { getProfile, updateProfile } from '~/lib/auth/auth.service';

// Problema 2: Colisiones de nombres
import { getProfile } from '~/lib/auth/auth.service';
import { getProfile } from '~/features/billing/billing.service'; // ❌ Error!

// ✅ SOLUCIÓN: Namespace
import { AuthService } from '~/lib/auth/auth.service';
import { BillingService } from '~/features/billing/billing.service';

AuthService.getProfile(userId);    // ✅ Claro y sin colisiones
BillingService.getProfile(userId); // ✅ Distinto namespace
```

**Convención de Nombres:**

```typescript
// Pattern: [Feature]Service
AuthService       // src/lib/auth/auth.service.ts
BillingService    // src/features/billing/billing.service.ts
NotificationService // src/features/notifications/notification.service.ts
EmailService      // src/lib/services/email.service.ts
```

**Regla:** El nombre del namespace debe ser `PascalCase` y terminar en `Service`.

#### 4.7 Ventajas del Patrón Híbrido

- ✅ **Escalabilidad**: Features complejas crecen sin saturar `lib/`
- ✅ **Cohesión**: Archivos relacionados agrupados
- ✅ **API Limpia**: Facade oculta complejidad interna
- ✅ **Mantenibilidad**: Fácil encontrar y modificar código
- ✅ **Compliance**: Respeta principios de arquitectura canónica
- ✅ **DX Superior**: Namespaces mejoran autocomplete y previenen colisiones

---