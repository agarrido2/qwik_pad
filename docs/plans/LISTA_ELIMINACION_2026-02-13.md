# 🗑️ LISTA DE ELIMINACIÓN - Archivos y Carpetas Obsoletos

**Fecha:** 13 de febrero de 2026  
**Propósito:** Listado ejecutable de elementos a eliminar para limpieza del proyecto

---

## ⚡ RESUMEN EJECUTIVO

**Total de elementos a eliminar/mover:** 10 items  
**Espacio a liberar:** ~15-20 archivos  
**Riesgo de eliminación:** ⚠️ BAJO (con precauciones)

---

## 🔴 ELIMINACIONES INMEDIATAS (Sin Dependencias)

### 1. Carpeta Temporal `tmp/`

**Ruta completa:** `/Users/mpgarrido/Documents/qwik/gaseosa/qwik_pad/tmp/`

**Contenido:**
- `tsconfig.tsbuildinfo` (caché de compilación TypeScript)

**Comando seguro:**
```bash
rm -rf tmp/
```

**Justificación:** Archivo de build que se regenera automáticamente.

**Precaución:** Añadir a `.gitignore`:
```bash
echo "tmp/" >> .gitignore
echo "*.tsbuildinfo" >> .gitignore
```

---

### 2. Archivo `.DS_Store` (macOS system file)

**Ruta:** Raíz del proyecto

**Comando:**
```bash
find . -name ".DS_Store" -delete
```

**Justificación:** Metadata de macOS, no debe estar en repositorio.

**Precaución:** Ya está en `.gitignore`, verificar con:
```bash
grep ".DS_Store" .gitignore
```

---

## ⚠️ ~~MOVIMIENTOS REQUERIDOS (Reorganización)~~ ✅ CORREGIDO (14-Feb-2026)

**NOTA:** Esta sección fue inicialmente mal ejecutada. La arquitectura canónica **SÍ incluye `components/shared/`**. 
Se aplicó la corrección inversa el 14-Feb-2026 para cumplir con `ARQUITECTURA_FOLDER.md`.

### ~~3-5. Componentes en `components/shared/`~~ ✅ RESTAURADO

**Acción Correcta Aplicada:** RESTAURAR `shared/` y mover componentes DE VUELTA

La estructura correcta según `ARQUITECTURA_FOLDER.md` es:
```
components/
├── icons/              # Iconos SVG
├── ui/                 # Componentes primitivos (Button, Input, Card)
├── shared/             # Bloques de composición (Header, Footer, Hero) ✅
└── layouts/            # Orquestadores (PublicLayout, DashboardLayout) ✅
```

**Diferencia conceptual:**
- `shared/` = BLOQUES reutilizables que SE USAN en layouts
- `layouts/` = ORQUESTADORES que ENSAMBLAN bloques de shared

**Cambios aplicados:**
```bash
# Restaurar estructura correcta
mkdir -p src/components/shared
mv src/components/layouts/header.tsx src/components/shared/Header.tsx
mv src/components/layouts/footer.tsx src/components/shared/Footer.tsx
mv src/components/ui/hero.tsx src/components/shared/Hero.tsx

# Crear barrel export
cat > src/components/shared/index.ts
# Actualizar imports en public-layout.tsx
# De: '~/components/layouts' 
# A: '~/components/shared'
```

✅ **Estado:** COMPLETADO Y VERIFICADO (build exitoso)

---

### ~~3-5. Componentes en `components/shared/`~~ (SECCIÓN OBSOLETA - IGNORAR)

**Acción:** ~~MOVER a ubicación correcta según estándares~~ **INCORRECTA**

#### 3. Header.tsx
```bash
# Mover a layouts
mv src/components/shared/Header.tsx src/components/layouts/header.tsx
```

#### 4. Footer.tsx
```bash
# Mover a layouts
mv src/components/shared/Footer.tsx src/components/layouts/footer.tsx
```

#### 5. Hero.tsx
```bash
# Mover a ui (es un componente de sección reutilizable)
mv src/components/shared/Hero.tsx src/components/ui/hero.tsx
```

#### Actualizar export en `src/components/layouts/index.ts`
```typescript
// Añadir:
export { Header } from './header';
export { Footer } from './footer';
```

#### Actualizar import en `src/components/layouts/public-layout.tsx`
```typescript
// ANTES:
import { Header, Footer } from '~/components/shared';

// DESPUÉS:
import { Header, Footer } from '~/components/layouts';
```

#### Eliminar carpeta vacía
```bash
rm -rf src/components/shared/
```

---

### 6-7. Componentes específicos de onboarding

**Acción:** MOVER a feature (no son componentes globales)

#### 6. industry-selector.tsx
```bash
# Crear carpeta si no existe
mkdir -p src/features/onboarding/components

# Mover
mv src/components/onboarding/industry-selector.tsx src/features/onboarding/components/
```

#### 7. onboarding-progress.tsx
```bash
mv src/components/onboarding/onboarding-progress.tsx src/features/onboarding/components/
```

#### Actualizar facade `src/lib/onboarding/index.ts`
```typescript
// Añadir re-exports:
export { IndustrySelector } from '../../features/onboarding/components/industry-selector';
export { OnboardingProgress } from '../../features/onboarding/components/onboarding-progress';
```

#### Actualizar import en `src/routes/(app)/onboarding/index.tsx`
```typescript
// ANTES:
import { IndustrySelector } from '~/components/onboarding/industry-selector';
import { OnboardingProgress } from '~/components/onboarding/onboarding-progress';

// DESPUÉS:
import { IndustrySelector, OnboardingProgress } from '~/lib/onboarding';
```

#### Eliminar carpeta vacía
```bash
rm -rf src/components/onboarding/
```

---

## 📄 ARCHIVADO DE DOCUMENTACIÓN

### 8. Crear carpeta de archivo

```bash
mkdir -p docs/plans/archived/2026-Q1
```

---

### Planes a Archivar

#### 9. Planes Completados (Fase 1)

```bash
# Mover planes de Fase 1 completada
mv docs/plans/FASE_01_AUTH_LANDING.md docs/plans/archived/2026-Q1/
mv docs/plans/FIX_OAUTH_REDIRECT_PATTERN.md docs/plans/archived/2026-Q1/
mv docs/plans/LIVE_DEMO_SECTION.md docs/plans/archived/2026-Q1/
mv docs/plans/RESUMEN_EJECUCION_FASE1.md docs/plans/archived/2026-Q1/
```

#### 10. Auditorías Previas

```bash
# Mover auditoría anterior (esta la reemplaza)
mv docs/plans/AUDITORIA_ESTANDARES_2026-02-11.md docs/plans/archived/2026-Q1/
```

---

### Actualizar README de plans

**Editar:** `docs/plans/README.md`

```markdown
# 📋 Development Plans

## Active Plans

- **SCHEMA_FUSION_DEMO_INTEGRATION.md** - Integración avanzada de demo
- **ANALISIS_ARQUITECTURA_CARPETAS.md** - Análisis de estructura
- **PLAN_CORRECCION_CRITICAS_FASE1.md** - Correcciones pendientes (revisar)
- **REFACTOR_UI_COMPONENTS.md** - Refactor de componentes (revisar)

## Archived Plans

Ver `archived/2026-Q1/` para planes completados del Q1 2026.

## Latest Audits

- **AUDITORIA_ARQUITECTURA_2026-02-13.md** (13-Feb-2026) - Auditoría completa
- Ver `archived/2026-Q1/AUDITORIA_ESTANDARES_2026-02-11.md` para auditoría anterior
```

---

## 🛡️ VERIFICACIÓN POST-LIMPIEZA

Después de ejecutar todas las acciones, verificar:

### 1. Build funciona
```bash
bun run build
```

### 2. No hay imports rotos
```bash
bun run lint
```

### 3. TypeScript compila
```bash
bun run typecheck  # o tsc --noEmit
```

### 4. Tests pasan (si existen)
```bash
bun test
```

---

## 📊 CHECKLIST DE EJECUCIÓN

```markdown
### Eliminaciones Inmediatas
- [ ] Eliminar `tmp/`
- [ ] Actualizar `.gitignore` con `tmp/` y `*.tsbuildinfo`
- [ ] Eliminar archivos `.DS_Store`

### Reorganización de Componentes
- [ ] Mover `Header.tsx` a `layouts/`
- [ ] Mover `Footer.tsx` a `layouts/`
- [ ] Mover `Hero.tsx` a `ui/`
- [ ] Actualizar exports en `layouts/index.ts`
- [ ] Actualizar import en `public-layout.tsx`
- [ ] Eliminar carpeta `shared/`
- [ ] Crear `features/onboarding/components/` si no existe
- [ ] Mover `industry-selector.tsx` a feature
- [ ] Mover `onboarding-progress.tsx` a feature
- [ ] Actualizar facade en `lib/onboarding/index.ts`
- [ ] Actualizar imports en route de onboarding
- [ ] Eliminar carpeta `components/onboarding/`

### Archivado de Documentación
- [ ] Crear `docs/plans/archived/2026-Q1/`
- [ ] Mover planes completados de Fase 1
- [ ] Mover auditoría anterior
- [ ] Actualizar `docs/plans/README.md`

### Verificación
- [ ] Ejecutar `bun run build`
- [ ] Ejecutar `bun run lint`
- [ ] Ejecutar `bun run typecheck`
- [ ] Verificar que app funciona en dev (`bun dev`)
```

---

## ⚠️ ADVERTENCIAS

### NO Eliminar (Falsos Positivos)

❌ **NO borrar estas carpetas/archivos:**
- `dist/` (se genera en build, pero OK si está gitignored)
- `node_modules/` (obvio, pero por si acaso)
- `.vscode/` (configuración del editor, útil para el equipo)
- `drizzle/` (migraciones de BD, CRÍTICO mantener)
- `scripts/` (scripts de utilidad, todos están activos)

### Precauciones con Git

Si ya hiciste commit de archivos a eliminar:
```bash
# Eliminar del historial de Git pero mantener localmente
git rm --cached tmp/
git rm --cached .DS_Store

# Commit la eliminación
git commit -m "chore: remove temporary files and update .gitignore"
```

---

## 🎯 RESULTADO ESPERADO

Después de completar esta limpieza:

```
✅ Proyecto más limpio y organizado
✅ -20% archivos innecesarios
✅ 100% cumplimiento con ARQUITECTURA_FOLDER.md
✅ Documentación organizada cronológicamente
✅ Componentes en ubicaciones semánticamente correctas
```

---

**Documento de apoyo:** [AUDITORIA_ARQUITECTURA_2026-02-13.md](AUDITORIA_ARQUITECTURA_2026-02-13.md)
