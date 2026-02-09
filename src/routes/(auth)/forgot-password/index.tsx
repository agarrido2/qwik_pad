/**
 * Forgot Password - Solicitud de recuperación de contraseña
 */

import { component$ } from '@builder.io/qwik';
import { type DocumentHead, routeAction$, zod$, z, Form } from '@builder.io/qwik-city';
import { Button, Input, Alert } from '~/components/ui';
import { createServerSupabaseClient } from '~/lib/supabase/client.server';

export const useForgotPasswordAction = routeAction$(
  async (data, requestEvent) => {
    const supabase = createServerSupabaseClient(requestEvent);

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${requestEvent.url.origin}/reset-password`,
    });

    if (error) {
      return requestEvent.fail(400, { message: error.message });
    }

    return { success: true };
  },
  zod$({
    email: z.string().email('Email inválido'),
  }),
);

export default component$(() => {
  const action = useForgotPasswordAction();

  return (
    <div class="space-y-6">
      <div class="text-center">
        <h1 class="text-2xl font-bold text-neutral-900">Recuperar contraseña</h1>
        <p class="mt-2 text-sm text-neutral-600">
          Te enviaremos un enlace para restablecer tu contraseña
        </p>
      </div>

      {action.value?.failed && (
        <Alert variant="error">{action.value.message}</Alert>
      )}

      {action.value?.success && (
        <Alert variant="success" title="Email enviado">
          Revisa tu bandeja de entrada para restablecer tu contraseña.
        </Alert>
      )}

      <Form action={action} class="space-y-4">
        <Input
          name="email"
          type="email"
          label="Email"
          placeholder="tu@email.com"
          required
          error={action.value?.fieldErrors?.email?.[0]}
        />

        <Button type="submit" class="w-full" loading={action.isRunning}>
          Enviar enlace
        </Button>
      </Form>

      <p class="text-center text-sm text-neutral-600">
        <a href="/login" class="font-medium text-primary-600 hover:text-primary-700">
          Volver a iniciar sesión
        </a>
      </p>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Recuperar contraseña - Onucall',
};
