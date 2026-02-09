---
name: feature
description: Scaffolds a new vertical slice using a Plan-Driven approach (Specs File).
tools: ['edit', 'execute/runInTerminal', 'read/readFile']
argument-hint: "example: /feature auth-module"
---

# 🚀 New Feature Kick-off: `${input:featureName}`

**Objetivo:** Iniciar el desarrollo de una nueva funcionalidad (`${input:featureName}`) de manera estructurada, creando primero una "Hoja de Ruta" persistente.

## 📝 Paso 1: Crear el Artefacto de Planificación (The Plan File)

Actúa como **Project Manager**. Tu primera y única acción física ahora es crear un archivo nuevo en `docs/plans/${input:featureName}.md`.

Este archivo servirá de **Memoria Externa** para los agentes posteriores. Usa estrictamente esta plantilla base (Scaffolding):


# Feature Plan: ${input:featureName}
> Estado: 🟡 Planning
> Created: (Today's Date)

## 🎯 Objetivo
(Descripción breve de qué hace esta feature y qué problema resuelve)

## 🏗️ Arquitectura (A rellenar por @QwikArchitect)
- [ ] Definición de Rutas (`src/routes/...`)
- [ ] Definición de Componentes (`src/features/...`)
- [ ] Definición de Estado (Signals/Context)

## 💾 Datos (A rellenar por @QwikDBA)
- [ ] Schema Drizzle (`src/lib/db/schema.ts`)
- [ ] Migración necesaria

## ✅ Checklist de Ejecución (A ejecutar por @QwikBuilder)
- [ ] 1. Crear estructura de carpetas
- [ ] 2. Definir Schemas/Types (Schema First)
- [ ] 3. Implementar Servicios/Lógica
- [ ] 4. Implementar UI Components (Tailwind v4 + Mobile First)
- [ ] 5. Integrar en Rutas

## 🛡️ Auditoría (A verificar por @QwikAuditor)
- [ ] Calidad de Código (Zero-Hydration check)
- [ ] Accesibilidad y SEO


**Instrucción de Ejecución:**

1. Verifica si existe la carpeta `docs/plans/`. Si no, créala usando `execute/runInTerminal` (`mkdir -p docs/plans`).
2. Crea el archivo `${input:featureName}.md` con la plantilla de arriba usando `edit`.

## 🧠 Paso 2: Invocar al Arquitecto

Una vez creado el archivo de plan, llama al agente **@QwikArchitect**.

**Prompt para el Arquitecto:**

> "He creado el borrador del plan en `docs/plans/${input:featureName}.md`.
> Tu tarea es **leer ese archivo y completarlo con la estrategia técnica detallada**.
> 1. Rellena las secciones de Arquitectura y Datos basándote en `docs/standards/ARQUITECTURA_FOLDER.md`.
> 2. **Revisa los pasos de ejecución predefinidos:** Si la feature requiere pasos extra o diferentes, edita la lista. Si el estándar es correcto, déjalo así.
> Cuando termines de detallar el plan en el archivo, avisa al usuario para que apruebe el pase al Builder."
> 
> 

---

**Nota:** No escribas código de la feature todavía. Tu éxito se mide solo por la creación correcta del archivo de plan y la delegación al Arquitecto.
