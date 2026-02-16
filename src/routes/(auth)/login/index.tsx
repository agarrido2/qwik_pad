/**
 * Login Page - Email/Password + Google OAuth
 * routeAction$ con validación zod$ para formulario
 */

import { component$, useTask$ } from '@builder.io/qwik';
import { type DocumentHead, routeAction$, routeLoader$, zod$, z, Form } from '@builder.io/qwik-city';
import { isServer } from '@builder.io/qwik/build';
import { Button, Input, Alert, Spinner } from '~/components/ui';
import { AuthService } from '~/lib/services/auth.service';
import { getAuthGuardData } from '~/lib/auth/auth-guard';

// Si ya está logueado, redirige
export const useCheckAuth = routeLoader$(async (requestEvent) => {
  const data = await getAuthGuardData(requestEvent);
  if (data) {
    if (!data.dbUser.onboardingCompleted) {
      throw requestEvent.redirect(302, '/onboarding');
    }
    throw requestEvent.redirect(302, '/dashboard');
  }
  return {};
});

// Action: Login con email/password
export const useLoginAction = routeAction$(
  async (data, requestEvent) => {
    try {
      await AuthService.signInWithEmail(requestEvent, {
        email: data.email,
        password: data.password,
      });

      // Verificar onboarding
      const guardData = await getAuthGuardData(requestEvent);
      if (guardData && !guardData.dbUser.onboardingCompleted) {
        throw requestEvent.redirect(302, '/onboarding');
      }

      throw requestEvent.redirect(302, '/dashboard');
    } catch (err: any) {
      // Si es redirect, re-throw
      if (err?.status === 302) throw err;
      return requestEvent.fail(401, { message: err.message || 'Credenciales inválidas' });
    }
  },
  zod$({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
  }),
);

// Action: Login con Google OAuth (Devuelve URL para redirect client-side)
export const useGoogleLoginAction = routeAction$(async (_, requestEvent) => {
  try {
    if (import.meta.env.DEV) {
      console.log('🔵 [Login OAuth] Action iniciada');
    }
    const oauthUrl = await AuthService.getGoogleOAuthUrl(requestEvent, '/dashboard');
    if (import.meta.env.DEV) {
      console.log('🟢 [Login OAuth] URL obtenida:', oauthUrl);
    }
    
    // Devolver la URL para redirect client-side
    return {
      success: true,
      redirectUrl: oauthUrl
    };
  } catch (err: any) {
    console.error('🔴 [Login OAuth] Error capturado:', err);
    
    return requestEvent.fail(500, { 
      message: err.message || 'Error al iniciar sesión con Google. Por favor, inténtalo de nuevo.' 
    });
  }
});

export default component$(() => {
  const loginAction = useLoginAction();
  const googleAction = useGoogleLoginAction();

  // Redirect automático cuando OAuth devuelve URL (Resumable)
  useTask$(({ track }) => {
    const result = track(() => googleAction.value);
    if (!isServer && result?.success && result.redirectUrl) {
      console.log('🟢 [Login] Redirigiendo a OAuth:', result.redirectUrl);
      window.location.href = result.redirectUrl;
    }
  });

  return (
    <div class="space-y-6">
      <div class="text-center">
        <h1 class="text-2xl font-bold text-neutral-900">Iniciar sesión</h1>
        <p class="mt-2 text-sm text-neutral-600">
          Accede a tu cuenta de Onucall
        </p>
      </div>

      {/* Error messages */}
      {loginAction.value?.failed && (
        <Alert variant="error">
          {loginAction.value.message}
        </Alert>
      )}

      {googleAction.value?.failed && (
        <Alert variant="error">
          {googleAction.value.message || 'Error al iniciar sesión con Google'}
        </Alert>
      )}

      {/* Google OAuth */}
      <Form action={googleAction} spaReset>
        <input type="hidden" name="_oauth" value="google" />
        <Button
          type="submit"
          variant="outline"
          class="w-full"
          disabled={googleAction.isRunning}
        >
          {googleAction.isRunning ? (
            <Spinner size="sm" />
          ) : (
            <svg class="mr-2 h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
          Continuar con Google
        </Button>
      </Form>

      {/* Separador */}
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-neutral-300" />
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="bg-white px-2 text-neutral-500">o con tu email</span>
        </div>
      </div>

      {/* Form Email/Password */}
      <Form 
        action={loginAction} 
        class="space-y-4" 
        spaReset
        autocomplete="off"
      >
        {/* Campos ocultos para confundir al autocomplete del navegador */}
        <input type="text" name="fake-username" style="display:none" autocomplete="off" aria-hidden="true" tabIndex={-1} />
        <input type="password" name="fake-password" style="display:none" autocomplete="off" aria-hidden="true" tabIndex={-1} />
        
        <Input
          name="email"
          type="email"
          label="Email"
          placeholder="tu@email.com"
          required
          autocomplete="new-password"
          error={loginAction.value?.fieldErrors?.email?.[0]}
        />
        <Input
          name="password"
          type="password"
          label="Contraseña"
          placeholder="••••••••"
          required
          autocomplete="new-password"
          error={loginAction.value?.fieldErrors?.password?.[0]}
        />

        <div class="flex items-center justify-end">
          <a href="/forgot-password" class="text-sm font-medium text-primary-600 hover:text-primary-700">
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <Button type="submit" class="w-full" disabled={loginAction.isRunning}>
          {loginAction.isRunning && <Spinner size="sm" />}
          Iniciar sesión
        </Button>
      </Form>

      <p class="text-center text-sm text-neutral-600">
        ¿No tienes cuenta?{' '}
        <a href="/register" class="font-medium text-primary-600 hover:text-primary-700">
          Regístrate gratis
        </a>
      </p>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Iniciar sesión - Onucall',
  meta: [
    {
      name: 'description',
      content: 'Accede a tu panel de control de Onucall. Gestiona tus agentes de voz IA, revisa llamadas y configura tu asistente virtual.',
    },
  ],
};
