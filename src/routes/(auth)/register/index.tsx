/**
 * Register Page - Registro con Email/Password + Google OAuth
 * routeAction$ con validación zod$
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

// Action: Registro
export const useRegisterAction = routeAction$(
  async (data, requestEvent) => {
    try {
      await AuthService.signUp(requestEvent, {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
      });

      // Tras registro exitoso, redirigir a onboarding
      throw requestEvent.redirect(302, '/onboarding');
    } catch (err: any) {
      if (err?.status === 302) throw err;
      return requestEvent.fail(400, { message: err.message || 'Error al registrarse' });
    }
  },
  zod$({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    fullName: z.string().min(2, 'Nombre completo requerido'),
  }),
);

// Action: Registro con Google OAuth (Devuelve URL para redirect client-side)
export const useGoogleRegisterAction = routeAction$(async (_, requestEvent) => {
  try {
    if (import.meta.env.DEV) {
      console.log('🔵 [Register OAuth] Action iniciada');
    }
    const oauthUrl = await AuthService.getGoogleOAuthUrl(requestEvent, '/onboarding');
    if (import.meta.env.DEV) {
      console.log('🟢 [Register OAuth] URL obtenida:', oauthUrl);
    }
    
    // Devolver la URL para redirect client-side
    return {
      success: true,
      redirectUrl: oauthUrl
    };
  } catch (err: any) {
    console.error('🔴 [Register OAuth] Error capturado:', err);
    
    return requestEvent.fail(500, { 
      message: err.message || 'Error al iniciar registro con Google. Por favor, inténtalo de nuevo.' 
    });
  }
});

export default component$(() => {
  const registerAction = useRegisterAction();
  const googleAction = useGoogleRegisterAction();

  // Redirect automático cuando OAuth devuelve URL (Resumable)
  useTask$(({ track }) => {
    const result = track(() => googleAction.value);
    if (!isServer && result?.success && result.redirectUrl) {
      console.log('🟢 [Register] Redirigiendo a OAuth:', result.redirectUrl);
      window.location.href = result.redirectUrl;
    }
  });

  return (
    <div class="space-y-6">
      <div class="text-center">
        <h1 class="text-2xl font-bold text-neutral-900">Crear cuenta</h1>
        <p class="mt-2 text-sm text-neutral-600">
          Empieza gratis, sin tarjeta de crédito
        </p>
      </div>

      {registerAction.value?.failed && (
        <Alert variant="error">
          {registerAction.value.message}
        </Alert>
      )}

      {googleAction.value?.failed && (
        <Alert variant="error">
          {googleAction.value.message || 'Error al iniciar registro con Google'}
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
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.10z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
          Registrarse con Google
        </Button>
      </Form>

      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-neutral-300" />
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="bg-white px-2 text-neutral-500">o con tu email</span>
        </div>
      </div>

      <Form 
        action={registerAction} 
        class="space-y-4" 
        spaReset
        autocomplete="off"
      >
        <Input
          name="fullName"
          type="text"
          label="Nombre completo"
          placeholder="Juan Pérez"
          required
          autocomplete="off"
          error={registerAction.value?.fieldErrors?.fullName?.[0]}
        />
        <Input
          name="email"
          type="email"
          label="Email"
          placeholder="tu@email.com"
          required
          autocomplete="off"
          error={registerAction.value?.fieldErrors?.email?.[0]}
        />
        <Input
          name="password"
          type="password"
          label="Contraseña"
          placeholder="Mínimo 6 caracteres"
          required
          autocomplete="new-password"
          error={registerAction.value?.fieldErrors?.password?.[0]}
        />

        <Button type="submit" class="w-full" disabled={registerAction.isRunning}>
          {registerAction.isRunning && <Spinner size="sm" />}
          Crear cuenta
        </Button>
      </Form>

      <p class="text-center text-sm text-neutral-600">
        ¿Ya tienes cuenta?{' '}
        <a href="/login" class="font-medium text-primary-600 hover:text-primary-700">
          Inicia sesión
        </a>
      </p>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Crear cuenta - Onucall',
  meta: [
    {
      name: 'description',
      content: 'Crea tu cuenta gratuita en Onucall y comienza a automatizar tu atención telefónica con agentes de voz IA. Sin tarjeta de crédito.',
    },
  ],
};
