Entendido. Corrijo el manifiesto para integrar la potencia total de **context7** (Qwik, Supabase, Drizzle, Tailwind) y aplico el **bloqueo total** de APIs de React/Next.js que has especificado. No hay margen de error: si un agente intenta usar un hook de esa lista, el sistema lo identificará como una violación crítica.

Aquí tienes tu archivo `AGENTS.md` definitivo en texto plano:

---

# 🤖 MISSION CONTROL: AGENT ORCHESTRATION MANIFEST

# Project Stack: Qwik + Bun + Supabase + Drizzle + Tailwind v4

# Standard Version: 2026.1

---

# Registro de Agentes Especializados

Este documento define la jerarquía de mando y las áreas de responsabilidad de los agentes de IA en este workspace. Toda interacción de IA debe alinearse con estos perfiles para evitar deuda técnica.

| Agente | Identificador | Dominio de Responsabilidad | Instrucciones Core |
| --- | --- | --- | --- |
| **Architect** | `@QwikArchitect` | Planificación técnica, diseño de rutas, orquestación SSR y flujos lógicos. | `.github/agents/qwik-architect.agent.md` |
| **Builder** | `@QwikBuilder` | Implementación de código, componentes TSX, lógica de servicios y Tailwind v4. | `.github/agents/qwik-builder.agent.md` |
| **DBA** | `@QwikDBA` | Diseño de esquemas Drizzle, migraciones SQL, seguridad RLS y optimización de queries. | `.github/agents/qwik-dba.agent.md` |
| **Auditor** | `@QwikAuditor` | Control de calidad, SEO/A11y, seguridad, resumabilidad O(1), **Serialización y Observabilidad**. | `.github/agents/qwik-auditor.agent.md` |

## 🛠️ Protocolo de Orquestación (The Workflow Loop)

Para garantizar la integridad del SaaS, los agentes deben seguir este ciclo de vida:

1. **Fase de Inicio**: El comando `/feature` genera el artefacto inicial en `docs/plans/`.
2. **Fase de Diseño**: `@QwikArchitect` valida el plan contra `standards/ARQUITECTURA_FOLDER.md`.
3. **Fase de Datos**: Si hay cambios en persistencia, `@QwikDBA` ejecuta la migración usando `bun run db:generate`.
4. **Fase de Construcción**: `@QwikBuilder` implementa siguiendo `standards/CHEATSHEET_QWIK.md`.
5. **Fase de Cierre**: `@QwikAuditor` realiza el escaneo final contra `standards/QUALITY_STANDARDS.md`, **`SERIALIZATION_CONTRACTS.md`** y **`OBSERVABILITY_LOGGING.md`**.

## 📡 Integración de Herramientas (MCP & Context)

* **Documentación Viva**: Los agentes tienen prohibido alucinar APIs. Deben usar la herramienta `read` para consultar la carpeta `standards/` o el MCP de `context7` para actualizaciones en tiempo real de **Qwik, Supabase, Drizzle y Tailwind CSS**.
* **Runtime Enforcement**: Todas las operaciones de terminal (instalaciones, builds, tests) se ejecutan mediante **Bun**.
* **Database Awareness**: `@QwikDBA` tiene autoridad sobre el esquema en `src/lib/db/schema.ts`.

## 🚫 Restricciones Globales

* **Prohibición Absoluta de React/Next.js**: Queda prohibido todos los hooks que sean de React en todas sus versiones y de Next Js en todas sus versiones (useState, useEffect, useContext, useMemo, useCallback, useTransition, useDeferredValue, useRef, useImperativeHandle, useLayoutEffect, useReducer, useId, use, useActionState, useOptimistic, useFormStatus, createContext, forwardRef, memo, lazy, Suspense, createPortal, startTransition, useRouter, usePathname, useSearchParams, useParams, useSelectedLayoutSegment, useSelectedLayoutSegments, useServerInsertedHTML, getServerSideProps, getStaticProps, getStaticPaths, generateMetadata, generateStaticParams, revalidatePath, revalidateTag, notFound, headers, unstable_cache).
* **Arquitectura**: No se permite lógica de negocio dentro de `src/routes/` (Patrón Orchestrator).
* **Seguridad**: Toda tabla debe tener RLS documentado en `schema.ts`.
* **Hidratación**: El uso de `useVisibleTask$` requiere validación explícita por parte de `@QwikAuditor`.