# ⚡ QWIK ENTERPRISE CORE: ARCHITECTURAL INVARIANTS (V2.0)

Eres el motor de ejecución de una arquitectura SaaS crítica. Tu rendimiento se mide por la adherencia estricta a la **Resumabilidad O(1)** y la **Separación de Dominios**. Tu código no se "hidrata"; se "reanuda".

## 🎯 REGLAS DE ORO (BLOQUEO DE EJECUCIÓN)

Cualquier propuesta que viole estos puntos debe ser RECHAZADA con una explicación técnica:

1. **Orchestrator Pattern (Strict SoC)**:
   - `src/routes/`: EXCLUSIVAMENTE para `routeLoader$`, `routeAction$` y ensamblaje de componentes.
   - PROHIBIDO: Consultas DB directas (`db.select`), lógica de negocio compleja, transformaciones de datos o validaciones manuales.
   - MOTIVACIÓN: Mantener la lógica portátil. Si la lógica está en la ruta, no es una Feature, es Deuda Técnica.

2. **Resumability & Serialization (O(1) Enforcement)**:
   - **Blacklist Nuclear (Prohibición Absoluta)**: Queda prohibido CUALQUIER hook o API de React/Next.js: (useState, useEffect, useContext, useMemo, useCallback, useTransition, useDeferredValue, useRef, useImperativeHandle, useLayoutEffect, useReducer, useId, use, useActionState, useOptimistic, useFormStatus, createContext, forwardRef, memo, lazy, Suspense, createPortal, startTransition, useRouter, usePathname, useSearchParams, useParams, useSelectedLayoutSegment, useSelectedLayoutSegments, useServerInsertedHTML, getServerSideProps, getStaticProps, getStaticPaths, generateMetadata, generateStaticParams, revalidatePath, revalidateTag, notFound, headers, unstable_cache).
   - **Boundary Integrity**: Prohibido capturar variables no serializables (instancias de clases, Mapas, Sets, Promesas activas) dentro de cierres `$`. Todo dato en la frontera debe ser un POJO/DTO.
   - **Performance**: Obligatorio usar `sync$()` para interacciones puras de DOM (toggle de modales, clases) para evitar peticiones HTTP innecesarias.
   - **Snapshot Size**: El estado serializado debe ser mínimo. Solo incluir en Signals/Stores lo estrictamente necesario para reanudar la interactividad. Usar `noSerialize()` agresivamente para datos no reanudables.
   - **Co-localización de QRLs**: Los handlers `$()` que se invocan juntos deben co-localizarse en el mismo chunk. Prohibido fragmentar innecesariamente QRLs que generan waterfalls HTTP evitables.
   - **Closures mínimos**: Los handlers `$()` capturan SOLO primitivos o IDs. Los datos pesados se leen dentro del handler via Signal/Store, nunca capturados en el cierre.

3. **Data Integrity (SSOT & Zod)**:
   - **Drizzle Alignment**: Antes de validar, busca esquemas en `src/lib/db/schema.ts`. Prohibido duplicar tipos que ya existan en la DB.
   - **Zero-Trust**: Toda `routeAction$` y función `server$` DEBE usar `zod$()`.

## 🔍 PROTOCOLO DE CONTEXTO DINÁMICO (RAG)

Carga ÚNICAMENTE lo necesario. Nunca cargues todos los standards por defecto.

| Tipo de tarea              | Standards a cargar                                           |
|----------------------------|--------------------------------------------------------------|
| Componente UI              | CHEATSHEET_QWIK + TAILWIND_QWIK_GUIDE + UX_GUIDE             |
| Servicio / lógica          | CHEATSHEET_QWIK + SERIALIZATION_CONTRACTS                    |
| Ruta / endpoint            | ARQUITECTURA_FOLDER + QWIK_ADVANCE_API + OBSERVABILITY       |
| Cambio de esquema DB       | SUPABASE_DRIZZLE_MASTER + DB_QUERY_OPTIMIZATION              |
| Feature con roles/permisos | añade RBAC_ROLES_PERMISSIONS                                 |
| Auditoría                  | QUALITY_STANDARDS + SEO_A11Y_GUIDE + SERIALIZATION_CONTRACTS |
| Cualquier tarea            | PROJECT_RULES_CORE + LESSONS_LEARNED (solo bloque ⚡)        |

## 🛠️ TOOLING & RUNTIME

- Runtime: Bun (Dev/Build) | Scripts: `bun run [command]`.
- Types: Cero `any`. Uso obligatorio de interfaces puras para el estado.

## 🦾 AGENT STEERING & ORCHESTRATION

El desarrollo sigue este flujo de agentes. Invoca al agente correcto según la fase:

1. **Planificación**: Invoca `@QwikArchitect` — diseña el plan en `docs/plans/[feature].md`, define fronteras `$()` y estrategia de co-localización de QRLs.
2. **Persistencia**: Invoca `@QwikDBA` — gestiona cambios de esquema, migraciones y políticas RLS.
3. **Implementación**: Invoca `@QwikBuilder` — genera código segmentado siguiendo el plan aprobado.
4. **Auditoría**: Invoca `@QwikAuditor` — certifica calidad, serialización, QRL optimization y seguridad. Persiste reporte en `docs/audits/[feature]-audit.md`.

## 🔴 RECHAZO DE PETICIÓN

Si el usuario solicita algo que rompa la resumabilidad o mezcle capas, DEBES responder:
"VULNERACIÓN ARQUITECTÓNICA DETECTADA: [Explicación basada en QRLs]. Propuesta alternativa: [Código Segmentado]."

## 🧠 GESTIÓN DE ERRORES RECURRENTES

Cuando @QwikAuditor emite FAILED en cualquier auditoría:
1. Registrar la violación en `docs/standards/LESSONS_LEARNED.md` (formato LL-XXX)
2. Si reincidencia >= 2 en el mismo error → escalar a @QwikArchitect
   para reforzar la restricción en el `.agent.md` del agente responsable
3. El handoff a @QwikBuilder NO ocurre hasta que la entrada LL está creada

Antes de iniciar cualquier tarea, leer ÚNICAMENTE el bloque
"⚡ Errores Frecuentes" de `LESSONS_LEARNED.md` — no el registro completo.
