import type { RequestEventAction, RequestEventLoader } from '@builder.io/qwik-city';
import { createServerSupabaseClient } from '../supabase/client.server';
import type { LoginInput, RegisterInput } from '../schemas/auth.schemas';

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
}
