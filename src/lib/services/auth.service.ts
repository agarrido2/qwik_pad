import type { RequestEventAction, RequestEventLoader } from '@builder.io/qwik-city';
import { createServerSupabaseClient } from '../supabase/client.server';
import type { LoginInput, RegisterInput } from '../schemas/auth.schemas';

/**
 * Type helper para cualquier tipo de RequestEvent
 */
type AnyRequestEvent = RequestEventAction | RequestEventLoader | Parameters<import('@builder.io/qwik-city').RequestHandler>[0];

/**
 * Auth Service - Maneja autenticación con Supabase
 * Todas las funciones reciben RequestEvent para manejar cookies (SSR)
 */

export class AuthService {
  /**
   * Login con email y password
   */
  static async signInWithEmail(
    requestEvent: RequestEventAction,
    input: LoginInput,
  ) {
    const supabase = createServerSupabaseClient(requestEvent);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Registro con email y password
   */
  static async signUp(requestEvent: RequestEventAction, input: RegisterInput) {
    const supabase = createServerSupabaseClient(requestEvent);

    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.fullName,
        },
      },
    });

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Logout
   */
  static async signOut(requestEvent: RequestEventAction) {
    const supabase = createServerSupabaseClient(requestEvent);
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }

  /**
   * Obtiene el usuario autenticado (valida JWT)
   * IMPORTANTE: Usa getUser() no getSession() para seguridad
   */
  static async getAuthUser(
    requestEvent: RequestEventLoader | RequestEventAction,
  ) {
    const supabase = createServerSupabaseClient(requestEvent);
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data.user) return null;
    return data.user;
  }

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

    console.log('[AuthService] Iniciando OAuth con Google...');
    console.log('[AuthService] Callback URL:', callbackUrl);

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
      console.error('[AuthService] OAuth Error:', error);
      throw new Error(error?.message || 'Error al generar URL de OAuth');
    }

    console.log('[AuthService] OAuth URL generada exitosamente');
    return data.url;
  }

  /**
   * Verifica que el usuario existe en public.users después de OAuth
   * @description Implementa retry logic para evitar race conditions con el trigger
   * y fallback manual si el trigger falla. Esta es lógica de negocio reutilizable.
   * 
   * ARQUITECTURA: Esta lógica estaba en routes/(auth)/callback/index.tsx
   * y fue movida aquí para cumplir con el Patrón Orchestrator.
   * 
   * @param requestEvent - RequestEvent para crear cliente Supabase
   * @param authUserId - ID del usuario en auth.users
   * @param email - Email del usuario
   * @param userMetadata - Metadata de Supabase Auth (nombre, etc.)
   * @returns Promise con resultado (success + user o error)
   */
  static async ensureUserExistsAfterOAuth(
    requestEvent: AnyRequestEvent,
    authUserId: string,
    email: string | undefined,
    userMetadata: Record<string, any>
  ): Promise<{ success: true; user: any } | { success: false; error: string }> {
    const supabase = createServerSupabaseClient(requestEvent);
    
    let retryCount = 0;
    const maxRetries = 3;
    let publicUserFound = false;
    let publicUser: any = null;

    // Retry loop: esperar a que el trigger cree el usuario
    while (retryCount < maxRetries && !publicUserFound) {
      // Esperar 500ms para dar tiempo al trigger (aumenta con cada retry)
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, 500 * retryCount));
      }

      const { data, error } = await supabase
        .from('users')
        .select('id, email, role, subscription_tier, onboarding_completed')
        .eq('id', authUserId)
        .single();

      if (!error && data) {
        publicUserFound = true;
        publicUser = data;
        if (import.meta.env.DEV) {
          console.log('[AuthService] ✅ User verified in public.users:', data.email);
        }
        break;
      }

      retryCount++;
      if (import.meta.env.DEV) {
        console.log(`[AuthService] User not found in public.users, retry ${retryCount}/${maxRetries}`);
      }
    }

    // Fallback: Si después de 3 intentos no existe, crear manualmente
    if (!publicUserFound) {
      console.error('[AuthService] CRITICAL: Trigger failed after', maxRetries, 'retries. Creating user manually.');
      
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: authUserId,
          email: email || 'unknown@example.com',
          full_name: (
            userMetadata?.full_name ||
            userMetadata?.name ||
            email?.split('@')[0] ||
            'Usuario'
          ),
          role: 'invited',
          subscription_tier: 'free',
          is_active: true,
          onboarding_completed: false,
          timezone: 'Europe/Madrid',
          locale: 'es',
        });

      if (insertError) {
        console.error('[AuthService] CRITICAL: Manual user creation failed:', insertError);
        return {
          success: false,
          error: 'Error crítico en registro. Por favor contacta soporte.',
        };
      }

      console.log('[AuthService] ✅ User created manually (trigger fallback successful)');
      
      // Refrescar datos del usuario recién creado
      const { data: newUser } = await supabase
        .from('users')
        .select('id, email, role, subscription_tier, onboarding_completed')
        .eq('id', authUserId)
        .single();
      
      publicUser = newUser;
    }

    return { success: true, user: publicUser };
  }
}
