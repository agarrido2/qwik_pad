# Núcleo de Reglas del Proyecto (Qwik + Supabase + Bun + Drizzle)

## Propósito y Uso

Este documento es la **constitución técnica del proyecto**.

Sirve para:

1. **Yo (humano) dentro de X meses** → Entender rápidamente:
   - Qué stack uso.
   - Cómo está organizada la arquitectura.
   - Cómo deben trabajar la IA y los agentes entre sí.
   - Qué reglas son "sagradas" y no se pueden romper.

2. **GitHub Copilot + agentes personalizados** → Tener instrucciones claras sobre:
   - Dónde escribir código (y dónde no).
   - Cómo estructurar features.
   - Qué estándares de calidad y seguridad debe cumplir.
   - Cómo usar tests, docs y dependencias sin inventar cosas.

> Si estás leyendo esto (humano o IA):  
> **NO LO IGNORES.** Este archivo está por encima de cualquier prompt puntual.

---

## 1. Stack Oficial del Proyecto

**Frontend y Orquestación**
- Qwik + Qwik City (última versión estable).
- Tailwind CSS v4 (configuración "zero-JS" via `src/assets/css/global.css`).

**Backend / Runtime**
- Bun (última versión) como runtime, package manager y runner (`bun run ...`).

**Datos y Persistencia**
- Supabase (PostgreSQL 15+).
- Extensiones:
  - `pgvector` para RAG.
  - `pg_trgm` para fuzzy search.
- ORM principal: Drizzle ORM (type-safe, sin magia extra).

**Infraestructura conceptual**
- Arquitectura basada en:
  - `src/routes` → Orquestación y páginas.
  - `src/components` → Sistema de diseño (UI pura).
  - `src/lib` → Lógica de negocio, servicios, DB, auth, utilidades.
  - `src/features` → Módulos complejos encapsulados (patrón híbrido).

---

## 2. Documentos de Referencia (Fuente de Verdad)

Este archivo **NO repite todos los detalles**, sino que **apunta** a dónde están.

Cuando GitHub Copilot o un agente necesite detalles, debe asumir que existen y se respetan estos documentos:

### 2.1 Estándares de Ejecución (Nivel 1 - La Ley)
*Reglas innegociables para escribir código.*

- `docs/standards/ARQUITECTURA_FOLDER.md`  
  → Arquitectura canónica del proyecto (rutas, lib, components, features).

- `docs/standards/SUPABASE_DRIZZLE_MASTER.md`
  → Integración de Base de Datos y Auth (Drizzle, Supabase SSR, Zod).

- `docs/standards/QUALITY_STANDARDS.md`  
  → 5 pilares de calidad: Performante, Idiomático, Robusto, Accesible, Seguro.

- `docs/standards/SEO_A11Y_GUIDE.md`  
  → Reglas innegociables de SEO y accesibilidad (HTML semántico, DocumentHead, OG, etc.).

- `docs/standards/TAILWIND_QWIK_GUIDE.md`  
  → Uso correcto de Tailwind v4 con Qwik (tema vía `@theme`, Motion One, etc.).

- `docs/standards/UX_GUIDE.md`  
  → Principios UX/UI globales (landing SaaS, apps internas, dashboards).

- `docs/standards/BUN_NODE.md`  
  → Uso de Bun para dev y Node.js para producción (Estrategia Híbrida).

- `docs/standards/CHEATSHEET_QWIK.md`
  → Referencia rápida de sintaxis y snippets comunes.


**Regla de Resolución de Conflictos:** Si algo parece contradecirse, este es el orden de prioridad:
1. `SUPABASE_DRIZZLE_MASTER.md` (Para datos)
2. `ARQUITECTURA_FOLDER.md` (Para estructura)
3. `PROJECT_RULES_CORE.md` (Este archivo)
4. Resto de Estándares (Nivel 1).


---

## 3. Arquitectura Obligatoria (Vista Rápida)

La estructura de carpetas base **NO SE TOCA** salvo para ampliarla de forma compatible:

```text
/
├── .scratch/              # Archivos temporales (gitignored)
├── docs/
│   ├── adr/              # Architecture Decision Records (decisiones clave)
│   ├── features/         # Documentación de features implementadas
│   ├── guides/           # Guías de desarrollo
│   └── standards/        # LA BIBLIA (este archivo está aquí)
├── public/
├── scripts/
│   ├── db/               # Scripts SQL temporales (gitignored)
│   └── setup/            # Scripts de configuración/instalación
└── src/
    ├── assets/
    │   ├── css/
    │   └── fonts/
    ├── components/
    │   ├── icons/
    │   ├── layout/
    │   └── ui/
    ├── hooks/
    ├── lib/
    │   ├── auth/
    │   ├── contexts/
    │   ├── db/
    │   ├── schemas/
    │   ├── services/
    │   ├── supabase/
    │   ├── types/
    │   └── utils/
    ├── features/         # Sólo para features complejas (>5 archivos).
    └── routes/
        ├── api/
        ├── (public)/
        ├── (auth)/
        ├── (app)/
        ├── layout.tsx
        └── service-worker.ts

```

### 3.1. Reglas por Dominio

**`src/routes` (Orquestación y páginas)** - Solo orquesta:

* Llama a `lib/` (servicios, auth, etc.).
* Usa componentes de `components/` y, si procede, de `features/`.
* **Prohibido:**
* Lógica de negocio compleja (“qué hace el negocio”).
* Acceso directo a DB o Supabase.


* Cada página:
* Usa HTML semántico y `DocumentHead`.
* Sigue SEO + a11y (título, descripción, OG, etc.).



**`src/components` (Sistema de Diseño)** - UI pura, reusable y agnóstica.

* No hay llamadas a DB ni a Supabase.
* No se define lógica de negocio.
* Subcarpetas:
* `layout/` → Shells y layouts globales.
* `ui/` → Botones, inputs, cards, etc.
* `icons/` → Iconos como componentes.



**`src/lib` (Cerebro del sistema)** - Aquí vive:

* Auth, servicios, tipos, DB client, schemas, utilidades.
* Reglas:
* `lib` nunca importa desde `components` ni `routes`.
* Validación de datos → siempre a través de `schemas` (Zod).
* Acceso a Supabase / DB → via `lib/db` y `lib/supabase`.



**`src/features` (Features complejas)** - Sólo para features con muchos archivos (auth, billing, dashboards grandes).

* Cada feature tiene:
* `components/`, `hooks/`, `schemas/`, `services/`, etc.


* Siempre expone un **facade** en `src/lib/[feature]/index.ts` para que el resto del sistema importe desde ahí.

---

## 4. Agentes Personalizados + Copilot: Jerarquía y Roles

Este documento **no sustituye** a los agentes custom. Los complementa.

Agentes principales:

* **QwikArchitect** → Piensa, planea y estructura (NO escribe código).
* **QwikBuilder** → Escribe componentes, rutas y lógica (Implementador).
* **QwikDBA** → Gestiona esquemas SQL, migraciones y RLS.
* **QwikAuditor** → Revisa seguridad, SEO y accesibilidad al final.

### 4.1. Regla Global para IA (Copilot + Agents)

1. **Este archivo es ley.**
2. Después, los docs de `docs/standards`.
3. Después, las instrucciones específicas del agente.
4. Al final, prompts puntuales del usuario.

Si hay conflicto entre un prompt ad-hoc y una regla aquí o en `docs/standards`, **se cumple la regla**, no el capricho puntual.

---

## 5. Flujo Actor–Crítico (Generación + Revisión)

Para **toda generación de código no trivial**:

1. **Actor (Copilot / QwikBuilder)** - Genera el código siguiendo:
* Arquitectura.
* Reglas de calidad.
* Stack definido.
* Siempre incluye:
* Tests cuando haya lógica de negocio.
* Comentarios de “por qué” en decisiones importantes.
* Estructura y nombres claros.




2. **Crítico (Copilot Chat / QwikAuditor)** - Revisa el código con checklist:
* Cumple `QUALITY_STANDARDS` (performante, idiomático, robusto, accesible, seguro).
* Respeta la arquitectura (`ARQUITECTURA_FOLDER`).
* Sigue SEO/A11y.
* No rompe Tailwind/UX.
* Si detecta cualquier violación crítica:
* Rechaza la implementación y sugiere cambios concretos.





**Regla dura:** > Nunca se acepta el primer output de generación sin revisión Crítico.

---

## 6. TDD y Tests: Reglas para Copilot

**Principio central:**

> Toda lógica de negocio y toda función que transforme datos debe tener un test útil asociado.

### 6.1 Qué debe tener test obligatorio

* Lógica de negocio en `lib/services`, `lib/auth`, `lib/utils`.
* Cualquier cosa que calcule, derive, procese o valide datos.
* Endpoints complejos.
* Casos de borde importantes (errores, datos vacíos, etc.).

### 6.2 Qué puede ir sin test (casos excepcionales)

* Componentes UI puramente presentacionales.
* Estilos, clases de Tailwind.
* Wiring trivial de rutas que sólo montan componentes.

### 6.3 Comportamiento esperado de Copilot

Al generar código para lógica de negocio:

* Primero proponer el test (o en la misma operación).
* Tests que:
* Fallen si la lógica está mal.
* Cubran casos felices y casos de error.
* Eviten mocks absurdos o innecesarios.



Si genera código sin test donde debería haberlo → **considerar la tarea incompleta**.

---

## 7. Documentación Sincronizada (Docs-as-Code)

La documentación no es opcional ni posterior.

### 7.1 Estructura Documental

El proyecto usa una organización clara para evitar ruido:

**Permanentes (se suben a Git):**
- `docs/standards/` - **LA BIBLIA** - Reglas innegociables del proyecto
- `docs/adr/` - Architecture Decision Records (decisiones arquitectónicas numeradas)
- `docs/features/` - Documentación de features implementadas
- `docs/guides/` - Guías prácticas de desarrollo

**Temporales (gitignored):**
- `.scratch/` - Borradores, notas de sesión, documentos obsoletos
- `scripts/db/*.sql` - Scripts SQL one-time (DROP_TABLES, migraciones manuales)

### 7.2 Regla de Ciclo de Vida Documental

> Copilot/IA: Cuando generes documentación temporal (sync reports, migration logs, etc.), **colócala en `.scratch/`** para evitar contaminar el repo.

Documentos permanentes solo en:
- `docs/adr/` → Decisiones clave (formato ADR estándar)
- `docs/features/` → Features completas documentadas
- `docs/guides/` → Tutoriales/guías reutilizables

### 7.3 Comportamiento esperado de QwikTechWriter / Copilot

* Leer el código afectado.
* Decidir si el documento es:
  - **Permanente** → `docs/adr/`, `docs/features/`, `docs/guides/`
  - **Temporal** → `.scratch/`
* Resumir:
  - Propósito de la feature/módulo.
  - Flujo de datos.
  - Requisitos (variables de entorno, flags, etc.).
* Escribir en Markdown claro para humanos.

---

## 8. Dependencias y Seguridad (Anti-Alucinación de Paquetes)

Copilot **NO PUEDE** inventar paquetes.

### 8.1 Antes de añadir un paquete nuevo

Comprobar:

1. Existe en el registry (npm, etc.).
2. Tiene actividad reciente / mantenimiento.
3. No es un typo de otro famoso (typosquatting).
4. No duplica funcionalidad de algo estándar que ya usamos.

### 8.2 Herramientas y comandos

* Gestor: `bun`
* Comandos:
* `bun add paquete`
* `bun remove paquete`
* `bun update`



Si se sugiere algo raro como `qwik-super-magic-lib`:

* Marcar como sospechoso.
* Buscar alternativas estándar.
* Preguntar al humano antes.

---

## 9. Reglas de Calidad Global (Resumen Operativo)

Toda contribución de código debe cumplir, como mínimo:

1. **Performante** - Usar `routeLoader$` en lugar de `useVisibleTask$` cuando sea posible.
* Evitar JS en cliente innecesario.
* Imágenes optimizadas, sin CLS.


2. **Idiomático Qwik** - `component$`, `useSignal`, `useStore`, `useTask$`.
* Handlers `onClick$={...}` con `$`, nunca estilo React.


3. **Robusto** - TypeScript estricto.
* Validación Zod en acciones y mutaciones.
* Manejo de errores y estados de carga explícitos.


4. **Accesible y SEO-friendly** - HTML semántico (`main`, `section`, `nav`, `button`, etc.).
* Un solo `h1` por página.
* Metadatos completos (title, description, og, twitter).
* Atributos `alt`, `aria-*` correctos.


5. **Seguro** - Secrets nunca en frontend.
* Validación server-side obligatoria.
* Nada de SQL raw vulnerable.



---

## 10. Checklist para Revisar un PR (Humano o IA)

Antes de aprobar un PR, comprobar:

* [ ] Sigue la arquitectura (`ARQUITECTURA_FOLDER.md`).
* [ ] No rompe la separación routes/lib/components/features.
* [ ] Cumple TDD donde aplica (tests incluidos).
* [ ] Documentación actualizada si hay cambios relevantes.
* [ ] No añade dependencias sospechosas o duplicadas.
* [ ] Pasa linters, type-check, tests.
* [ ] QwikAuditor no detecta violaciones críticas de calidad.

---

## 11. Notas para el Yo del Futuro

* Si el proyecto empieza a “oler raro”, casi siempre será porque:
* Metiste lógica en `routes` o `components` en vez de `lib`/`features`.
* Dejaste de exigir tests.
* Ignoraste documentación.
* Añadiste dependencias sin pensar.


* Cuando eso pase:
1. Vuelve a leer este archivo.
2. Revisa `ARQUITECTURA_FOLDER.md` y `QUALITY_STANDARDS.md`.
3. Recupera la disciplina UCE: pensar → planificar → construir → auditar.



> **Este archivo está vivo.** > Si cambias la forma de trabajar, actualízalo.
> Si añades nuevas reglas o rompes alguna, déjalo escrito aquí.

```