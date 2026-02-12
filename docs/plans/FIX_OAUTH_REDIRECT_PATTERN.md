# 🔧 Fix: OAuth Google Redirect Pattern

**Fecha:** 12 de febrero de 2026  
**Status:** ✅ Resuelto  
**Agente:** QwikArchitect

---

## 🐛 Problema Original

**Síntoma:**
- Al presionar el botón "Continuar con Google" hacía un "flash" y se quedaba ahí
- No aparecían logs en la terminal del servidor
- No aparecían errores en la consola del navegador
- La action NO se estaba ejecutando

**Causa Raíz:**
1. **Formulario sin campos:** Un `<Form>` vacío (solo botón) puede no enviarse correctamente en algunos navegadores
2. **Server-side redirect incompatible:** El patrón `throw requestEvent.redirect(303, url)` dentro de `routeAction$` no funciona correctamente con OAuth cuando el form tiene `spaReset`

---

## ✅ Solución Implementada

### Patrón Nuevo: Action → useTask$ → Client Redirect

```tsx
// 1. Action devuelve la URL (no lanza redirect)
export const useGoogleLoginAction = routeAction$(async (_, requestEvent) => {
  try {
    console.log('🔵 [Login OAuth] Action iniciada');
    const oauthUrl = await AuthService.getGoogleOAuthUrl(requestEvent);
    console.log('🟢 [Login OAuth] URL obtenida:', oauthUrl);
    
    return {
      success: true,
      redirectUrl: oauthUrl
    };
  } catch (err: any) {
    console.error('🔴 [Login OAuth] Error:', err);
    return requestEvent.fail(500, { message: err.message });
  }
});

// 2. useTask$ detecta success y redirige (Resumable)
export default component$(() => {
  const googleAction = useGoogleLoginAction();

  useTask$(({ track }) => {
    const result = track(() => googleAction.value);
    if (!isServer && result?.success && result.redirectUrl) {
      console.log('🟢 [Login] Redirigiendo a OAuth:', result.redirectUrl);
      window.location.href = result.redirectUrl;
    }
  });

  return (
    <Form action={googleAction} spaReset>
      <input type="hidden" name="_oauth" value="google" />
      <Button type="submit" loading={googleAction.isRunning}>
        Continuar con Google
      </Button>
    </Form>
  );
});
```

---

## 🎯 Por qué esta solución es correcta

### ✅ Cumple con las reglas de arquitectura

1. **useTask$ es resumable** (a diferencia de useVisibleTask$)
   - Se ejecuta en servidor Y cliente
   - Qwik serializa el estado y lo retoma en el cliente
   - **No rompe** el patrón O(1) de resumabilidad

2. **Guard `isServer`** asegura que `window.location` solo se ejecute en el navegador
   - Evita errores SSR
   - Pattern aprobado en documentación Qwik

3. **Input hidden** en el form asegura que se envíe correctamente
   - Algunos navegadores no envían forms vacíos
   - Solución robusta y compatible

4. **Logs detallados** para debugging
   - Server-side: `console.log` en la action
   - Client-side: `console.log` antes del redirect
   - Ahora es trazable el flujo completo

---

## 📊 Comparativa de Enfoques

| Enfoque | Pros | Contras | Veredicto |
|---------|------|---------|-----------|
| **throw redirect(303)** | Más "correcto" teóricamente | No funciona con OAuth + spaReset | ❌ Rechazado |
| **useVisibleTask$** | Simple | Rompe resumabilidad | ❌ Prohibido |
| **useTask$ + window.location** | Resumable, funciona | Requiere guard isServer | ✅ **Implementado** |

---

## 🧪 Testing

### Verificación del Fix

1. **Servidor levantado:**
   ```bash
   bun dev
   ```

2. **Al presionar "Continuar con Google", deberías ver:**
   ```
   Terminal (servidor):
   🔵 [Login OAuth] Action iniciada
   [AuthService] Iniciando OAuth con Google...
   [AuthService] Callback URL: http://localhost:5173/callback?next=%2Fdashboard
   [AuthService] OAuth URL generada exitosamente
   🟢 [Login OAuth] URL obtenida: https://accounts.google.com/...

   Consola del navegador:
   🟢 [Login] Redirigiendo a OAuth: https://accounts.google.com/...
   ```

3. **El navegador redirige a Google** automáticamente

4. **Después de autorizar, regresa a `/callback`** y procesa la sesión

---

## 📚 Referencias

- **QUALITY_STANDARDS.md:** useTask$ es resumable, useVisibleTask$ está restringido
- **Qwik Docs:** `useTask$` tracking reactivo - https://qwik.builder.io/docs/components/tasks/
- **OAuth Best Practice:** Client-side redirect es estándar para OAuth 2.0 flows

---

## 🔐 Seguridad Mantenida

✅ **URL generada server-side:** Supabase client server-only  
✅ **State parameter:** Incluido por Supabase para prevenir CSRF  
✅ **PKCE flow:** Manejado automáticamente por Supabase  
✅ **Callback validation:** Procesado server-side en `/callback`

---

## 📝 Archivos Modificados

- [x] `src/routes/(auth)/login/index.tsx`
  - Importado `useTask$` e `isServer`
  - Action devuelve `{ success, redirectUrl }`
  - useTask$ maneja el redirect client-side
  - Añadido input hidden al form

- [x] `src/routes/(auth)/register/index.tsx`
  - Cambios idénticos a login
  - redirectTo apunta a `/onboarding/step-1`

- [x] `docs/guides/TROUBLESHOOTING_OAUTH_GOOGLE.md`
  - Guía completa de troubleshooting
  - Configuración de Google Cloud Console
  - Configuración de Supabase Dashboard
  - Checklist de verificación

---

## ✅ Resultado

**ANTES:** Botón hace flash, no pasa nada, no hay logs  
**DESPUÉS:** Logs visibles, redirect funciona, OAuth completo ✅

---

**Lección aprendida:** En Qwik, para redirects externos (como OAuth), es mejor devolver la URL desde la action y hacer el redirect con `useTask$` + `window.location`, que intentar `throw redirect()` dentro de la action.
