# 🤖 MISSION CONTROL: AGENT ORCHESTRATION MANIFEST

# Project Stack: Qwik + Bun + Supabase + Drizzle + Tailwind v4

# Standard Version: 2026.2

---

# Registro de Agentes Especializados

Este documento define la jerarquía de mando y las áreas de responsabilidad de los agentes de IA en este workspace. Toda interacción de IA debe alinearse con estos perfiles para evitar deuda técnica.

| Agente        | Identificador    | Dominio de Responsabilidad                                                                                                               | Instrucciones Core                       |
| ------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| **Architect** | `@QwikArchitect` | Planificación técnica, diseño de rutas, orquestación SSR, diseño de fronteras `$()` y co-localización de QRLs.                           | `.github/agents/qwik-architect.agent.md` |
| **Builder**   | `@QwikBuilder`   | Implementación de código, componentes TSX, lógica de servicios, Tailwind v4, blindaje de serialización y minimización de estado.         | `.github/agents/qwik-builder.agent.md`   |
| **DBA**       | `@QwikDBA`       | Diseño de esquemas Drizzle, migraciones SQL, seguridad RLS y optimización de queries.                                                    | `.github/agents/qwik-dba.agent.md`       |
| **Auditor**   | `@QwikAuditor`   | Control de calidad, SEO/A11y, seguridad, Resumabilidad O(1), Serialización, Streaming, QRL Optimization, Snapshot Size y Observabilidad. | `.github/agents/qwik-auditor.agent.md`   |
| **Polisher**  | `@QwikPolisher`  | Production Readiness Officer. Core Web Vitals, bundle analysis, QRL waterfalls, code hygiene y cierre del Plan File.                     | `.github/agents/qwik-polisher.agent.md`  |

---

## 🛠️ Protocolo de Orquestación (The Workflow Loop)

> **⚠️ Prerequisito de Código Heredado:** Si el código sobre el que se va a trabajar fue creado con agentes anteriores o sin los estándares actuales, ejecuta `/legacy-audit [ruta]` **antes** de iniciar cualquier `/feature` o `/bug-fix`. No se construye sobre código no auditado.

Para garantizar la integridad del SaaS, los agentes deben seguir este ciclo de vida **completo**:

1. **Fase de Inicio:** El comando `/feature` genera el artefacto inicial en `docs/plans/`.
2. **Fase de Diseño:** `@QwikArchitect` valida el plan contra `standards/ARQUITECTURA_FOLDER.md`, diseña las fronteras `$()` y define la estrategia de co-localización de QRLs.
3. **Fase de Datos:** Si hay cambios en persistencia, `@QwikDBA` ejecuta la migración usando `bun run db:generate`.
4. **Fase de Construcción:** `@QwikBuilder` implementa siguiendo `standards/CHEATSHEET_QWIK.md`, aplicando blindaje de serialización y minimización de estado.
5. **Fase de Auditoría:** `@QwikAuditor` realiza el escaneo final contra `standards/QUALITY_STANDARDS.md`, `SERIALIZATION_CONTRACTS.md` y `OBSERVABILITY_LOGGING.md`. Persiste el reporte en `docs/audits/[feature]-audit.md`.
6. **Fase de Producción:** `@QwikPolisher` verifica Core Web Vitals, bundle size, QRL waterfalls, code hygiene y cierra el Plan File con el Estado Final en `docs/plans/[feature].md`.

```
/legacy-audit (si código heredado) → ✅ saneado
       ↓
/feature → @QwikArchitect → @QwikDBA → @QwikBuilder → @QwikAuditor → @QwikPolisher → 🚀
```

---

## 📡 Integración de Herramientas (MCP & Context)

- **Documentación Viva:** Los agentes tienen prohibido alucinar APIs. Deben usar `read` para consultar `standards/` o el MCP de `context7` para actualizaciones en tiempo real de **Qwik, Supabase, Drizzle y Tailwind CSS**.
- **Runtime Enforcement:** Todas las operaciones de terminal (instalaciones, builds, tests) se ejecutan mediante **Bun**.
- **Database Awareness:** `@QwikDBA` tiene autoridad exclusiva sobre el esquema en `src/lib/db/schema.ts`.
- **Audit Trail:** `@QwikAuditor` persiste todos los reportes en `docs/audits/[feature]-audit.md`.
- **Polish Trail:** `@QwikPolisher` cierra el ciclo actualizando `docs/plans/[feature].md` con métricas finales.

---

## 🚫 Restricciones Globales

- **Prohibición Absoluta de React/Next.js:** Blacklist Nuclear completa definida en `.github/copilot-instructions.md`. Ningún agente puede usar ningún hook o API de React/Next.js en ninguna versión.
- **Arquitectura:** No se permite lógica de negocio dentro de `src/routes/` (Patrón Orchestrator).
- **Seguridad:** Toda tabla debe tener RLS documentado en `schema.ts`.
- **Serialización:** Ningún dato no-serializable (Promesas, instancias de clases, Maps, Sets) puede cruzar una frontera `$()`.
- **Hidratación:** El uso de `useVisibleTask$` requiere validación explícita por parte de `@QwikAuditor`.
- **Snapshot Size:** El estado serializado debe ser mínimo. `noSerialize()` es obligatorio para datos no reanudables.

---

## 🗺️ Referencia Rápida de Standards y Prompts

### Agentes

| Identificador    | Fichero                                  |
| ---------------- | ---------------------------------------- |
| `@QwikArchitect` | `.github/agents/qwik-architect.agent.md` |
| `@QwikBuilder`   | `.github/agents/qwik-builder.agent.md`   |
| `@QwikDBA`       | `.github/agents/qwik-dba.agent.md`       |
| `@QwikAuditor`   | `.github/agents/qwik-auditor.agent.md`   |
| `@QwikPolisher`  | `.github/agents/qwik-polisher.agent.md`  |

### Prompts

| Comando           | Fichero                    | Cuándo usarlo                          |
| ----------------- | -------------------------- | -------------------------------------- |
| `/feature`        | `new-feature.prompt.md`    | Iniciar cualquier feature nueva        |
| `/optimizer-code` | `optimizer-code.prompt.md` | Refactorizar fichero con deuda técnica |
| `/bug-fix`        | `bug-fix.prompt.md`        | Corregir un bug con trazabilidad       |
| `/legacy-audit`   | `legacy-audit.prompt.md`   | Antes de tocar código heredado         |
| `/setup`          | `setup.prompt.md`          | Inicializar o verificar el workspace   |

### Standards

| Standard                     | Agente Principal             | Cuándo leerlo                       |
| ---------------------------- | ---------------------------- | ----------------------------------- |
| `ARQUITECTURA_FOLDER.md`     | @QwikArchitect               | Toda nueva feature                  |
| `PROJECT_RULES_CORE.md`      | @QwikArchitect               | Toda nueva feature                  |
| `CHEATSHEET_QWIK.md`         | @QwikBuilder                 | Toda implementación                 |
| `QWIK_ADVANCE_API.md`        | @QwikBuilder                 | APIs avanzadas (server$, streaming) |
| `SUPABASE_DRIZZLE_MASTER.md` | @QwikDBA                     | Todo cambio de esquema              |
| `SERIALIZATION_CONTRACTS.md` | @QwikBuilder / @QwikAuditor  | Toda frontera `$()`                 |
| `QUALITY_STANDARDS.md`       | @QwikAuditor                 | Toda auditoría                      |
| `SEO_A11Y_GUIDE.md`          | @QwikAuditor                 | Toda auditoría                      |
| `OBSERVABILITY_LOGGING.md`   | @QwikAuditor / @QwikBuilder  | Manejo de errores                   |
| `TAILWIND_QWIK_GUIDE.md`     | @QwikBuilder                 | Todo componente UI                  |
| `RBAC_ROLES_PERMISSIONS.md`  | @QwikArchitect               | Features con usuarios/roles         |
| `UX_GUIDE.md`                | @QwikBuilder / @QwikPolisher | Todo componente UI                  |
| `SVG_ICONS_GUIDE.md`         | @QwikBuilder                 | Uso de iconografía                  |
| `DB_QUERY_OPTIMIZATION.md`   | @QwikDBA                     | Queries complejas                   |
| `BUN_NODE.md`                | Todos                        | Scripts de terminal                 |
