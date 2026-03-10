# 📚 Standards Index — Onucall SaaS

> Mapa de navegación para agentes y desarrolladores. Antes de ejecutar cualquier tarea, consulta este índice para saber qué standard(s) y prompt(s) aplican.

---

## 📋 Tabla Maestra de Standards

| #   | Archivo                      | Propósito                                                                    | Agente Principal              |
| --- | ---------------------------- | ---------------------------------------------------------------------------- | ----------------------------- |
| 01  | `ARQUITECTURA_FOLDER.md`     | Estructura de carpetas, capas, Orchestrator Pattern y Feature-Sliced Design  | @QwikArchitect                |
| 02  | `PROJECT_RULES_CORE.md`      | Reglas core del proyecto: Resumabilidad O(1), SoC, Zod, Bun                  | @QwikArchitect                |
| 03  | `CHEATSHEET_QWIK.md`         | Patrones obligatorios de Qwik: signals, serialización, routeLoader$, server$ | @QwikBuilder                  |
| 04  | `QWIK_ADVANCE_API.md`        | APIs avanzadas: server$, streaming, async generators, middlewares            | @QwikBuilder                  |
| 05  | `SUPABASE_DRIZZLE_MASTER.md` | Queries, RLS, tipos TypeScript, migraciones con Drizzle + Supabase           | @QwikBuilder / @QwikDBA       |
| 06  | `SERIALIZATION_CONTRACTS.md` | Contratos de serialización, fronteras $(), noSerialize(), POJOs              | @QwikBuilder / @QwikAuditor   |
| 07  | `QUALITY_STANDARDS.md`       | 5 pilares de calidad: Performante, Idiomático, Robusto, Accesible, Seguro    | @QwikAuditor                  |
| 08  | `SEO_A11Y_GUIDE.md`          | HTML semántico, ARIA, meta tags, Core Web Vitals, DocumentHead               | @QwikAuditor                  |
| 09  | `OBSERVABILITY_LOGGING.md`   | Códigos de error ORCH*/SERV*/DATA\_, logging estructurado                    | @QwikAuditor / @QwikBuilder   |
| 10  | `TAILWIND_QWIK_GUIDE.md`     | Sistema de diseño, tokens Tailwind v4, clases dinámicas, dark mode           | @QwikBuilder                  |
| 11  | `RBAC_ROLES_PERMISSIONS.md`  | Roles, permisos, guards de rutas, autorización por rol                       | @QwikArchitect / @QwikAuditor |
| 12  | `UX_GUIDE.md`                | Patrones UX, feedback visual, estados de carga, microinteracciones           | @QwikBuilder / @QwikPolisher  |
| 13  | `SVG_ICONS_GUIDE.md`         | Sistema de iconos SVG type-safe con PropsOf<'svg'>                           | @QwikBuilder                  |
| 14  | `DB_QUERY_OPTIMIZATION.md`   | Índices, queries optimizadas, sharedMap, evitar N+1                          | @QwikDBA                      |
| 15  | `BUN_NODE.md`                | Runtime Bun, scripts, comandos de terminal                                   | Todos                         |
| 16  | `LESSONS_LEARNED.md`         | Registro vivo de errores recurrentes y lecciones propagadas                  | Todos                         |

---

## ⚡ Tabla Maestra de Prompts

| Comando           | Fichero                    | Propósito                                                                    | Agente Invocado |
| ----------------- | -------------------------- | ---------------------------------------------------------------------------- | --------------- |
| `/feature`        | `new-feature.prompt.md`    | Iniciar una feature nueva con Plan File y flujo completo de agentes          | @QwikArchitect  |
| `/optimizer-code` | `optimizer-code.prompt.md` | Refactorización antimonolito: SoC, DI, QRL co-localización, estado mínimo    | @QwikBuilder    |
| `/bug-fix`        | `bug-fix.prompt.md`        | Diagnóstico y corrección de bugs con trazabilidad en `docs/bugs/`            | @QwikAuditor    |
| `/legacy-audit`   | `legacy-audit.prompt.md`   | Auditoría de código heredado. Prerequisito antes de tocar código no auditado | @QwikAuditor    |
| `/setup`          | `setup.prompt.md`          | Inicializar estructura de carpetas y verificar ficheros del workspace        | —               |

---

## 🧭 ¿Qué necesito?

### Voy a iniciar cualquier tarea

→ Leer bloque ⚡ de `LESSONS_LEARNED.md` — siempre, sin excepciones

### Voy a crear una feature nueva

→ `/feature [nombre]` — sin excepciones

### El código que voy a tocar es heredado (agentes viejos, sin estándares actuales)

→ `/legacy-audit [ruta]` **primero** — sin excepciones
→ Según veredicto: continúa con `/feature` o `/bug-fix`

### Estoy construyendo un componente UI

→ `03-CHEATSHEET_QWIK.md` + `10-TAILWIND_QWIK_GUIDE.md` + `12-UX_GUIDE.md`

### Estoy creando o modificando una ruta / endpoint

→ `01-ARQUITECTURA_FOLDER.md` + `02-PROJECT_RULES_CORE.md` + `06-SERIALIZATION_CONTRACTS.md`

### Estoy trabajando con base de datos

→ `05-SUPABASE_DRIZZLE_MASTER.md` + `14-DB_QUERY_OPTIMIZATION.md`

### Estoy diseñando una nueva feature compleja

→ `01-ARQUITECTURA_FOLDER.md` + `02-PROJECT_RULES_CORE.md` + `11-RBAC_ROLES_PERMISSIONS.md`

### Estoy corrigiendo un bug

→ `/bug-fix [id]` + standard del área afectada

### Estoy haciendo una auditoría / code review

→ `07-QUALITY_STANDARDS.md` + `08-SEO_A11Y_GUIDE.md` + `06-SERIALIZATION_CONTRACTS.md`

### Tengo un fichero con demasiado código mezclado

→ `/optimizer-code [ruta]`

### Estoy preparando un despliegue

→ `07-QUALITY_STANDARDS.md` + `09-OBSERVABILITY_LOGGING.md`

---

## 🤖 Responsabilidades por Agente

### @QwikArchitect

Lee siempre: `01-ARQUITECTURA_FOLDER.md`, `02-PROJECT_RULES_CORE.md`
Lee si aplica: `11-RBAC_ROLES_PERMISSIONS.md`

### @QwikDBA

Lee siempre: `05-SUPABASE_DRIZZLE_MASTER.md`, `14-DB_QUERY_OPTIMIZATION.md`
Lee si aplica: `01-ARQUITECTURA_FOLDER.md`

### @QwikBuilder

Lee siempre: `03-CHEATSHEET_QWIK.md`, `06-SERIALIZATION_CONTRACTS.md`, `09-OBSERVABILITY_LOGGING.md`
Lee si aplica: `04-QWIK_ADVANCE_API.md`, `10-TAILWIND_QWIK_GUIDE.md`, `13-SVG_ICONS_GUIDE.md`

### @QwikAuditor

Lee siempre: `07-QUALITY_STANDARDS.md`, `08-SEO_A11Y_GUIDE.md`, `06-SERIALIZATION_CONTRACTS.md`, `09-OBSERVABILITY_LOGGING.md`

### @QwikPolisher

Lee siempre: `07-QUALITY_STANDARDS.md`, `12-UX_GUIDE.md`
Lee si aplica: Plan File activo en `docs/plans/` + Audit report en `docs/audits/`

---

> 💡 **Regla de oro:** Si tienes duda entre dos standards, léelos ambos. Un agente que lee de más nunca rompe el proyecto. Un agente que lee de menos, sí.
