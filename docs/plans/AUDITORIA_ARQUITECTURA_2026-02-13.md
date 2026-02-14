# 🔍 AUDITORÍA DE ARQUITECTURA Y LIMPIEZA - QWIK PAD

**Fecha:** 13 de febrero de 2026  
**Auditor:** QwikArchitect (Modo Auditoría Completa)  
**Alcance:** Código, estructura de carpetas, documentación y cumplimiento de estándares

---

## 📊 RESUMEN EJECUTIVO

**Estado Global:** ⚠️ **PARCIALMENTE CONFORME**

| Categoría | Estado | Críticas | Importantes | Menores | Limpieza |
|-----------|--------|----------|-------------|---------|----------|
| **Arquitectura** | ❌ Fallo | 1 | 2 | 1 | 3 |
| **Organización** | ⚠️ Parcial | 0 | 1 | 2 | 4 |
| **Documentación** | ⚠️ Parcial | 0 | 1 | 0 | 2 |
| **Código Técnico** | ✅ Conforme | 0 | 0 | 3 | 1 |
| **TOTAL** | **⚠️ REQUIERE ACCIÓN** | **1** | **4** | **6** | **10** |

**Bloqueo de Producción:** NO (pero requiere corrección antes de nueva feature)  
**Requiere Limpieza:** SÍ (10 items identificados para eliminación/reorganización)

---

## 🔴 VIOLACIONES CRÍTICAS

### C1. Lógica de Negocio en Ruta - Callback OAuth

**Estándar Violado:** `ARQUITECTURA_FOLDER.md` §0 "Patrón Orchestrator"  
**Severidad:** 🔴 CRÍTICA  
**Impacto:** Violación directa del principio fundamental de arquitectura

**Ubicación:** [src/routes/(auth)/callback/index.tsx](src/routes/(auth)/callback/index.tsx#L118-L163)

**Problema:**
```tsx
// ❌ VIOLACIÓN: Queries directas a la base de datos en la ruta
const { data: publicUser, error: publicUserError } = await supabase
  .from('users')
  .select('id, email, role, subscription_tier, onboarding_completed')
  .eq('id', data.user.id)
  .single();

// Más adelante...
const { error: insertError } = await supabase
  .from('users')
  .insert({
    id: data.user.id,
    email: data.user.email,
    // ... más campos
  });
```

**Razón de Rechazo:**
- Las rutas SOLO deben orquestar, jamás implementar lógica de negocio
- Verificación de usuario y creación manual son **lógica de dominio**
- Esta lógica NO es reutilizable fuera de esta ruta
- Viola el test: "Si borro routes/, ¿pierdo lógica de negocio?" → SÍ

**Solución Obligatoria:**

1. **Crear servicio en `lib/services/auth.service.ts`:**
```typescript
// ✅ CORRECTO: Lógica en servicio reutilizable
export class AuthService {
  /**
   * Verifica si usuario existe en public.users con retry logic
   * Fallback manual si trigger falló
   */
  static async ensureUserExistsAfterOAuth(
    requestEvent: RequestEventAction,
    authUserId: string,
    email: string,
    metadata: Record<string, any>
  ): Promise<{ success: boolean; user?: any; error?: string }> {
    const supabase = createServerSupabaseClient(requestEvent);
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, 500 * retryCount));
      }

      const { data: publicUser, error } = await supabase
        .from('users')
        .select('id, email, role, subscription_tier, onboarding_completed')
        .eq('id', authUserId)
        .single();

      if (!error && publicUser) {
        return { success: true, user: publicUser };
      }
      retryCount++;
    }

    // Fallback: crear usuario manualmente
    const { error: insertError } = await supabase.from('users').insert({
      id: authUserId,
      email,
      full_name: metadata.full_name || metadata.name || email.split('@')[0],
      role: 'invited',
      subscription_tier: 'free',
      is_active: true,
      onboarding_completed: false,
      timezone: 'Europe/Madrid',
      locale: 'es',
    });

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    return { success: true };
  }
}
```

2. **Refactorizar ruta para solo orquestar:**
```tsx
export const onGet: RequestHandler = async (requestEvent) => {
  const { url, redirect } = requestEvent;
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') || '/dashboard';

  if (!code) {
    throw redirect(302, '/login?error=No se recibió código de autorización');
  }

  try {
    const supabase = createServerSupabaseClient(requestEvent);
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.session) {
      throw redirect(302, `/login?error=${encodeURIComponent('Error al procesar autenticación')}`);
    }

    // ✅ ORQUESTACIÓN: Delegar verificación al servicio
    const result = await AuthService.ensureUserExistsAfterOAuth(
      requestEvent,
      data.user.id,
      data.user.email,
      data.user.user_metadata
    );

    if (!result.success) {
      throw redirect(302, `/login?error=${encodeURIComponent(result.error!)}`);
    }

    if (import.meta.env.DEV) {
      console.log('[OAuth] ✅ User verified, redirecting to:', next);
    }
  } catch (err) {
    // Error handling...
  }

  throw redirect(303, next);
};
```

**Referencias:**
- `ARQUITECTURA_FOLDER.md` líneas 1-95 (Patrón Orchestrator)
- `PROJECT_RULES_CORE.md` líneas 172-195 (Reglas routes/)

---

## ⚠️ VIOLACIONES IMPORTANTES

### ~~I1. Carpeta `components/shared/` Obsoleta~~ ✅ CORREGIDO

**Estado:** ✅ **RESUELTO** (14-Feb-2026)

**Problema Original:**
La carpeta `shared/` fue eliminada incorrectamente y sus componentes movidos a `layouts/` y `ui/`, violando la separación conceptual definida en `ARQUITECTURA_FOLDER.md`.

**Corrección Aplicada:**
- ✅ Restaurada carpeta `src/components/shared/`
- ✅ Movidos `Header.tsx`, `Footer.tsx`, `Hero.tsx` de vuelta a `shared/`
- ✅ Actualizado barrel export en `shared/index.ts`
- ✅ Actualizado import en `public-layout.tsx` para usar `~/components/shared`
- ✅ Limpiados exports incorrectos en `layouts/index.ts` y `ui/index.ts`

**Estructura Final Correcta:**
```
components/
├── icons/              # Iconos SVG
├── ui/                 # Componentes primitivos (Button, Input, Card)
├── shared/             # Bloques de composición (Header, Footer, Hero) ✅
└── layouts/            # Orquestadores estructurales (PublicLayout, DashboardLayout) ✅
```

**Verificación:**
- ✅ Build exitoso
- ✅ Lint sin errores
- ✅ TypeScript sin errores

---

### I2. Duplicación Potencial en Onboarding

**Estándar:** `ARQUITECTURA_FOLDER.md` §4 "Patrón Híbrido"  
**Severidad:** ⚠️ IMPORTANTE  
**Impacto:** Posible confusión, pero arquitectura actual es **válida**

**Ubicaciones:**
- [src/lib/onboarding/](src/lib/onboarding/) → Facade público ✅
- [src/features/onboarding/](src/features/onboarding/) → Implementación privada ✅
- [src/components/onboarding/](src/components/onboarding/) → Componentes UI ⚠️

**Análisis:**
El patrón híbrido permite esta estructura, pero:
- ¿Los componentes en `components/onboarding/` son reutilizables fuera de onboarding?
- Si NO → deberían estar en `features/onboarding/components/`
- Si SÍ → está bien en `components/onboarding/`

**Archivos afectados:**
- `industry-selector.tsx` → Específico de onboarding → debería estar en features/
- `onboarding-progress.tsx` → Específico de onboarding → debería estar en features/

**Solución:**
```bash
# Mover componentes específicos de onboarding a la feature
mv src/components/onboarding/* src/features/onboarding/components/

# Actualizar imports en routes/(app)/onboarding/index.tsx
# De: '~/components/onboarding/...'
# A:  '~/lib/onboarding' (si el facade los exporta)
```

**IMPORTANTE:** Esto requiere actualizar el facade en [src/lib/onboarding/index.ts](src/lib/onboarding/index.ts) para exportar los componentes.

---

### I3. Documentación Obsoleta en `docs/plans/`

**Severidad:** ⚠️ IMPORTANTE  
**Impacto:** Confusión para futuros desarrolladores, dificultad para rastrear historial

**Ubicación:** [docs/plans/](docs/plans/)

**Planes Potencialmente Obsoletos/Completados:**

1. **FASE_01_AUTH_LANDING.md** → ✅ Implementado (auth + landing funcionan)
2. **FIX_OAUTH_REDIRECT_PATTERN.md** → ⚠️ Completado pero callback tiene issues (ver C1)
3. **LIVE_DEMO_SECTION.md** → ✅ Implementado (DemoWidget funcional)
4. **PLAN_CORRECCION_CRITICAS_FASE1.md** → Desconocido (¿se aplicó?)
5. **REFACTOR_UI_COMPONENTS.md** → Desconocido (¿se completó?)
6. **RESUMEN_EJECUCION_FASE1.md** → Documento de resumen, debería archivarse
7. **RESUMEN_SCHEMA_FUSION_DEMO.md** → Documento técnico, OK mantener
8. **AUDITORIA_ESTANDARES_2026-02-11.md** → Auditoría previa, archivar tras esta

**Solución:**

```bash
# Crear carpeta de archivo
mkdir -p docs/plans/archived/

# Mover planes completados
mv docs/plans/FASE_01_AUTH_LANDING.md docs/plans/archived/
mv docs/plans/FIX_OAUTH_REDIRECT_PATTERN.md docs/plans/archived/
mv docs/plans/LIVE_DEMO_SECTION.md docs/plans/archived/
mv docs/plans/RESUMEN_EJECUCION_FASE1.md docs/plans/archived/
mv docs/plans/AUDITORIA_ESTANDARES_2026-02-11.md docs/plans/archived/

# Actualizar README.md en docs/plans/ para reflejar estado
```

---

### I4. TODOs en Código de Producción

**Severidad:** ⚠️ IMPORTANTE  
**Impacto:** Deuda técnica visible, features incompletas

**TODOs Identificados:**

1. **[src/routes/api/demo/webhook/index.ts](src/routes/api/demo/webhook/index.ts#L15)**
   ```typescript
   // TODO: Añadir validación de webhook signature de Retell
   ```
   **Acción:** Crear issue de seguridad o implementar antes de producción

2. **[src/features/onboarding/constants/phone-options.ts](src/features/onboarding/constants/phone-options.ts#L11)**
   ```typescript
   // TODO: Migrar selector de onboarding a cargar dinámicamente desde BD
   ```
   **Acción:** Crear feature ticket o eliminar comentario si no es prioritario

3. **[src/lib/services/demo-data.service.ts](src/lib/services/demo-data.service.ts#L26)**
   ```typescript
   // TODO: En futuro, guardar en tablas dedicadas
   ```
   **Acción:** Documentar en ADR o eliminar si no es necesario

**Solución:**
- Convertir TODOs críticos (webhook security) en issues de GitHub
- Eliminar TODOs no prioritarios y documentar decisiones en ADRs
- Establecer política: "No merge con TODOs críticos sin issue asociado"

---

## 🧹 LIMPIEZA REQUERIDA (10 Items)

### Archivos y Carpetas para Eliminar

#### L1. Carpeta Temporal `tmp/`

**Ubicación:** [/tmp](tmp/)  
**Contenido:** `tsconfig.tsbuildinfo` (archivo de caché de TypeScript)

**Acción:**
```bash
# Eliminar carpeta
rm -rf tmp/

# Añadir a .gitignore
echo "" >> .gitignore
echo "# TypeScript build info" >> .gitignore
echo "tmp/" >> .gitignore
echo "*.tsbuildinfo" >> .gitignore
```

**Justificación:** Archivos de build no deben committearse ni vivir en carpetas sin gitignore.

---

#### L2-L4. Componentes en `components/shared/`

**Ubicación:** [src/components/shared/](src/components/shared/)

**Acción:** Ver solución en **I1** arriba.

---

#### L5-L6. Componentes específicos de feature mal ubicados

**Ubicación:** [src/components/onboarding/](src/components/onboarding/)
- `industry-selector.tsx`
- `onboarding-progress.tsx`

**Acción:** Mover a `features/onboarding/components/` (ver **I2**).

---

#### L7-L9. Documentación obsoleta

**Ubicación:** [docs/plans/](docs/plans/)

**Acción:** Archivar planes completados (ver **I3**).

---

#### L10. Archivo `.DS_Store` (macOS)

**Ubicación:** Raíz del proyecto

**Acción:**
```bash
# Eliminar
find . -name ".DS_Store" -delete

# Asegurar que está en .gitignore (ya está)
grep -q ".DS_Store" .gitignore && echo "✅ Ya está en .gitignore"
```

---

## ⚠️ VIOLACIONES MENORES

### M1. Uso de `useLocation` en Componente UI

**Ubicación:** [src/components/router-head/router-head.tsx](src/components/router-head/router-head.tsx#L9)

**Código:**
```tsx
const loc = useLocation();
```

**Problema:** `router-head` está en `components/` pero usa hooks de router (acoplamiento).

**Severidad:** MENOR (porque es un componente especial del framework)

**Acción:** Documentar excepción o mover a `layouts/`.

---

### M2. Constantes hardcodeadas en onboarding

**Ubicación:** [src/features/onboarding/constants/sectors.ts](src/features/onboarding/constants/sectors.ts)

**Problema:** Opciones de sectores están hardcodeadas (OK para MVP, mejora futura).

**Acción:** Ya documentado en TODO (ver I4), considerar migración a DB en futuro.

---

### M3. Comentarios en español mezclados con inglés

**Ubicación:** Código general

**Problema:** Algunos archivos usan español, otros inglés.

**Acción:** Establecer política de idioma (recomendado: inglés para código, español para docs de negocio).

---

## ✅ ASPECTOS CONFORMES

### Arquitectura Base
- ✅ Separación correcta de `routes/`, `lib/`, `components/`
- ✅ Uso de Route Groups `(app)`, `(auth)`, `(public)`
- ✅ Patrón Híbrido correctamente implementado en `features/demo/`
- ✅ Facades públicos en `lib/` para features complejas

### Base de Datos y Auth
- ✅ Schema centralizado en `lib/db/schema-fusion.ts`
- ✅ Servicios correctamente ubicados en `lib/services/`
- ✅ Validación Zod en `lib/schemas/`
- ✅ Supabase client server-side correcto

### Performance
- ✅ No se encontró uso injustificado de `useVisibleTask$`
- ✅ Uso correcto de `routeLoader$` y `routeAction$`
- ✅ Signals y stores bien utilizados

### Styling
- ✅ Tailwind v4 correctamente configurado
- ✅ Uso de `cn()` utility para clases condicionales

---

## 📋 PLAN DE ACCIÓN RECOMENDADO

### Fase 1: Críticas (Antes de nueva feature)

- [ ] **C1:** Refactorizar `callback/index.tsx` → crear `AuthService.ensureUserExistsAfterOAuth()`
- [ ] **L1:** Eliminar carpeta `tmp/` y actualizar `.gitignore`

**Estimación:** 2-3 horas  
**Responsable:** @QwikBuilder

---

### Fase 2: Limpieza Importante (Recomendado antes de nueva feature)

- [ ] **I1:** Migrar componentes de `shared/` a `layouts/` y/o `ui/`
- [ ] **I2:** Mover componentes de onboarding a feature
- [ ] **I3:** Archivar documentación obsoleta
- [ ] **I4:** Resolver o convertir TODOs en issues

**Estimación:** 3-4 horas  
**Responsable:** @QwikBuilder

---

### Fase 3: Mejoras Menores (Opcional, post-feature)

- [ ] **M1:** Documentar excepción de `router-head` o moverlo
- [ ] **M2:** Considerar migración de sectores a BD (backlog)
- [ ] **M3:** Establecer política de idioma en código

**Estimación:** 1-2 horas  
**Responsable:** Tech Lead

---

## 🎯 CONCLUSIÓN

El proyecto está **estructuralmente sólido** pero requiere:

1. **Corrección crítica inmediata:** Lógica de negocio en ruta de OAuth
2. **Limpieza organizativa:** Carpetas obsoletas, documentación desactualizada
3. **Resolución de deuda técnica:** TODOs y componentes mal ubicados

**Recomendación:** Completar **Fase 1 + Fase 2** antes de iniciar nueva feature para mantener calidad arquitectónica.

**Estado para nueva feature:** ⚠️ **PROCEDER CON PRECAUCIÓN** (resolver C1 primero)

---

## 📚 Referencias Consultadas

- [ARQUITECTURA_FOLDER.md](../standards/ARQUITECTURA_FOLDER.md)
- [PROJECT_RULES_CORE.md](../standards/PROJECT_RULES_CORE.md)
- [SUPABASE_DRIZZLE_MASTER.md](../standards/SUPABASE_DRIZZLE_MASTER.md)
- [QUALITY_STANDARDS.md](../standards/QUALITY_STANDARDS.md)

---

**Auditoría completada el:** 13 de febrero de 2026  
**Próxima auditoría recomendada:** Post-corrección (tras completar Fase 1+2)
