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
   */
  static async getGoogleOAuthUrl(requestEvent: RequestEventAction) {
    const supabase = createServerSupabaseClient(requestEvent);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${requestEvent.url.origin}/auth/callback`,
      },
    });

    if (error) throw new Error(error.message);
    return data.url;
  }
}
