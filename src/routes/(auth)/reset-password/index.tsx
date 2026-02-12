/**
 * Reset Password - Establecer nueva contraseña (tras click en email)
 */

import { component$ } from '@builder.io/qwik';
import { type DocumentHead, routeAction$, zod$, z, Form } from '@builder.io/qwik-city';
import { Button, Input, Alert, Spinner } from '~/components/ui';
import { createServerSupabaseClient } from '~/lib/supabase/client.server';

export const useResetPasswordAction = routeAction$(
  async (data, requestEvent) => {
    // Validar que las contraseñas coincidan (zod$ no soporta .refine())
    if (data.password !== data.confirmPassword) {
      return requestEvent.fail(400, { message: 'Las contraseñas no coinciden' });
    }

    const supabase = createServerSupabaseClient(requestEvent);

    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      return requestEvent.fail(400, { message: error.message });
    }

    throw requestEvent.redirect(302, '/dashboard');
  },
  zod$({
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string().min(6, 'Mínimo 6 caracteres'),
  }),
);

export default component$(() => {
  const action = useResetPasswordAction();

  return (
    <div class="space-y-6">
      <div class="text-center">
        <h1 class="text-2xl font-bold text-neutral-900">Nueva contraseña</h1>
        <p class="mt-2 text-sm text-neutral-600">
          Establece tu nueva contraseña
        </p>
      </div>

      {action.value?.failed && (
        <Alert variant="error">{action.value.message}</Alert>
      )}

      <Form action={action} class="space-y-4">
        <Input
          name="password"
          type="password"
          label="Nueva contraseña"
          placeholder="Mínimo 6 caracteres"
          required
          error={action.value?.fieldErrors?.password?.[0]}
        />
        <Input
          name="confirmPassword"
          type="password"
          label="Confirmar contraseña"
          placeholder="Repite la contraseña"
          required
          error={action.value?.fieldErrors?.confirmPassword?.[0]}
        />

        <Button type="submit" class="w-full" disabled={action.isRunning}>
          {action.isRunning && <Spinner size="sm" />}
          Guardar contraseña
        </Button>
      </Form>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Nueva contraseña - Onucall',
};
