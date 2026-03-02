---
name: legacy-audit
description: Auditoría completa de código heredado. Analiza, clasifica deuda técnica y genera un plan de saneamiento priorizado antes de construir sobre él.
tools: ["read", "edit", "execute/runInTerminal", "upstash/context7/*"]
argument-hint: "example: /legacy-audit src/features/auth"
---

# 🏚️ LEGACY AUDIT PROTOCOL: `${input:legacyPath}`

**Objetivo:** Auditar el código heredado en `${input:legacyPath}`, clasificar toda la deuda técnica encontrada y generar un plan de saneamiento priorizado antes de construir nada nuevo sobre él.

> ⚠️ **Regla de oro:** No se construye sobre código no auditado. Este prompt es el prerequisito obligatorio para cualquier `/feature` que toque código existente.

**Flujo obligatorio:**

```
@QwikAuditor (análisis) → docs/audits/legacy-[path]-audit.md → Plan de saneamiento → ✅
```

---

## 📝 Paso 1: Crear el Artefacto de Auditoría

Crea el archivo `docs/audits/legacy-${input:legacyPath}-audit.md`:

```markdown
# Legacy Audit: ${input:legacyPath}

> Estado: 🔴 Auditando
> Created: (Today's Date)
> Last Updated: (Today's Date)

## 📁 Scope Auditado

- **Ruta:** ${input:legacyPath}
- **Archivos analizados:** (listar)
- **Agentes originales:** (si se conocen)

## 🔴 Deuda Crítica (Bloquea construcción)

(Violaciones que impiden añadir código nuevo de forma segura)

## 🟠 Deuda Mayor (Debe resolverse pronto)

(Violaciones importantes que generan riesgo técnico acumulado)

## 🟡 Deuda Menor (Mejora recomendada)

(Mejoras de calidad, nomenclatura, organización)

## ✅ Lo que está bien

(Patrones correctos que deben preservarse)

## 🗺️ Plan de Saneamiento

| Prioridad | Archivo | Problema | Acción | Agente |
| --------- | ------- | -------- | ------ | ------ |

## 📋 Veredicto Final

> [ ] 🟢 APTO — Se puede construir sobre este código tras fixes menores
> [ ] 🟠 CONDICIONADO — Requiere saneamiento previo antes de nueva feature
> [ ] 🔴 REFACTOR TOTAL — Rediseño con @QwikArchitect obligatorio
```

**Instrucciones:**

1. Verifica si existe `docs/audits/`. Si no, créala → `mkdir -p docs/audits`.
2. Crea el archivo con la plantilla usando `edit`.

---

## 🔍 Paso 2: Invocar a @QwikAuditor

Llama a **@QwikAuditor** con este prompt:

> "Audita todo el código en `${input:legacyPath}`. El reporte está en `docs/audits/legacy-${input:legacyPath}-audit.md`.
>
> Analiza **cada archivo** contra estos estándares en orden:
>
> 1. `docs/standards/QUALITY_STANDARDS.md` — Resumabilidad O(1), Zod, Seguridad
> 2. `docs/standards/SERIALIZATION_CONTRACTS.md` — Fronteras `$()`
> 3. `docs/standards/ARQUITECTURA_FOLDER.md` — SoC, capas, Orchestrator Pattern
> 4. `docs/standards/CHEATSHEET_QWIK.md` — Sintaxis idiomática Qwik
> 5. `docs/standards/OBSERVABILITY_LOGGING.md` — Códigos de error
>
> Para cada violación encontrada, clasifícala como:
>
> - 🔴 **CRÍTICA:** Rompe resumabilidad, expone datos sensibles o mezcla capas graves
> - 🟠 **MAYOR:** Deuda técnica significativa (lógica en rutas, tipos duplicados, sin Zod)
> - 🟡 **MENOR:** Mejoras de calidad (nombres, organización, comentarios)
>
> Rellena **todas las secciones** del reporte y emite el Veredicto Final.
> Si detectas violaciones críticas de arquitectura, marca como REFACTOR TOTAL."

---

## 🗺️ Paso 3: Interpretar el Veredicto y Actuar

Según el veredicto de `@QwikAuditor`:

### 🟢 APTO

```
→ Continúa directamente con /feature o /bug-fix
```

### 🟠 CONDICIONADO

```
→ Para cada ítem 🔴 y 🟠 del plan de saneamiento:
   /optimizer-code [archivo]   ← deuda de implementación
   /bug-fix [problema]         ← bugs reales
→ Re-ejecuta /legacy-audit para verificar saneamiento
→ Solo entonces procede con nueva feature
```

### 🔴 REFACTOR TOTAL

```
→ Llama a @QwikArchitect:
  "El código en ${input:legacyPath} tiene deuda crítica estructural.
   Lee docs/audits/legacy-${input:legacyPath}-audit.md y diseña
   un plan de rediseño del dominio en docs/plans/refactor-${input:legacyPath}.md"
→ @QwikDBA valida esquema si hay cambios de datos
→ @QwikBuilder reimplementa limpio sobre el nuevo plan
→ @QwikAuditor certifica el resultado
```

---

> 💡 **Nota:** El objetivo no es reescribir todo por reescribirlo. Es tener una **foto clara de la deuda real** para tomar decisiones informadas. A veces el código heredado está mejor de lo que parece — el audit te lo dirá.
