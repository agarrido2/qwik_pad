# ANEXO A LA GUÍA MAESTRA DE QWIK - APIs Específicas

Este documento complementa la guía principal con detalles sobre APIs más específicas o de casos de uso menos frecuentes. Su propósito es servir como una referencia completa para escenarios avanzados.

---
## 1. `<QwikCityProvider>`

---
### AI USAGE RULES — FRAMEWORK ROOT (DO NOT MODIFY)

- This component is configured once by the framework template.
- DO NOT generate or modify this component in application code.
- Use for understanding Qwik City bootstrapping only.
---

- **Definición**: Es el componente raíz que habilita todas las funcionalidades de Qwik City.
- **Ubicación Canónica**: Debe envolver la aplicación completa, y se encuentra típicamente en `src/root.tsx`.
- **Función**:
    1.  **Inicializa el Router**: Pone en marcha el enrutador de Qwik City.
    2.  **Provee el Contexto de Ruteo**: Crea el contexto necesario para que hooks como `useLocation()` y `useNavigate()` funcionen en cualquier parte de la aplicación.
    3.  **Gestiona el Estado de la Ubicación**: Mantiene el estado de la URL sincronizado con la UI.
- **Uso**: Generalmente es configurado una vez por la plantilla de inicio de Qwik y rara vez necesita ser modificado directamente por el desarrollador. Es el "corazón" que hace latir a Qwik City.

---
## 2. `ErrorBoundary`

---
### AI USAGE RULES — ADVANCED / RARE

- Use ONLY when explicit error isolation is required.
- DO NOT introduce ErrorBoundaries by default.
- Prefer route-level error handling when possible.
---

- **Definición**: Un componente diseñado para capturar errores de renderizado de JavaScript en sus componentes hijos, mostrando una UI de respaldo y previniendo que toda la aplicación se rompa.
- **Mecanismo**: Utiliza el hook `useErrorBoundary()` para acceder al estado del error.
- **Patrón de Implementación**:
    1.  Se crea un componente `MyErrorBoundary`. Dentro de él, se llama al hook: `const error = useErrorBoundary();`.
    2.  El componente revisa si `error.value` existe.
    3.  Si `error.value` es `null`, renderiza a sus hijos a través del componente `<Slot />`.
    4.  Si `error.value` contiene un error, renderiza una **UI de fallback** en su lugar.
- **Ejemplo**:
    ```tsx
    import { component$, Slot, useErrorBoundary } from '@builder.io/qwik';

    export const MyErrorBoundary = component$(() => {
      const error = useErrorBoundary();

      if (error.value) {
        return <div>¡Ups! Algo salió mal.</div>;
      }

      return <Slot />;
    });

    // Uso en otra parte de la aplicación:
    <MyErrorBoundary>
      <ComponenteQuePodriaFallar />
    </MyErrorBoundary>
    ```

---
## 3. `usePreventNavigate$()`

---
### AI USAGE RULES — ADVANCED / USER EXPERIENCE

- Use ONLY for preventing data loss scenarios.
- DO NOT block navigation without user confirmation.
- Avoid overusing navigation guards.
---

- **Definición**: Un hook que permite interceptar un intento de navegación del usuario para prevenirlo o solicitar una confirmación.
- **Caso de Uso Canónico**: Evitar la pérdida de datos en formularios. Si un formulario tiene cambios sin guardar y el usuario intenta abandonar la página, este hook puede mostrar un diálogo de confirmación.
- **Mecanismo**:
    1.  Se llama al hook dentro de un componente.
    2.  Registra un `listener` que se dispara antes de que la navegación ocurra.
    3.  Si la función del `listener` devuelve `false`, la navegación se cancela.
- **Ejemplo**:
    ```tsx
    import { component$, useSignal } from '@builder.io/qwik';
    import { usePreventNavigate$ } from '@builder.io/qwik-city';

    export default component$(() => {
      const hasUnsavedChanges = useSignal(true); // Lógica para detectar cambios

      usePreventNavigate$(() => {
        if (hasUnsavedChanges.value) {
          if (!confirm('Tienes cambios sin guardar. ¿Seguro que quieres salir?')) {
            return false; // Cancela la navegación
          }
        }
        return true; // Permite la navegación
      });

      return <div>Formulario aquí...</div>;
    });
    ```

---
## 4. `DocumentScript` y `DocumentStyle`

---
### AI USAGE RULES — DOCUMENT HEAD (ADVANCED)

- Use ONLY for dynamic head manipulation.
- DO NOT inject arbitrary scripts by default.
- Prefer static assets when possible.
---

- **Definición**: No son componentes ni hooks, sino **tipos de TypeScript** específicos que se utilizan en el array `scripts` y `styles` de la exportación `head` para un control más granular.
- **`DocumentScript`**: Permite definir todos los atributos de una etiqueta `<script>`, incluyendo `innerHTML` para scripts en línea.
- **`DocumentStyle`**: Permite definir todos los atributos de una etiqueta `<style>`, incluyendo el contenido CSS en línea.
- **Uso**: Para escenarios avanzados donde se necesita inyectar scripts o estilos en el `<head>` de forma programática, por ejemplo, un script que dependa de datos cargados en un `routeLoader$`.
    ```tsx
    import type { DocumentHead, DocumentScript } from '@builder.io/qwik-city';

    export const head: DocumentHead = ({ resolveValue }) => {
      const data = resolveValue(useSomeLoader);
      
      const inlineScript: DocumentScript = {
        key: 'my-inline-script',
        script: `window.INITIAL_DATA = ${JSON.stringify(data)};`,
      };

      return {
        title: 'Título',
        scripts: [inlineScript],
      };
    };
    ```

    # PARTE 2: QWIK BASE (COMPONENTES, REACTIVIDAD, EVENTOS)

Esta sección detalla las APIs fundamentales del core de Qwik.

---
### AI USAGE RULES — APPLICATION CORE APIS

- These APIs are SAFE for application-level code.
- Prefer resumability and SSR-first execution.
- DO NOT use React or hydration-based patterns.
---

## 2.1 Creación de Componentes

### `component$`
- **Definición**: Es el **constructor fundamental** para todos los componentes en Qwik. Es una Función de Orden Superior (HOC) que recibe la función de renderizado.
- **Función**:
    1.  **Define un Límite de Carga Perezosa**: El `$` indica al optimizador que el código de renderizado del componente es un **símbolo** que puede ser extraído y cargado de forma perezosa.
    2.  **Devuelve JSX**: La función siempre debe devolver JSX (`<Element>...</Element>`).
    3.  **Props Serializables**: Las `props` que recibe un componente deben ser serializables para que el estado pueda ser transferido del servidor al cliente.

---
## 2.2 Estado y Reactividad

---
### AI USAGE RULES — STATE & REACTIVITY

- Use ONLY public hooks (useSignal, useComputed$, useTask$).
- DO NOT use low-level or internal APIs.
---

### `useSignal` vs. `createSignal`
- **`useSignal()`**: Es el **hook público y canónico** para crear estado reactivo para valores primitivos o simples dentro del cuerpo de un `component$()`. Devuelve un objeto `Signal` con una propiedad `.value`.
- **`createSignal()`**: INTERNAL — DO NOT USE

### `useComputed$` vs. `createComputed$`/`ComputedFn`
- **`useComputed$()`**: Es el **hook público y canónico** para crear una señal derivada y memoizada.
- **`createComputed$()` / `ComputedFn`**: INTERNAL — DO NOT USE

### `createContextId` y `ContextId`
- **`createContextId<T>(id)`**: Función utilizada para crear un **identificador único y serializable** para un contexto. Este ID es la "llave" que conecta al proveedor con los consumidores del estado.
- **`ContextId`**: Es el tipo de dato que `createContextId` devuelve. Representa el contexto en sí mismo.

### `useTask$()`
- **Definición**: Un hook de ciclo de vida para ejecutar efectos secundarios en respuesta a cambios en el estado.
- **Entorno**: **Isomórfico**. Se ejecuta una vez en el servidor durante el SSR, y luego se vuelve a ejecutar en el cliente cada vez que una de las dependencias que "rastrea" (`track`) cambia.
- **Uso**: El equivalente a `useEffect` en React, pero con carga perezosa. Ideal para sincronizar estado, realizar logging o actualizar propiedades basadas en cambios de otras.

### `useVisibleTask$()`
- **Definición**: Un hook de ciclo de vida que ejecuta un efecto **únicamente en el cliente**, y de forma **ansiosa (`eager`)**, tan pronto como el componente se vuelve visible en el viewport.
- **Uso**: Es una **escotilla de escape** (`escape hatch`) que debe evitarse a menos que sea estrictamente necesario. Su caso de uso principal es la inicialización de librerías de terceros que necesitan acceso directo al DOM.

---
## 2.3 Eventos

---
### AI USAGE RULES — EVENTS

- Use on<Event>$ props exclusively.
- DO NOT generate manual event listeners.
---

### `event$` / `eventQrl`
- **INTERNAL/LEGACY**: DO NOT USE

### `QRL` (Qwik Resource Locator)
- **Definición**: Es el **primitivo fundamental** de Qwik para la carga perezosa. Es un objeto **serializable** que actúa como un puntero a un símbolo (una función `$` extraída).
- **Estructura**: Contiene la información necesaria para localizar y ejecutar un fragmento de código:
    - La ruta al *bundle* (chunk) de JavaScript.
    - El nombre del símbolo exportado dentro de ese *bundle*.
- **Uso del Desarrollador**: Los desarrolladores **rara vez interactúan directamente** con objetos `QRL`. En su lugar, utilizan el **helper `$()`** o la sintaxis de props `on...$`, que son el azúcar sintáctico para crear QRLs.

### `sync$` / `_qrlSync`
- **INTERAL**: DO NOT USE

---

## 2.4 Utilidades de Tareas y Efectos

Estos son los tipos y funciones que componen la API de `useTask$`.

- **`cleanup`**:
    - **Definición**: Una función que se puede devolver desde el interior del callback de `useTask$` o `useVisibleTask$`.
    - **Ejecución**: Se ejecuta justo antes de que la tarea se vuelva a ejecutar, o cuando el componente se destruye (unmount).
    - **Uso**: Esencial para **prevenir fugas de memoria** al limpiar efectos secundarios, como `setInterval`, `setTimeout`, suscripciones a WebSockets o cualquier otro `listener` manual.
- **`TaskCtx` y `Tracker`**:
    - **`TaskCtx`**: Es el tipo del objeto de contexto que se pasa como argumento al callback de la tarea.
    - **`Tracker` (`track`)**: Es la función disponible en el `TaskCtx` (`({ track }) => ...`). Su única función es **registrar una dependencia**. Cuando se llama a `track(() => miSignal.value)`, se le dice a Qwik que la tarea debe volver a ejecutarse si `miSignal` cambia.

---
## 2.5 Tipos y Atributos para JSX

---
### AI USAGE RULES — TYPING & JSX

- Prefer PropsOf<T> for wrapper components.
- Ensure all props are serializable.
---

Estos tipos de TypeScript son esenciales para crear componentes fuertemente tipados y reutilizables.

- **`QwikAttributes`, `DOMAttributes`**: Son tipos base que contienen los atributos comunes a todos los elementos del DOM, incluyendo los manejadores de eventos (`onClick$`, etc.).
- **`AnchorHTMLAttributes`, `ButtonHTMLAttributes`, etc.**: Son tipos que extienden los tipos base con los atributos específicos de un elemento HTML concreto (ej. `href` para `<a>`, `type` y `disabled` para `<button>`).
- **`PropsOf<T>`**:
    - **Definición**: Es el **tipo de utilidad más importante** para los autores de componentes. Es un genérico que extrae todas las props válidas para un nombre de etiqueta HTML (`T` es un string como `'div'`, `'button'`, `'svg'`).
    - **Caso de Uso Canónico**: Crear componentes "wrapper" que envuelven un elemento nativo y necesitan aceptar todos sus atributos posibles de forma segura.
    ```tsx
    import { component$, type PropsOf } from '@builder.io/qwik';

    // Este componente puede aceptar cualquier prop válida de un <button>,
    // como `type`, `disabled`, `class`, `onClick$`, etc.
    export const MyButton = component$((props: PropsOf<'button'>) => {
      return (
        <button {...props}>
          <Slot />
        </button>
      );
    });
    ```

    # PARTE 3: SERVIDOR / BUILD / OPTIMIZACIÓN

Esta sección detalla las APIs y conceptos de bajo nivel que potencian el rendimiento de Qwik. Un desarrollador de aplicaciones rara vez interactúa con ellas directamente, ya que **Qwik City abstrae su complejidad**, pero su conocimiento es vital para una comprensión profunda del framework y para configuraciones personalizadas.

---
### AI USAGE RULES — INTERNAL FRAMEWORK LAYER

- FOR UNDERSTANDING ONLY.
- DO NOT generate application code using these APIs.
- Qwik City already abstracts this layer.
---

---
## 3.1 Qwik Server

- **Definición**: Se refiere al motor de renderizado del lado del servidor de Qwik, disponible en `@builder.io/qwik/server`. No es un servidor HTTP en sí mismo, sino la librería que orquesta el SSR.
- **Función Principal**: Su función `renderToString()` o `renderToStream()` toma el componente raíz de la aplicación (ej. `<Root/>`) y produce el HTML final, que incluye:
    1.  El contenido visual de la página.
    2.  El estado serializado en el script `qwik/json`.
    3.  Los `listeners` de eventos serializados como atributos en el DOM.
    4.  El script del Qwik Loader.
- **Uso**: Es utilizado internamente por Qwik City. Un desarrollador solo lo usaría directamente si estuviera construyendo una integración de servidor completamente personalizada desde cero, sin Qwik City.

---
## 3.2 Funciones y Opciones del Loader

Estas son las herramientas para inyectar y configurar manualmente el `Qwik Loader` y el `Service Worker` de pre-carga.

- **`getQwikLoaderScript()`**: INTERNAL
   
- **`getQwikPrefetchWorkerScript()`**: INTERNAL
    
- **`QwikLoaderOptions`, `PreloaderOptions`, `PrefetchImplementation`**:
    - **Definición**: Son **interfaces de TypeScript** que permiten una configuración avanzada del comportamiento del Qwik Loader y del pre-cargador.
    - **Propósito**: Permiten ajustar detalles finos, como el uso de `nonce` para políticas de seguridad de contenido (CSP), o modificar la estrategia de pre-carga.
    - **Audiencia**: Exclusivamente para usuarios avanzados con requisitos de seguridad o rendimiento muy específicos que no están cubiertos por los valores predeterminados de Qwik City.

  
## 3.3 Qwik Optimizer

- **Definición**: Es el **compilador de Qwik**, escrito en **Rust** para un rendimiento máximo. Es la pieza de tecnología más crítica del ecosistema, responsable de transformar el código fuente en el formato resumible y altamente optimizado que Qwik necesita.
- **Responsabilidades Clave**:
    1.  [cite_start]**Extracción de Código (`$`-System)**: Analiza el código, encuentra todos los marcadores `$` y extrae físicamente las funciones y sus clausuras (closures) en **símbolos** independientes. [cite: 860, 1488]
    2.  **Inyección de Serialización**: Modifica el JSX para añadir los atributos y datos necesarios para la resumibilidad (ej. los `on:click` con QRLs, los IDs para el estado, etc.).
    3.  [cite_start]**Generación del Manifest**: Crea el archivo `q-manifest.json`, que es el mapa que relaciona los símbolos con los *bundles* y las interacciones del usuario. [cite: 1696]
- **Uso**: El optimizador no se invoca directamente, sino que es utilizado por el plugin de Vite (`qwikVite`) durante el proceso de compilación.

---
## 3.4 Opciones de Estrategia del Optimizer

Estas son las configuraciones que controlan cómo el optimizador agrupa los símbolos en *bundles*.

- **`ExperimentalFeatures`**:
    - **Definición**: Un tipo de configuración que permite activar características del optimizador que aún no son estables.
    - **Uso**: Para desarrolladores avanzados o para probar nuevas funcionalidades del framework antes de su lanzamiento oficial. Su uso en producción no es recomendado.

- **`SmartEntryStrategy`**:
    - [cite_start]**Definición**: Es la **estrategia de empaquetado por defecto y recomendada** de Qwik. [cite: 1806]
    - **Mecanismo**: Utiliza heurísticas complejas para agrupar símbolos en *bundles* de una manera que minimice las cascadas de red (`network waterfalls`). Por ejemplo, agrupa los `listeners` de un componente que probablemente se usarán juntos en la misma sesión.

- **`SingleEntryStrategy`**:
    - **Definición**: Una estrategia de empaquetado que agrupa **todo el código** de la aplicación en un único *bundle*.
    - **Uso**: Es un **anti-patrón** para la mayoría de las aplicaciones Qwik, ya que deshabilita por completo la carga perezosa. [cite_start]Solo tiene sentido en casos de nicho muy específicos (ej. una aplicación que debe funcionar completamente offline después de la primera carga). [cite: 1795-1797]

---
## 3.5 Qwik City Vite Plugin y Adaptadores

- **`Qwik City Vite`**:
    - [cite_start]**Definición**: El término se refiere al plugin de Vite (`qwikCity()`) que orquesta la integración entre Qwik City, el Optimizador de Qwik y el ecosistema de Vite. [cite: 2083]
    - **Función**: Gestiona el enrutamiento basado en directorios, la configuración del servidor de desarrollo, y la lógica de compilación específica de Qwik City.

- **`staticAdapter()`**:
    - **Definición**: Es un **adaptador** de Qwik City. Un adaptador es una configuración de `build` específica para una plataforma de despliegue.
    - **Función**: El `staticAdapter()` configura la `build` para realizar una **Generación de Sitio Estático (SSG)** completa. El resultado es un conjunto de archivos `.html`, `.js` y `.css` que pueden ser desplegados en cualquier hosting estático.
    - **Uso**: Se especifica en el plugin `qwikCity()` dentro de `vite.config.ts` para despliegues en plataformas como Netlify, Vercel (como sitio estático), o GitHub Pages.

