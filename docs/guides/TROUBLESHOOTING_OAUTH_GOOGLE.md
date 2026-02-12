# 🔧 Troubleshooting: OAuth Google No Funciona

## 🐛 Problema Reportado

**Síntoma:** Al pulsar el botón "Continuar con Google" hace un flash y se queda ahí. No hay errores visibles.

## ✅ Correcciones Aplicadas

1. ✅ Añadidos mensajes de error visibles en la UI para Google OAuth
2. ✅ Añadido logging detallado en servidor y cliente
3. ✅ Mejorado manejo de errores en las actions

## 🔍 Pasos de Diagnóstico

### PASO 1: Verificar Logs en Terminal

Ahora deberías ver logs en la terminal cuando presionas el botón de Google:

```bash
# Ejecutar dev server
bun dev

# Al presionar el botón, deberías ver:
[AuthService] Iniciando OAuth con Google...
[AuthService] Callback URL: http://localhost:5173/callback?next=%2Fdashboard
[AuthService] OAuth URL generada exitosamente

# O si hay error:
[AuthService] OAuth Error: { message: "..." }
[Login OAuth] Error: Error: ...
```

**¿Qué hacer?**
- ✅ Si ves los logs correctamente → Continúa al PASO 2
- ❌ Si ves error → Revisa el mensaje de error y continúa al PASO 3

---

### PASO 2: Verificar Errores en UI

Ahora los errores deberían mostrarse en pantalla con un Alert rojo.

**¿Qué hacer?**
- ✅ Si no hay error visible → El OAuth está funcionando, el problema está en otra parte
- ❌ Si aparece error → Lee el mensaje y continúa al PASO 3

---

### PASO 3: Verificar Configuración de Supabase

El problema más común es que **OAuth de Google no está configurado en Supabase**.

#### 3.1. Verificar Variables de Entorno

```bash
# Verificar que existan estas variables en .env
cat .env | grep GOOGLE
```

**Deberías ver:**
```env
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
```

**Si NO existen o están vacías:**

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto (si no tienes uno)
3. Habilita Google+ API
4. Ve a "Credenciales" → "Crear credenciales" → "ID de cliente OAuth 2.0"
5. Tipo: Aplicación web
6. URIs de redirección autorizados:
   ```
   https://[TU-PROJECT-ID].supabase.co/auth/v1/callback
   http://localhost:5173/callback
   ```
7. Copia el Client ID y Client Secret a tu `.env`

---

#### 3.2. Configurar OAuth en Supabase Dashboard

1. Ve a [Supabase Dashboard](https://app.supabase.com/)
2. Selecciona tu proyecto
3. Ve a **Authentication** → **Providers**
4. Busca **Google** y habilítalo
5. Pega tu `Client ID` y `Client Secret`
6. Guarda los cambios

**URL de callback debe ser:**
```
https://[TU-PROJECT-ID].supabase.co/auth/v1/callback
```

---

#### 3.3. Verificar Redirect URLs en Supabase

1. En Supabase Dashboard → **Authentication** → **URL Configuration**
2. **Site URL:** `http://localhost:5173` (dev) o `https://tudominio.com` (prod)
3. **Redirect URLs:** Añadir:
   ```
   http://localhost:5173/**
   http://localhost:5173/callback
   https://tudominio.com/**
   https://tudominio.com/callback
   ```

---

### PASO 4: Verificar Flujo Completo

```bash
# 1. Reiniciar servidor (para cargar .env actualizadas)
bun dev

# 2. Abrir DevTools (F12)
# 3. Ir a Console y Network tabs
# 4. Click en "Continuar con Google"
```

**Lo que DEBERÍA pasar:**
1. Ves log: `[AuthService] Iniciando OAuth con Google...`
2. Ves log: `[AuthService] OAuth URL generada exitosamente`
3. El navegador redirige a Google
4. Autorizas la app
5. Google redirige a `/callback`
6. El callback procesa la sesión
7. Redirige a `/dashboard` o `/onboarding`

**Si NO pasa eso:**
- Revisa la pestaña Network en DevTools
- Busca peticiones fallidas (rojas)
- Revisa la consola de errores

---

## 🚨 Problemas Comunes y Soluciones

### Error: "OAuth Error: Invalid provider"

**Causa:** Google OAuth no está habilitado en Supabase  
**Solución:** Ve al PASO 3.2

---

### Error: "redirect_uri_mismatch"

**Causa:** La URL de callback no está autorizada en Google Cloud  
**Solución:**
1. Ve a Google Cloud Console
2. Edita tu OAuth Client ID
3. Añade a "URIs de redirección autorizados":
   ```
   https://[TU-PROJECT-ID].supabase.co/auth/v1/callback
   ```

---

### Error: "Error al generar URL de OAuth"

**Causa:** Variables de entorno no cargadas o Supabase mal configurado  
**Solución:**
1. Verifica `.env` tiene `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`
2. Reinicia servidor: `bun dev`
3. Verifica configuración en Supabase Dashboard

---

### El botón hace "flash" pero no pasa nada (SIN errores)

**Causa Probable:** El redirect se ejecuta pero falla silenciosamente  
**Solución:**
1. Abre DevTools → Console
2. Busca logs de `[AuthService]`
3. Si no hay logs, el problema está ANTES de llegar al servicio
4. Si hay logs pero no redirect, el problema está en el `throw redirect(303)`

**Debug adicional:**
```typescript
// En src/routes/(auth)/login/index.tsx
export const useGoogleLoginAction = routeAction$(async (_, requestEvent) => {
  try {
    console.log('🔵 Action iniciada');
    const oauthUrl = await AuthService.getGoogleOAuthUrl(requestEvent);
    console.log('🟢 URL obtenida:', oauthUrl);
    throw requestEvent.redirect(303, oauthUrl);
  } catch (err: any) {
    console.log('🔴 Error capturado:', err);
    if (err?.status === 303) {
      console.log('🟢 Es redirect, re-lanzando...');
      throw err;
    }
    console.error('[Login OAuth] Error:', err);
    return requestEvent.fail(500, { 
      message: err.message || 'Error al iniciar sesión con Google.' 
    });
  }
});
```

---

## 📋 Checklist de Verificación

- [ ] Variables `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` en `.env`
- [ ] OAuth de Google habilitado en Supabase Dashboard
- [ ] Client ID y Secret configurados en Supabase
- [ ] Redirect URLs configuradas en Supabase
- [ ] Redirect URI autorizada en Google Cloud Console
- [ ] Servidor reiniciado después de cambios en `.env`
- [ ] DevTools abierto para ver logs
- [ ] Mensajes de error visibles en UI (si los hay)

---

## 🔧 Testing Rápido

```bash
# 1. Verificar que Supabase está conectado
node -e "require('dotenv').config(); console.log('URL:', process.env.PUBLIC_SUPABASE_URL)"

# Debe mostrar: URL: https://[tu-project-id].supabase.co

# 2. Verificar OAuth vars
node -e "require('dotenv').config(); console.log('Google ID:', process.env.GOOGLE_CLIENT_ID ? 'Configurado ✅' : 'Falta ❌')"

# Debe mostrar: Google ID: Configurado ✅
```

---

## 📞 ¿Aún no funciona?

Si después de seguir todos estos pasos aún no funciona:

1. **Captura de pantalla de:**
   - Console logs (F12 → Console)
   - Network tab (F12 → Network) cuando presionas el botón
   - Terminal donde corre `bun dev`

2. **Comparte:**
   - Mensaje de error exacto (si aparece)
   - Logs de la terminal
   - Variables de entorno (SIN valores sensibles):
     ```bash
     cat .env | grep -E "PUBLIC_SUPABASE_URL|GOOGLE" | sed 's/=.*/=***/'
     ```

3. **Verifica:**
   - ¿El login con email/password funciona?
   - ¿Otras funciones de Supabase funcionan?
   - ¿Es solo OAuth lo que falla?

---

**Última actualización:** 12 de febrero de 2026  
**Cambios recientes:** Añadido logging detallado y mensajes de error visibles
