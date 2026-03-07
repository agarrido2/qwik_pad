# Reporte de Auditoría — theme-update

**Auditor:** @QwikAuditor  
**Fecha:** 2026-03-02  
**Feature:** Simplificación de tema a `light/dark` + actualización de paleta  
**Artefactos auditados:**
- `src/root.tsx`
- `src/components/dashboard/header/theme-toggle.tsx`
- `src/assets/css/global.css`
- `src/routes/internal/colors/index.tsx`

---

## Evidencia por Checklist

### 1. Performance — Resumabilidad O(1)

**`useVisibleTask$` en `ThemeToggle`** → JUSTIFICADO.  
Requiere `localStorage` y `classList`, ambas exclusivamente browser APIs. Tiene `eslint-disable-next-line qwik/no-use-visible-task` documentado + `strategy: 'document-ready'`. Cumple el estándar del TAILWIND_QWIK_GUIDE.md §3.3.  

Ningún `useVisibleTask$` fuera de este uso justificado. El script en `root.tsx` es vanilla IIFE pre-framework, no hidratación.

### 2. Frontera de Streaming — Serialización

**`cycleTheme$`** captura:
- `mode`: `useSignal<ThemeMode>` → referencia serializable. ✅
- `THEME_CYCLE`, `THEME_LABELS`: constantes de módulo (POJOs string<→string) → referencias estáticas en el QRL chunk, no capturadas dinámicamente. ✅
- `THEME_STORAGE_KEY`: string literal de módulo. ✅
- `applyThemeClass`, `readStoredTheme`: funciones de módulo, no capturadas en el cierre. ✅

Ningún objeto no-serializable (Set, Map, clase, Promesa activa) cruza ninguna frontera `$()`.

**`sync$` en `colors/index.tsx`** captura `mode` del `.map()`:  
`mode` es un literal de string desde `["light", "dark"] as const` — primitivo, no referencia a estado reactivo. Uso de `sync$` es canónico para manipulación pura de DOM (classList + localStorage sin round-trip HTTP). ✅

### 3. Co-localización de QRLs

`ThemeToggle` tiene un único handler `cycleTheme$` asociado a `onClick$`. El `useVisibleTask$` de inicialización y el handler de interacción están co-localizados en el mismo componente — mismo chunk de módulo. No hay waterfall de QRLs evitable. ✅

`colors/index.tsx` usa `sync$` inlined en el JSX — co-localización perfecta, cero peticiones HTTP adicionales en la interacción. ✅

### 4. Estado Serializado — Snapshot Size

Estado del componente: `useSignal<ThemeMode>("light")` — un único string primitivo `"light" | "dark"`. Contribución al snapshot `qwik/json`: 1 entrada string (antes eran 3 posibles valores con lógica de `system`). Reducción neta del snapshot. ✅

No hay `useStore` innecesario. No hay datos pesados serializados. `noSerialize()` no es necesario en esta feature (no hay integraciones de terceros). ✅

### 5. Robustez y Seguridad

El script inline en `root.tsx` está envuelto en `try/catch` — fallo silencioso aceptable para una feature no crítica (evita FODC sin bloquear el render). El fallback es `'light'` explícito tras la validación `mode !== 'light' && mode !== 'dark'`. Resistente a localStorage bloqueado (Safari privado) y a valores corruptos. ✅

No hay `routeAction$` ni `server$` modificados → Zod no aplica a esta feature. N/A ✅

### 6. CSS — Consistencia de Paleta

Tokens actualizados correctamente en TODOS los contextos (`@layer base :root`, `:root.light`, `:root.dark`, `.dark`):

| Token | Valor anterior | Valor nuevo | HEX correcto |
|---|---|---|---|
| `--primary` | `210 11% 10%` | `200 3% 22%` | `#37393A` ✅ |
| `--secondary` | `263 84% 73%` | `268 80% 70%` | `#B077F0` ✅ |
| `--secondary-light` | `263 84% 80%` | `263 88% 73% / 75%` | `#AC7EF7` α75% ✅ |
| `--warning` | `38 92% 38%` | `64 100% 80%` | `#F8FF99` ✅ |
| `--info` | `188 43% 39%` | `214 61% 88%` | `#CEDEF3` ✅ |

`--secondary-light: 263 88% 73% / 75%` → Cuando Tailwind v4 genera `hsl(var(--secondary-light))` el navegador resuelve `hsl(263 88% 73% / 75%)` que es sintaxis CSS Color Level 4 válida. ✅

### 7. WCAG Contraste — Nuevos Tokens Semánticos

| Token de fondo | Foreground | Ratio estimado | AA (4.5:1) |
|---|---|---|---|
| `#F8FF99` (warning) | `#37393A` (foreground) | ~10.9:1 | ✅ Supera AAA |
| `#CEDEF3` (info) | `#37393A` (foreground) | ~8.8:1 | ✅ Supera AAA |

### 8. A11y / HTML Semántico

`ThemeToggle` usa `<Button>` (renderiza `<button>`), no `<div onClick>`. ✅  
`aria-label="Cambiar tema"`, `title={THEME_LABELS[mode.value]}`, `aria-hidden="true"` en iconos, `<span class="sr-only">` con estado actual anunciado. ✅  
`colors/index.tsx` usa `<button type="button">` para los selectores de modo. ✅

### 9. Idiomático

- Cero hooks React/Next.js en cualquier archivo modificado. ✅  
- `component$()` correcto. ✅  
- `useSignal` para primitivo (no `useStore`). ✅  
- `sync$` para DOM puro. ✅  
- `$()` con sufijo en todos los handlers. ✅  
- `ThemeMode` type reducido a `"light" | "dark"` — elimina deuda de tipado del `"system"`. ✅

### 10. SEO

`colors/index.tsx` exporta `head: DocumentHead` con `noindex, nofollow`. ✅  
`root.tsx` es layout raíz — no requiere `head` export propio. ✅

---

## ⚠️ Observación de Calidad (No Bloqueante)

**Doble bloque `:root` en `global.css`**  

Existen dos bloques `:root` en `@layer base`: uno en línea ~62 (set mínimo heredado con `--background`, `--primary`, etc.) y uno en línea ~133 (set completo en Sección 3). El segundo bloque cascada sobre el primero para todas las propiedades solapadas, por lo que no hay error en runtime. Sin embargo, el primer bloque es ahora código redundante que genera ambigüedad de mantenimiento.

**Recomendación para @QwikPolisher:** Consolidar en un único bloque `:root` en la Sección 3, eliminando el bloque bootstrap de línea ~62. No es un bloqueante para producción.

---

## Bloque de Validación

```text
🔍 VALIDACIÓN DE CALIDAD — theme-update

✅ Resumabilidad O(1):
  - [x] useVisibleTask$ justificado (localStorage + classList, strategy: document-ready)
  - [x] Carga de datos en servidor no aplica; script de tema es vanilla pre-framework

✅ Frontera de Streaming:
  - [x] Solo primitivos/Signals/POJOs cruzan $()
  - [x] noSerialize() no requerido (sin librerías de terceros)
  - [x] server$() no modificado en esta feature

✅ QRL Optimization:
  - [x] cycleTheme$ co-localizado con useVisibleTask$ en ThemeToggle
  - [x] sync$ en colors/index.tsx — cero HTTP waterfalls en interacción DOM
  - [x] Sin dispersión innecesaria de QRLs

✅ Estado Serializado:
  - [x] useSignal<ThemeMode> — 1 string primitivo, snapshot mínimo
  - [x] Reducción neta vs. implementación anterior (3 estados → 2)

✅ Closures:
  - [x] cycleTheme$ captura solo Signal reference + constantes de módulo
  - [x] sync$ captura literal string ("light"/"dark") del as const tuple
  - [x] Funciones helper son module-level, no capturadas en cierre

✅ Idiomático:
  - [x] Sintaxis $ correcta en todos los handlers
  - [x] useSignal para estado primitivo
  - [x] Cero hooks React/Next.js

✅ Robusto:
  - [x] routeAction$/server$ no modificados → Zod N/A en esta feature
  - [x] try/catch en script de root — fallo silencioso apropiado
  - [x] Validación explícita de valores de localStorage (whitelist)

✅ Accesible/SEO:
  - [x] HTML semántico: <button> con aria-label, aria-hidden, sr-only
  - [x] WCAG AA superado en tokens warning e info
  - [x] DocumentHead exportado en colors/index.tsx (noindex)

⚠️ Observación (no bloqueante):
  - [ ] Consolidar doble bloque :root en global.css (líneas ~62 y ~133)
```

## RESULTADO FINAL: PASSED

✅ **APROBADO** — Implementación conforme con los estándares de Resumabilidad O(1), Serialización, QRL Optimization y A11y.  
Handoff a **@QwikPolisher** para cierre del Plan File con métricas finales.  
Observación pendiente de limpieza cosmética del doble `:root` (no bloqueante para producción).
