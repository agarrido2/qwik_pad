---
name: bug-fix
description: Punto de entrada estructurado para diagnóstico y corrección de bugs. Sigue el flujo Diagnóstico → Fix → Verificación con trazabilidad completa.
tools: ["edit", "execute/runInTerminal", "read"]
argument-hint: "example: /bug-fix login-redirect-loop"
---

# 🐛 BUG FIX PROTOCOL: `${input:bugId}`

**Objetivo:** Diagnosticar, corregir y verificar el bug `${input:bugId}` de forma estructurada, dejando trazabilidad completa en `docs/bugs/`.

**Flujo obligatorio:**

```
@QwikAuditor (diagnóstico) → @QwikBuilder (fix) → @QwikAuditor (verificación) → ✅
```

> ⚠️ Si el diagnóstico revela un problema arquitectónico → escala a `@QwikArchitect`.
> ⚠️ Si el diagnóstico revela un problema de esquema → escala a `@QwikDBA`.

## 📝 Paso 1: Crear el Artefacto de Trazabilidad

Crea el archivo `docs/bugs/${input:bugId}.md` con esta plantilla:

```markdown
# Bug Report: ${input:bugId}

> Estado: 🔴 Open
> Created: (Today's Date)
> Last Updated: (Today's Date)

## 🐛 Descripción

(Describir el comportamiento incorrecto observado)

## 🔁 Pasos para Reproducir

1. (Paso 1)
2. (Paso 2)
3. (Resultado esperado vs resultado actual)

## 🔍 Diagnóstico (A rellenar por @QwikAuditor)

- **Archivo(s) afectado(s):**
- **Causa raíz identificada:**
- **Tipo de bug:** [ ] Serialización [ ] Lógica [ ] UI [ ] DB [ ] Seguridad [ ] Performance
- **Escala necesaria:** [ ] Solo Builder [ ] Necesita Architect [ ] Necesita DBA

## 🔧 Fix Aplicado (A rellenar por @QwikBuilder)

- **Archivos modificados:**
- **Cambios realizados:**
- **Tests verificados:**

## ✅ Verificación Final (A rellenar por @QwikAuditor)

- [ ] El bug ya no es reproducible
- [ ] No se han introducido regresiones
- [ ] El fix cumple los estándares de calidad

## 📋 Estado Final

> Estado: 🟢 Fixed / 🔴 Cancelled / 🟠 Won't Fix

- **Causa raíz:** (resumen ejecutivo)
- **Solución aplicada:** (resumen ejecutivo)
- **Tiempo de resolución:** (fecha apertura → fecha cierre)
```

**Instrucciones de ejecución:**

1. Verifica si existe `docs/bugs/`. Si no, créala con `execute/runInTerminal` → `mkdir -p docs/bugs`.
2. Crea el archivo `${input:bugId}.md` con la plantilla usando `edit`.

## 🔍 Paso 2: Invocar al Auditor para Diagnóstico

Llama a **@QwikAuditor** con este prompt:

> "Se ha abierto el bug `${input:bugId}`. El reporte está en `docs/bugs/${input:bugId}.md`.
> Tu tarea es:
>
> 1. Leer el reporte y reproducir el bug mentalmente analizando el código afectado.
> 2. Identificar la causa raíz y rellenar la sección 'Diagnóstico' del reporte.
> 3. Determinar si necesita escalar a `@QwikArchitect` o `@QwikDBA`.
> 4. Si el fix es de código, pasa el testigo a `@QwikBuilder` con el diagnóstico completo."

## 🔧 Paso 3: Fix y Verificación

Una vez que `@QwikBuilder` aplique el fix:

- `@QwikAuditor` verifica que el bug está resuelto y no hay regresiones
- Se actualiza `docs/bugs/${input:bugId}.md` con Estado Final 🟢

---

**Nota:** No intentes corregir el bug antes de que `@QwikAuditor` complete el diagnóstico. Un fix sin diagnóstico es deuda técnica disfrazada de solución.
