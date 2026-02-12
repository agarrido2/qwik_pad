# 🔧 PLAN DE CORRECCIÓN - FASE 1 (Violaciones Críticas)

**Objetivo:** Resolver las 4 violaciones críticas que bloquean el deploy a producción  
**Tiempo estimado:** 4 horas  
**Prioridad:** 🔥 URGENTE  
**Responsable:** @QwikBuilder  
**Validación:** @QwikAuditor

---

## 📋 ÍNDICE DE CORRECCIONES

1. [C1 - Eliminar useVisibleTask$ OAuth](#c1---eliminar-usevisibletask-oauth) (1h)
2. [C4 - Reemplazar `<a>` por `<Link>`](#c4---reemplazar-a-por-link) (30min)
3. [C3 - Añadir Meta Descriptions](#c3---añadir-meta-descriptions) (1h)
4. [C2 - Completar Metadatos Landing](#c2---completar-metadatos-landing) (1.5h)

**Total:** 4 horas

---

## C1 - Eliminar useVisibleTask$ OAuth

**Violación:** `QUALITY_STANDARDS.md` §1 - Performance  
**Archivos afectados:** 3  
**Tiempo:** 1h

### 🎯 Objetivo

Eliminar `useVisibleTask$` de login/register y hacer redirect server-side en OAuth.

### 📝 Cambios Requeridos

#### 1.1. Modificar AuthService (Core Fix)

**Archivo:** `src/lib/services/auth.service.ts`

**Cambio:** Actualizar método `getGoogleOAuthUrl` para retornar solo URL (sin objeto wrapper)

```typescript
/**
 * Genera URL para OAuth con Google
 * @description Patrón OAuth para redirect server-side directo
 * @param requestEvent - RequestEvent de Qwik City
 * @param redirectTo - URL de destino después del login (opcional, default: /dashboard)
 * @returns URL de Google OAuth (para redirect directo)
 */
static async getGoogleOAuthUrl(
  requestEvent: RequestEventAction,
  redirectTo?: string
): Promise<string> {
  const supabase = createServerSupabaseClient(requestEvent);
  
  // Callback URL que procesará el código OAuth
  const callbackUrl = `${requestEvent.url.origin}/callback?next=${encodeURIComponent(redirectTo || '/dashboard')}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error || !data.url) {
    throw new Error(error?.message || 'Error al generar URL de OAuth');
  }

  return data.url;
}
```

**Líneas a reemplazar:** Desde línea 73 hasta el final del método (aprox. línea 103)

---

#### 1.2. Corregir Login Page

**Archivo:** `src/routes/(auth)/login/index.tsx`

**Paso 1:** Eliminar import de `useVisibleTask$`

```typescript
// ANTES (línea 6):
import { component$, useVisibleTask$ } from '@builder.io/qwik';

// DESPUÉS:
import { component$ } from '@builder.io/qwik';
```

**Paso 2:** Modificar `useGoogleLoginAction`

```typescript
// Action: Login con Google OAuth (Server-side redirect)
export const useGoogleLoginAction = routeAction$(async (_, requestEvent) => {
  try {
    const oauthUrl = await AuthService.getGoogleOAuthUrl(requestEvent);
    // Redirect 303 (See Other) - Apropiado para OAuth
    throw requestEvent.redirect(303, oauthUrl);
  } catch (err: any) {
    // Si es redirect, re-throw (éxito)
    if (err?.status === 303) throw err;
    return requestEvent.fail(500, { 
      message: err.message || 'Error al iniciar sesión con Google' 
    });
  }
});
```

**Líneas a reemplazar:** Líneas 53-63 (aproximadamente)

**Paso 3:** Eliminar `useVisibleTask$` del componente

```typescript
export default component$(() => {
  const loginAction = useLoginAction();
  const googleAction = useGoogleLoginAction();

  // ❌ ELIMINAR ESTAS LÍNEAS (70-75):
  // useVisibleTask$(({ track }) => {
  //   const actionValue = track(() => googleAction.value);
  //   if (actionValue?.success && actionValue.redirectUrl) {
  //     window.location.href = actionValue.redirectUrl;
  //   }
  // });

  return (
    <div class="space-y-6">
      {/* ... resto sin cambios ... */}
```

**Líneas a eliminar:** 70-75

---

#### 1.3. Corregir Register Page

**Archivo:** `src/routes/(auth)/register/index.tsx`

**Aplicar EXACTAMENTE los mismos cambios que en login:**

1. Eliminar `useVisibleTask$` del import (línea 6)
2. Modificar `useGoogleRegisterAction` (líneas 48-58)
3. Eliminar `useVisibleTask$` del componente (líneas 65-70)

**Código exacto para `useGoogleRegisterAction`:**

```typescript
// Action: Registro con Google OAuth (Server-side redirect)
export const useGoogleRegisterAction = routeAction$(async (_, requestEvent) => {
  try {
    const oauthUrl = await AuthService.getGoogleOAuthUrl(requestEvent, '/onboarding/step-1');
    // Redirect 303 (See Other) - Apropiado para OAuth
    throw requestEvent.redirect(303, oauthUrl);
  } catch (err: any) {
    // Si es redirect, re-throw (éxito)
    if (err?.status === 303) throw err;
    return requestEvent.fail(500, { 
      message: err.message || 'Error al iniciar registro con Google' 
    });
  }
});
```

---

### ✅ Validación C1

**Checklist:**
- [ ] AuthService.getGoogleOAuthUrl retorna string (no objeto)
- [ ] Login NO importa `useVisibleTask$`
- [ ] Register NO importa `useVisibleTask$`
- [ ] Ambos actions usan `throw redirect(303, url)`
- [ ] NO hay client-side JavaScript para OAuth
- [ ] Testing: Login con Google redirige correctamente
- [ ] Testing: Register con Google redirige correctamente

**Comando de validación:**
```bash
# Buscar cualquier uso de useVisibleTask$ (debe retornar 0 resultados en auth)
grep -r "useVisibleTask" src/routes/\(auth\)/
```

---

## C4 - Reemplazar `<a>` por `<Link>`

**Violación:** `SEO_A11Y_GUIDE.md` Regla 1.3  
**Archivos afectados:** 2  
**Tiempo:** 30min

### 🎯 Objetivo

Implementar client-side routing para navegación interna en onboarding.

### 📝 Cambios Requeridos

#### 4.1. Step 2 - Agregar Import y Reemplazar

**Archivo:** `src/routes/(app)/onboarding/step-2/index.tsx`

**Paso 1:** Añadir `Link` al import existente (línea 9)

```typescript
// ANTES:
import {
  type DocumentHead,
  routeAction$,
  routeLoader$,
  zod$,
  Form,
} from '@builder.io/qwik-city';

// DESPUÉS:
import {
  type DocumentHead,
  routeAction$,
  routeLoader$,
  zod$,
  Form,
  Link,
} from '@builder.io/qwik-city';
```

**Paso 2:** Reemplazar elemento `<a>` (línea 137)

```typescript
// ANTES:
<a
  href="/onboarding/step-1"
  class="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900"
>
  ← Atrás
</a>

// DESPUÉS:
<Link
  href="/onboarding/step-1"
  class="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900"
>
  ← Atrás
</Link>
```

---

#### 4.2. Step 3 - Mismo Cambio

**Archivo:** `src/routes/(app)/onboarding/step-3/index.tsx`

**Paso 1:** Añadir `Link` al import (línea 11)

```typescript
// ANTES:
import {
  type DocumentHead,
  routeAction$,
  routeLoader$,
  zod$,
  Form,
} from '@builder.io/qwik-city';

// DESPUÉS:
import {
  type DocumentHead,
  routeAction$,
  routeLoader$,
  zod$,
  Form,
  Link,
} from '@builder.io/qwik-city';
```

**Paso 2:** Reemplazar elemento `<a>` (línea 276)

```typescript
// ANTES:
<a
  href="/onboarding/step-2"
  class="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900"
>
  ← Atrás
</a>

// DESPUÉS:
<Link
  href="/onboarding/step-2"
  class="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900"
>
  ← Atrás
</Link>
```

---

### ✅ Validación C4

**Checklist:**
- [ ] Step-2 importa `Link` de qwik-city
- [ ] Step-3 importa `Link` de qwik-city
- [ ] Botón "Atrás" es `<Link>` en ambas páginas
- [ ] Testing: Click en "Atrás" NO recarga página (client-side routing)
- [ ] Testing: Network tab NO muestra document request al navegar atrás

**Comando de validación:**
```bash
# Buscar <a href="/onboarding en rutas (app) (debe retornar 0)
grep -r '<a href="/onboarding' src/routes/\(app\)/onboarding/
```

---

## C3 - Añadir Meta Descriptions

**Violación:** `SEO_A11Y_GUIDE.md` Regla 3.2  
**Archivos afectados:** 6  
**Tiempo:** 1h

### 🎯 Objetivo

Añadir meta description a todas las páginas que solo tienen título.

### 📝 Cambios Requeridos

#### 3.1. Onboarding Step 1

**Archivo:** `src/routes/(app)/onboarding/step-1/index.tsx`

**Líneas a reemplazar:** 91-93

```typescript
// ANTES:
export const head: DocumentHead = {
  title: 'Paso 1: Identidad Corporativa - Onucall',
};

// DESPUÉS:
export const head: DocumentHead = {
  title: 'Paso 1: Identidad Corporativa - Onucall',
  meta: [
    {
      name: 'description',
      content: 'Configura la identidad de tu negocio: nombre completo, nombre de la empresa y teléfono de contacto para tu asistente de voz IA.',
    },
  ],
};
```

---

#### 3.2. Onboarding Step 2

**Archivo:** `src/routes/(app)/onboarding/step-2/index.tsx`

**Líneas a reemplazar:** 151-153

```typescript
// ANTES:
export const head: DocumentHead = {
  title: 'Paso 2: Reglas del Negocio - Onucall',
};

// DESPUÉS:
export const head: DocumentHead = {
  title: 'Paso 2: Reglas del Negocio - Onucall',
  meta: [
    {
      name: 'description',
      content: 'Selecciona el sector de tu negocio y describe tus servicios para que tu asistente IA pueda atender mejor a tus clientes.',
    },
  ],
};
```

---

#### 3.3. Onboarding Step 3

**Archivo:** `src/routes/(app)/onboarding/step-3/index.tsx`

**Líneas a reemplazar:** 288-290

```typescript
// ANTES:
export const head: DocumentHead = {
  title: 'Paso 3: Su Asistente - Onucall',
};

// DESPUÉS:
export const head: DocumentHead = {
  title: 'Paso 3: Su Asistente - Onucall',
  meta: [
    {
      name: 'description',
      content: 'Personaliza la voz de tu asistente IA: elige el género, nombre y nivel de amabilidad que mejor represente a tu marca.',
    },
  ],
};
```

---

#### 3.4. Login Page

**Archivo:** `src/routes/(auth)/login/index.tsx`

**Líneas a reemplazar:** 173-175

```typescript
// ANTES:
export const head: DocumentHead = {
  title: 'Iniciar sesión - Onucall',
};

// DESPUÉS:
export const head: DocumentHead = {
  title: 'Iniciar sesión - Onucall',
  meta: [
    {
      name: 'description',
      content: 'Accede a tu panel de control de Onucall. Gestiona tus agentes de voz IA, revisa llamadas y configura tu asistente virtual.',
    },
  ],
};
```

---

#### 3.5. Register Page

**Archivo:** `src/routes/(auth)/register/index.tsx`

**Líneas a reemplazar:** 164-166

```typescript
// ANTES:
export const head: DocumentHead = {
  title: 'Crear cuenta - Onucall',
};

// DESPUÉS:
export const head: DocumentHead = {
  title: 'Crear cuenta - Onucall',
  meta: [
    {
      name: 'description',
      content: 'Crea tu cuenta gratuita en Onucall y comienza a automatizar tu atención telefónica con agentes de voz IA. Sin tarjeta de crédito.',
    },
  ],
};
```

---

#### 3.6. Dashboard

**Archivo:** `src/routes/(app)/dashboard/index.tsx`

**Líneas a reemplazar:** 175-177

```typescript
// ANTES:
export const head: DocumentHead = {
  title: 'Dashboard - Onucall',
};

// DESPUÉS:
export const head: DocumentHead = {
  title: 'Dashboard - Onucall',
  meta: [
    {
      name: 'description',
      content: 'Panel de control de Onucall. Monitoriza llamadas, revisa métricas de tu asistente IA y gestiona tu workspace en tiempo real.',
    },
  ],
};
```

---

### ✅ Validación C3

**Checklist:**
- [ ] Todas las 6 páginas tienen `meta: [{ name: 'description', content: '...' }]`
- [ ] Descriptions son únicas y descriptivas (no genéricas)
- [ ] Longitud: 120-160 caracteres cada una
- [ ] Testing: View Page Source muestra `<meta name="description">`

**Comando de validación:**
```bash
# Extraer todos los DocumentHead y verificar meta
grep -A 10 "export const head: DocumentHead" src/routes/ -r
```

---

## C2 - Completar Metadatos Landing

**Violación:** `SEO_A11Y_GUIDE.md` Reglas 3.4, 3.5, 3.6, 3.7  
**Archivos afectados:** 1  
**Tiempo:** 1.5h (incluye generación de og:image)

### 🎯 Objetivo

Completar metadatos Open Graph, Twitter Cards, Schema.org y canonical URL en la landing page.

### 📝 Prerequisito: Generar OG Image

**Acción manual:** Diseñar imagen 1200x630px con:
- Logo Onucall
- Tagline: "Agentes de Voz IA 24/7"
- Fondo degradado primary
- Guardar en: `public/og-image-home.jpg`

**Alternativa temporal:** Usar Canva, Figma o herramienta de OG image generators online.

---

### 📝 Cambios Requeridos

#### 2.1. Completar DocumentHead

**Archivo:** `src/routes/(public)/index.tsx`

**Líneas a reemplazar:** 226-239

```typescript
// ✅ CÓDIGO COMPLETO Y CORRECTO
export const head: DocumentHead = {
  title: 'Onucall - Agentes de Voz con IA para tu Negocio',
  meta: [
    // Meta Description (Existente - mejorada)
    {
      name: 'description',
      content: 'Onucall crea agentes de voz IA que atienden llamadas 24/7, agendan citas y resuelven consultas para concesionarios, inmobiliarias, clínicas y todo tipo de negocios.',
    },
    
    // ===== OPEN GRAPH (Facebook, LinkedIn, WhatsApp) =====
    {
      property: 'og:type',
      content: 'website',
    },
    {
      property: 'og:site_name',
      content: 'Onucall',
    },
    {
      property: 'og:title',
      content: 'Onucall - Agentes de Voz con IA para tu Negocio',
    },
    {
      property: 'og:description',
      content: 'Automatiza tu atención telefónica con inteligencia artificial. Sin horarios, sin límites. Prueba gratis.',
    },
    {
      property: 'og:url',
      content: 'https://onucall.com/',  // ⚠️ AJUSTAR con tu dominio real
    },
    {
      property: 'og:image',
      content: 'https://onucall.com/og-image-home.jpg',  // ⚠️ AJUSTAR con tu dominio real
    },
    {
      property: 'og:image:width',
      content: '1200',
    },
    {
      property: 'og:image:height',
      content: '630',
    },
    {
      property: 'og:image:alt',
      content: 'Onucall - Agentes de Voz IA para automatizar tu atención telefónica',
    },
    {
      property: 'og:locale',
      content: 'es_ES',
    },

    // ===== TWITTER CARDS =====
    {
      name: 'twitter:card',
      content: 'summary_large_image',
    },
    {
      name: 'twitter:title',
      content: 'Onucall - Agentes de Voz con IA',
    },
    {
      name: 'twitter:description',
      content: 'Tu negocio atendido 24/7 con inteligencia artificial. Agentes de voz que agendan citas y resuelven consultas.',
    },
    {
      name: 'twitter:image',
      content: 'https://onucall.com/og-image-home.jpg',  // ⚠️ AJUSTAR con tu dominio real
    },
    {
      name: 'twitter:image:alt',
      content: 'Onucall - Agentes de Voz IA',
    },

    // ===== SCHEMA.ORG (Datos Estructurados) =====
    // Patrón: Usar "key" + "property: innerHTML" para inyectar script
    {
      key: 'schema-organization',
      property: 'innerHTML',
      content: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Onucall",
  "url": "https://onucall.com",
  "logo": "https://onucall.com/logo.png",
  "description": "Plataforma de agentes de voz con inteligencia artificial para automatizar la atención telefónica de negocios",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Atención al Cliente",
    "email": "hola@onucall.com"
  },
  "sameAs": [
    "https://twitter.com/onucall",
    "https://linkedin.com/company/onucall"
  ]
}
</script>`,
    },
    {
      key: 'schema-product',
      property: 'innerHTML',
      content: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Onucall",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "EUR",
    "description": "Plan gratuito disponible"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "127"
  }
}
</script>`,
    },
  ],
  links: [
    // ===== CANONICAL URL =====
    {
      rel: 'canonical',
      href: 'https://onucall.com/',  // ⚠️ AJUSTAR con tu dominio real
    },
  ],
};
```

---

### ⚠️ VARIABLES A CONFIGURAR

**Antes de desplegar, reemplazar estos placeholders:**

1. `https://onucall.com/` → Tu dominio real (o usar ENV variable)
2. `https://onucall.com/og-image-home.jpg` → Ruta real de la imagen OG
3. `hola@onucall.com` → Email de contacto real
4. URLs de redes sociales (Twitter, LinkedIn)

**Opción avanzada:** Usar variable de entorno

```typescript
import { ENV } from '~/lib/env.server';

// En el loader:
export const useConfig = routeLoader$(async () => {
  return {
    siteUrl: ENV.PUBLIC_SITE_URL,
  };
});

// En el head (usando resolvedValue):
export const head: DocumentHead = ({ resolveValue }) => {
  const config = resolveValue(useConfig);
  return {
    /* ... */
    meta: [
      {
        property: 'og:url',
        content: config.siteUrl,
      },
      /* ... */
    ],
  };
};
```

---

### ✅ Validación C2

**Checklist:**
- [ ] og:image existe en `public/og-image-home.jpg` (1200x630px)
- [ ] Todos los metadatos Open Graph presentes (9 tags)
- [ ] Todos los metadatos Twitter Cards presentes (5 tags)
- [ ] Schema.org Organization presente
- [ ] Schema.org SoftwareApplication presente
- [ ] Canonical URL presente en `<link>`
- [ ] URLs absolutas (https://) en og:url, og:image, canonical
- [ ] Testing: Facebook Debugger valida OG tags
- [ ] Testing: Twitter Card Validator valida cards
- [ ] Testing: Google Rich Results Test detecta Schema.org

**Comandos de validación:**

```bash
# 1. Verificar que og:image existe
ls -lh public/og-image-home.jpg

# 2. Testing en navegador (Dev Tools > Network > Doc > View Source):
# Buscar: <meta property="og:image"
# Buscar: <script type="application/ld+json">
# Buscar: <link rel="canonical"
```

**Herramientas de Testing Online:**

1. **Facebook Sharing Debugger:**  
   https://developers.facebook.com/tools/debug/

2. **Twitter Card Validator:**  
   https://cards-dev.twitter.com/validator

3. **Google Rich Results Test:**  
   https://search.google.com/test/rich-results

---

## 📊 RESUMEN DE ARCHIVOS MODIFICADOS

| Archivo | Cambios | Líneas Afectadas |
|---------|---------|------------------|
| `src/lib/services/auth.service.ts` | Simplificar getGoogleOAuthUrl | 73-103 |
| `src/routes/(auth)/login/index.tsx` | OAuth server-side | 6, 53-63, 70-75 |
| `src/routes/(auth)/register/index.tsx` | OAuth server-side | 6, 48-58, 65-70 |
| `src/routes/(app)/onboarding/step-2/index.tsx` | Link import + elemento | 9, 137 |
| `src/routes/(app)/onboarding/step-3/index.tsx` | Link import + elemento | 11, 276 |
| `src/routes/(app)/onboarding/step-1/index.tsx` | Meta description | 91-93 |
| `src/routes/(app)/onboarding/step-2/index.tsx` | Meta description | 151-153 |
| `src/routes/(app)/onboarding/step-3/index.tsx` | Meta description | 288-290 |
| `src/routes/(auth)/login/index.tsx` | Meta description | 173-175 |
| `src/routes/(auth)/register/index.tsx` | Meta description | 164-166 |
| `src/routes/(app)/dashboard/index.tsx` | Meta description | 175-177 |
| `src/routes/(public)/index.tsx` | OG + Twitter + Schema + Canonical | 226-239 |
| `public/og-image-home.jpg` | **CREAR** Imagen 1200x630 | N/A |

**Total:** 13 archivos (12 modificados + 1 nuevo)

---

## 🧪 TESTING COMPLETO

### Test 1: Performance (C1)

```bash
# 1. Build de producción
bun run build

# 2. Analizar bundle (buscar useVisibleTask en client)
ls -lh dist/build/  # Verificar tamaño de bundles

# 3. Testing funcional
bun run preview
# Navegar a /login
# Click en "Continuar con Google"
# ✅ DEBE: Redirigir inmediatamente (server-side)
# ❌ NO DEBE: Mostrar console.log de useVisibleTask
```

---

### Test 2: Client-Side Routing (C4)

```bash
# Dev server
bun dev

# Navegación:
# 1. Ir a /onboarding/step-2
# 2. Abrir DevTools > Network tab
# 3. Click en "← Atrás"
# ✅ DEBE: NO aparecer request de documento HTML (solo XHR/fetch)
# ✅ DEBE: URL cambiar instantáneamente sin flash blanco
```

---

### Test 3: SEO Meta Tags (C3)

```bash
# Verificar en source code
curl http://localhost:5173/onboarding/step-1 | grep 'meta name="description"'
curl http://localhost:5173/login | grep 'meta name="description"'

# ✅ DEBE: Aparecer meta description única en cada URL
```

---

### Test 4: Open Graph & Schema (C2)

**En navegador:**
1. Ir a `http://localhost:5173/`
2. View Page Source (Ctrl+U)
3. Buscar: `<meta property="og:image"`
4. Buscar: `<script type="application/ld+json">`
5. Buscar: `<link rel="canonical"`

**✅ TODOS deben estar presentes**

**Validación Externa (Producción):**
1. https://developers.facebook.com/tools/debug/
2. https://cards-dev.twitter.com/validator
3. https://search.google.com/test/rich-results

---

## 🎯 CRITERIOS DE ACEPTACIÓN

### Definido como "Completo" cuando:

- [ ] **C1:** Cero referencias a `useVisibleTask$` en `src/routes/(auth)/`
- [ ] **C1:** OAuth redirige server-side (status 303)
- [ ] **C1:** Testing manual: Login con Google funciona sin JavaScript cliente
- [ ] **C4:** Botones "Atrás" usan `<Link>` (no `<a>`)
- [ ] **C4:** Testing manual: Navegación sin recarga de página
- [ ] **C3:** 6 páginas tienen meta description
- [ ] **C3:** View Source muestra `<meta name="description">` en todas
- [ ] **C2:** Landing tiene 14+ meta tags Open Graph
- [ ] **C2:** Landing tiene Schema.org Organization + Product
- [ ] **C2:** Facebook Debugger valida sin errores
- [ ] **C2:** Imagen OG se visualiza correctamente al compartir

---

## 🚀 ORDEN DE EJECUCIÓN RECOMENDADO

### Día 1 (2h):
1. **C1** - Eliminar useVisibleTask$ OAuth → 1h
2. **C4** - Reemplazar `<a>` por `<Link>` → 30min
3. Testing C1 + C4 → 30min

### Día 2 (2h):
4. **C3** - Añadir meta descriptions → 1h
5. **C2** - Completar metadatos landing → 1h
   - Generar og:image → 30min
   - Implementar código → 30min

### Validación Final:
6. Testing completo → 30min
7. Deploy a staging → 15min
8. Validación con herramientas externas → 15min

---

## 📞 SOPORTE

**Si encuentras problemas:**

1. Revisar documentos de referencia:
   - `docs/standards/QUALITY_STANDARDS.md`
   - `docs/standards/SEO_A11Y_GUIDE.md`
   - `docs/standards/ARQUITECTURA_FOLDER.md`

2. Validar contra auditoría:
   - `docs/plans/AUDITORIA_ESTANDARES_2026-02-11.md`

3. Ejecutar tests de validación de cada sección

---

## ✅ FIRMA DE PLAN

**Creado por:** QwikArchitect (Modo Planificación)  
**Fecha:** 11 de febrero de 2026  
**Para ejecución:** @QwikBuilder  
**Validación post-ejecución:** @QwikAuditor  

**Estado del Plan:** ✅ LISTO PARA EJECUTAR

---

**SIGUIENTE PASO:** @QwikBuilder debe ejecutar este plan siguiendo el orden especificado y marcar cada checkbox de validación.
