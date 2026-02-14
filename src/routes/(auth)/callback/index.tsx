/**
 * OAuth Callback Handler
 * @description Procesa el código de autorización de OAuth providers (Google)
 * y el callback de verificación de email de Supabase
 * 
 * RUTA: /callback (gracias al Route Group (auth))
 * 
 * FLUJO OAuth:
 * 1. Usuario hace clic en "Continuar con Google" en /login
 * 2. getGoogleOAuthUrl genera URL de autorización de Google
 * 3. Usuario autoriza en Google y es redirigido a /callback?code=XXX&next=/dashboard
 * 4. exchangeCodeForSession intercambia el code por una sesión válida
 * 5. Trigger handle_new_auth_user() crea usuario en public.users automáticamente
 * 6. Redirige al dashboard (Auth Guard verificará onboarding y redirigirá si necesario)
 * 
 * FLUJO Email Verification:
 * 1. Usuario se registra con email/password
 * 2. Recibe email con link de verificación que apunta a /callback?code=XXX
 * 3. exchangeCodeForSession valida el email y establece sesión
 * 4. Redirige al dashboard (Auth Guard verificará onboarding)
 * 
 * SEGURIDAD:
 * - Supabase valida el code y previene CSRF con state parameter
 * - Cookies httpOnly establecidas automáticamente por @supabase/ssr
 * - No se exponen tokens en URLs ni localStorage
 * 
 * ARQUITECTURA:
 * - throw redirect() debe estar FUERA del try-catch
 * - Qwik City usa RedirectMessage internamente, no Response
 * - Mecanismo de retry previene race condition con trigger handle_new_auth_user()
 */

import { component$ } from '@builder.io/qwik';
import { type RequestHandler, type DocumentHead } from '@builder.io/qwik-city';
import { createServerSupabaseClient } from '~/lib/supabase/client.server';
import { AuthService } from '~/lib/services/auth.service';

/**
 * Middleware que procesa el código OAuth y establece la sesión
 * @description Usa onGet para manejar la redirección de Google (método GET)
 */
export const onGet: RequestHandler = async (requestEvent) => {
  const { url, redirect } = requestEvent;
  
  // Extraer parámetros de la URL
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');
  const next = url.searchParams.get('next') || '/dashboard';

  // Manejar errores de OAuth (usuario canceló o error en Google)
  if (error) {
    if (import.meta.env.DEV) {
      console.error('[OAuth] Error from provider:', error, errorDescription);
    }
    const errorMessage = encodeURIComponent(
      errorDescription || 'Error en la autenticación con Google'
    );
    throw redirect(302, `/login?error=${errorMessage}`);
  }

  // Verificar que existe el código de autorización
  if (!code) {
    if (import.meta.env.DEV) {
      console.error('[OAuth] No authorization code provided');
    }
    throw redirect(302, '/login?error=No se recibió código de autorización');
  }

  // CRÍTICO: try-catch solo para errores de Supabase, NO para redirects
  try {
    const supabase = createServerSupabaseClient(requestEvent);
    
    if (import.meta.env.DEV) {
      console.log('[OAuth] Processing callback with code:', code.substring(0, 8) + '...');
    }

    // Intercambiar el código por una sesión completa
    // Esto establece las cookies de sesión automáticamente vía @supabase/ssr
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      if (import.meta.env.DEV) {
        console.error('[OAuth] Error exchanging code for session:', exchangeError);
      }
      throw redirect(
        302, 
        `/login?error=${encodeURIComponent('Error al procesar autenticación')}`
      );
    }

    if (!data.session) {
      if (import.meta.env.DEV) {
        console.error('[OAuth] No session returned after code exchange');
      }
      throw redirect(
        302,
        `/login?error=${encodeURIComponent('No se pudo establecer la sesión')}`
      );
    }

    // NOTA: El trigger handle_new_auth_user() en Supabase crea automáticamente
    // el registro en public.users si es la primera vez que el usuario se autentica
    if (import.meta.env.DEV) {
      console.log('[OAuth] Login successful for user:', data.user?.email);
    }

    // Verificar que realmente se estableció la sesión antes de redirigir
    const { data: { session: verifySession } } = await supabase.auth.getSession();
    
    if (!verifySession) {
      if (import.meta.env.DEV) {
        console.error('[OAuth] Session not established after exchange');
      }
      throw redirect(302, '/login?error=session_failed');
    }

    if (import.meta.env.DEV) {
      console.log('[OAuth] Session verified, redirecting to:', next);
    }

    // ✅ ORQUESTACIÓN: Delegar verificación y creación de usuario al servicio
    // Esta lógica de negocio ahora vive en AuthService (Patrón Orchestrator)
    const userResult = await AuthService.ensureUserExistsAfterOAuth(
      requestEvent,
      data.user.id,
      data.user.email,
      data.user.user_metadata || {}
    );

    if (!userResult.success) {
      throw redirect(
        302,
        `/login?error=${encodeURIComponent(userResult.error)}`
      );
    }

  } catch (err) {
    // Solo capturamos errores de Supabase, NO redirects de Qwik City
    // Si es un redirect ya lanzado arriba, se propagará automáticamente
    if (import.meta.env.DEV) {
      console.error('[OAuth] Unexpected error in callback:', err);
    }
    throw redirect(
      302,
      `/login?error=${encodeURIComponent('Error inesperado en autenticación')}`
    );
  }

  // ✅ CRÍTICO: throw redirect() FUERA del try-catch
  // Esto previene que sea capturado como error y garantiza su propagación correcta
  throw redirect(302, next);
};

/**
 * Componente de fallback (nunca se renderiza porque onGet siempre redirige)
 * @description Solo para casos donde el middleware no ejecuta el redirect
 */
export default component$(() => {
  return (
    <div class="flex min-h-screen items-center justify-center bg-gray-50">
      <div class="text-center">
        <div class="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p class="text-gray-600">Procesando autenticación...</p>
      </div>
    </div>
  );
});

/**
 * SEO: Página de transición, no indexar
 */
export const head: DocumentHead = {
  title: 'Procesando autenticación - Onucall',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'description', content: 'Completando proceso de autenticación' },
  ],
};
