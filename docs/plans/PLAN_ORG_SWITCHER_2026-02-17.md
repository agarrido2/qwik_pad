# Plan: Organization Switcher (Multi-Org Support)

**Fecha:** 2026-02-17  
**Agente:** @QwikArchitect  
**Estado:** ✅ Implementado  
**Prioridad:** Alta — Cierra el TODO explícito en middleware.ts y habilita multi-tenancy real

---

## 📋 Índice

1. [Contexto y Problema](#1-contexto-y-problema)
2. [Decisiones de Arquitectura](#2-decisiones-de-arquitectura)
3. [Diseño Técnico](#3-diseño-técnico)
4. [Archivos Afectados](#4-archivos-afectados)
5. [Checklist de Implementación](#5-checklist-de-implementación)

---

## 1. Contexto y Problema

### Estado actual

- `AuthContext` ya tiene `allOrganizations[]` y `isMultiOrg` preparados para multi-org.
- **6 puntos** en el código hardcodean `orgs[0]` como organización activa:
  1. `src/routes/(app)/layout.tsx` — línea 53 (AuthContext provider)
  2. `src/lib/auth/middleware.ts` — línea 61 (RBAC route check)
  3. `src/lib/auth/rbac-loaders.ts` — línea 68 (member listing)
  4. `src/routes/(app)/dashboard/usuarios/index.tsx` — líneas 58, 92, 126 (3 actions)
- El middleware tiene un `TODO: Selección de org activa desde cookie/header (multi-org futuro)` (línea 60).
- Planes anteriores (`RESUMEN_RBAC_COMPLETO`, `IMPLEMENTACION_RBAC_LOGICA`) ya especificaban cookie `active_organization_id`.

### Objetivo

Permitir al usuario seleccionar la organización activa mediante un dropdown en el sidebar. La selección se persiste en cookie HTTP-only para que sobreviva recargas y sea legible en server-side (middleware, loaders, actions).

---

## 2. Decisiones de Arquitectura

### 2.1 Persistencia: Cookie HTTP-only (no localStorage)

**POR QUÉ:**
- La org activa se necesita en **server-side** (middleware RBAC, routeLoaders, routeActions).
- `localStorage` no es accesible server-side → requeriría `useVisibleTask$` (rompe resumabilidad).
- Cookie HTTP-only viaja automáticamente con cada request.
- Ya hay precedente en el codebase (`rbac_error` cookie en middleware.ts).

**Especificación de la cookie:**
```
Nombre:   active_org_id
Valor:    UUID de la organización
Path:     /
HttpOnly: true
SameSite: lax
Secure:   true (producción)
MaxAge:   365 días (persiste entre sesiones del browser)
```

### 2.2 Cambio de org = navegación completa (no reactiva)

**POR QUÉ:**
- Cambiar de org invalida **todos los datos cargados** (routeLoaders, middleware RBAC, menú filtrado).
- Un `routeAction$` con redirect a `/dashboard` fuerza recarga limpia del layout completo.
- Intentar actualizar reactivamente (sin navegación) causaría inconsistencias entre datos server y client.
- Qwik's resumability no pierde estado de framework — la recarga SSR es barata (~50ms).

**Flujo:** Click en org → Form submit → `routeAction$` setea cookie → redirect `/dashboard` → layout recarga con org correcta.

### 2.3 Helper centralizado `resolveActiveOrg()`

**POR QUÉ:**
- Elimina los 6 puntos de `orgs[0]` dispersos.
- Lógica de seguridad en un solo lugar: validar que el `orgId` del cookie pertenece al array de orgs del usuario (evitar inyección de org ajena).
- Fallback a `orgs[0]` si cookie no existe o el ID no matchea.

### 2.4 Dropdown siempre visible (incluso con 1 org)

- El usuario pidió "aunque solo sea una".
- Con 1 org: dropdown muestra la org (sin interacción útil pero consistente visualmente).
- Con N orgs: dropdown despliega lista, marca la activa con check.
- Ubicación: Sección "Workspace Info" del sidebar (reemplaza el bloque estático actual).

---

## 3. Diseño Técnico

### 3.1 Helper — `src/lib/auth/active-org.ts` (NUEVO)

```
resolveActiveOrg(requestEvent, orgs[])
├── Lee cookie 'active_org_id'
├── Si existe → busca org con ese ID en el array del usuario
│   ├── Encontrada → retorna esa org ✓
│   └── No encontrada → fallback a orgs[0] (cookie stale/org eliminada)
├── Si no existe → retorna orgs[0] (primera visita)
└── Seguridad: siempre valida contra las orgs del usuario (no acepta org_id arbitrario)

setActiveOrgCookie(requestEvent, orgId)
├── Setea cookie 'active_org_id' con config estándar
└── Usado por el routeAction de switching
```

### 3.2 Flujo de datos completo (request lifecycle)

```
Request HTTP
  │
  ├─ Cookie: active_org_id=uuid-123
  │
  ▼
(app)/layout.tsx → useAppGuard routeLoader$
  │ ├─ getAuthGuardData() → user + orgs[]
  │ ├─ resolveActiveOrg(requestEvent, orgs) → activeOrg (lee cookie)
  │ └─ return { user, organizations, activeOrgId }
  │
  ▼
dashboard/layout.tsx → onRequest: checkRouteAccess
  │ ├─ orgs = sharedMap.get('userOrgs')
  │ ├─ resolveActiveOrg(requestEvent, orgs) → activeOrg
  │ └─ canAccessRoute(activeOrg.role, path) → allow/deny
  │
  ▼
(app)/layout.tsx → component$
  │ ├─ useStore<AuthContextValue> → organization = enrichOrg(activeOrg)
  │ └─ useContextProvider(AuthContext, store)
  │
  ▼
DashboardSidebar → useContext(AuthContext)
  │ ├─ auth.organization → org activa (para nombre, avatar, rol)
  │ ├─ auth.allOrganizations → todas las orgs (para dropdown)
  │ └─ OrgSwitcher dropdown
  │     └─ Form → useSwitchOrgAction → setea cookie → redirect /dashboard
```

### 3.3 Componente OrgSwitcher — `src/components/dashboard/org-switcher.tsx` (NUEVO)

**Estructura UI:**
```
┌──────────────────────────────────┐
│  [HW]  Huelva Wagen          ▾  │  ← botón toggle (avatar + nombre + chevron)
│         Propietario  Demo        │     rol badge + preview badge
├──────────────────────────────────┤
│  ✓ [HW] Huelva Wagen     Owner  │  ← org activa (check mark)
│    [MA] Madrid Auto      Admin   │  ← otra org
│    [BC] BCN Motors       Member  │  ← otra org
└──────────────────────────────────┘
```

**Comportamiento:**
- `useSignal<boolean>` para open/close del dropdown.
- Click fuera cierra (event listener o técnica de overlay transparente).
- Cada item es un `<Form action={switchOrgAction}>` con `<input type="hidden" name="orgId">`.
- Org activa marcada con ✓ y no clickable (o submit con misma org = no-op).
- Tailwind: `absolute`, `z-40`, `shadow-lg`, `rounded-md`, `border`.

**Props:** Ninguna — lee todo desde `useContext(AuthContext)`.

### 3.4 routeAction$ para switching

Se añade en `src/routes/(app)/dashboard/layout.tsx` (junto al `useLogoutAction` existente):

```
useSwitchOrgAction ← routeAction$ + zod$({ orgId: z.string().uuid() })
├── Valida que orgId pertenece a las orgs del usuario (seguridad)
├── setActiveOrgCookie(requestEvent, orgId)
└── redirect 302 → /dashboard
```

**Importación en sidebar:** Igual que `useLogoutAction`:
```ts
import { useSwitchOrgAction } from '~/routes/(app)/dashboard/layout';
```

---

## 4. Archivos Afectados

### Archivos NUEVOS

| Archivo | Responsabilidad |
|---------|----------------|
| `src/lib/auth/active-org.ts` | Helper: `resolveActiveOrg()` + `setActiveOrgCookie()` |
| `src/components/dashboard/org-switcher.tsx` | Componente dropdown de selección de org |

### Archivos EDITADOS

| Archivo | Cambio | Líneas afectadas |
|---------|--------|-----------------|
| `src/routes/(app)/layout.tsx` | Usar `resolveActiveOrg()` en lugar de `orgs[0]` | ~53 |
| `src/routes/(app)/dashboard/layout.tsx` | Añadir `useSwitchOrgAction` routeAction$ | Nuevo export |
| `src/lib/auth/middleware.ts` | Usar `resolveActiveOrg()`, eliminar `TODO` | ~60-61 |
| `src/lib/auth/rbac-loaders.ts` | Usar `resolveActiveOrg()` en lugar de `orgs[0]` | ~68 |
| `src/routes/(app)/dashboard/usuarios/index.tsx` | Usar `resolveActiveOrg()` en 3 actions | ~58, ~92, ~126 |
| `src/components/dashboard/dashboard-sidebar.tsx` | Reemplazar sección Workspace Info con `<OrgSwitcher />` | ~198-226 |

---

## 5. Checklist de Implementación

### Análisis de Normativa
- [x] He revisado `docs/standards/ARQUITECTURA_FOLDER.md` — helper en `src/lib/auth/`, componente en `src/components/dashboard/`
- [x] He revisado `docs/standards/PROJECT_RULES_CORE.md` — zero business logic en componentes, validación zod$ en actions
- [x] He revisado `docs/standards/DB_QUERY_OPTIMIZATION.md` — 0 queries adicionales (solo lee cookie + array)

### Verificación Técnica
- [x] Cookie API: `requestEvent.cookie.get()/.set()` — ya usado en el codebase (middleware.ts L72)
- [x] Qwik City `routeAction$` + `zod$` — patrón existente (logout action, user actions)
- [x] No requiere APIs externas ni librerías nuevas

---

### BASE DE DATOS (Agente: @QwikDBA)

> **No se requiere ningún cambio de base de datos.** La feature opera enteramente con datos ya cargados (array de orgs del usuario) + cookie del browser.

---

### LÓGICA Y RUTAS (Agente: @QwikBuilder)

**Fase 1 — Infraestructura (server-side)**

- [x] Crear `src/lib/auth/active-org.ts` con:
  - `resolveActiveOrg(requestEvent, orgs)` — lee cookie, valida contra orgs del usuario, fallback `orgs[0]`
  - `setActiveOrgCookie(requestEvent, orgId)` — setea cookie con config segura
  - `COOKIE_NAME` constante (`'active_org_id'`)
- [x] Editar `src/routes/(app)/layout.tsx`:
  - Importar `resolveActiveOrg`
  - Reemplazar `orgs[0]` por `resolveActiveOrg(requestEvent, orgs)` en el routeLoader
- [x] Editar `src/lib/auth/middleware.ts`:
  - Importar `resolveActiveOrg`
  - Reemplazar `orgs[0]` (L61) + eliminar `TODO` (L60)
- [x] Editar `src/lib/auth/rbac-loaders.ts`:
  - Reemplazar `orgs[0]` (L68) por `resolveActiveOrg`
- [x] Editar `src/routes/(app)/dashboard/usuarios/index.tsx`:
  - Reemplazar 3× `orgs[0]` (L58, L92, L126) por `resolveActiveOrg`
- [x] Añadir `useSwitchOrgAction` en `src/routes/(app)/dashboard/layout.tsx`:
  - `routeAction$` + `zod$({ orgId: z.string().uuid() })`
  - Validar orgId pertenece al usuario
  - Llamar `setActiveOrgCookie()`
  - Redirect a `/dashboard`
- [x] Sincronizar `AuthContext` en SPA navigation con `useTask$` en `src/routes/(app)/layout.tsx`:
  - `track(() => appData.value)` para detectar recargas del routeLoader
  - Reasignar `user`, `organization`, `allOrganizations`, `isMultiOrg`, `isPreviewMode`

**Fase 2 — UI (componente)**

- [x] Crear `src/components/dashboard/org-switcher.tsx`:
  - Lee `AuthContext` (organization, allOrganizations, isMultiOrg)
  - Importa `useSwitchOrgAction` desde dashboard/layout
  - Dropdown con `useSignal<boolean>` para toggle
  - Cada org como `<Form>` + hidden input + submit button
  - Org activa con check mark visual
  - Avatar con iniciales, nombre org, badge de rol
  - Click fuera cierra dropdown
  - Tailwind v4, mobile-first
- [x] Editar `src/components/dashboard/dashboard-sidebar.tsx`:
  - Reemplazar sección "WORKSPACE INFO" (div con avatar estático) por `<OrgSwitcher />`
  - Mantener sección "LOGO/ORG NAME" (h-16 header) — actualizar para leer de AuthContext (ya lo hace)

**Fase 3 — Tests y verificación**

- [x] Tests existentes (36/36) siguen pasando
- [x] Build limpio (`bun run build`)
- [x] Test manual: login → sidebar muestra org en dropdown → (si hay múltiples orgs) cambiar → cookie se setea → datos recargan con org correcta
- [x] Test manual: cookie inválida/stale → fallback a primera org sin error
- [x] Verificar que menú RBAC se re-filtra según rol en la nueva org

---

## Notas para @QwikBuilder

1. **Seguridad crítica en `resolveActiveOrg`**: SIEMPRE validar que el `orgId` de la cookie existe en el array de orgs del usuario. Nunca confiar en el valor raw del cookie.

2. **Orden de ejecución**: El middleware (`onRequest`) corre ANTES que el routeLoader del layout. Ambos necesitan `resolveActiveOrg` de forma independiente. El middleware lee de `sharedMap` (cacheado por auth-guard en request anterior o por sí mismo), el layout lee del resultado de `getAuthGuardData()`.

3. **`usuarios/index.tsx`**: Las 3 actions usan `requestEvent.sharedMap.get('userOrgs')` — el helper necesita funcionar con este array también (misma shape que las orgs del auth-guard).

4. **No touch `auth-guard.ts`**: El guard carga todas las orgs y las cachea en sharedMap. No necesita saber cuál es la activa — eso lo resuelve cada consumidor con `resolveActiveOrg`.

5. **Click outside para cerrar dropdown**: Patrón simple en Qwik — overlay transparente `fixed inset-0 z-39` que al click cierra, o `document.addEventListener` en `useVisibleTask$`. Preferir overlay (no rompe resumabilidad).

---

✅ Plan actualizado en `docs/plans/PLAN_ORG_SWITCHER_2026-02-17.md`. ¿Aprobado para pasar el testigo a **@QwikBuilder**?
