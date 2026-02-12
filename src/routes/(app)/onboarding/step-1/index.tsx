/**
 * Onboarding Step 1 - Identidad Corporativa
 * - Nombre Completo
 * - Nombre del Negocio
 * - Teléfono
 */

import { component$ } from '@builder.io/qwik';
import { type DocumentHead, routeAction$, zod$, Form } from '@builder.io/qwik-city';
import { Button, Input, Alert, Spinner } from '~/components/ui';
import { OnboardingProgress } from '~/components/onboarding/onboarding-progress';
import { OnboardingStep1Schema } from '~/lib/schemas/onboarding.schemas';

// Action: Validar y guardar datos del paso 1
export const useStep1Action = routeAction$(
  async (data, requestEvent) => {
    // Guardar en cookie temporal para persistir entre pasos
    requestEvent.cookie.set('onboarding_step1', JSON.stringify(data), {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 3600, // 1 hora
    });

    throw requestEvent.redirect(302, '/onboarding/step-2');
  },
  zod$(OnboardingStep1Schema),
);

export default component$(() => {
  const action = useStep1Action();

  return (
    <div class="space-y-8">
      <OnboardingProgress currentStep={1} />

      <div class="rounded-xl bg-white p-8 shadow-md">
        <div class="mb-6">
          <h1 class="text-xl font-bold text-neutral-900">Identidad Corporativa</h1>
          <p class="mt-1 text-sm text-neutral-600">
            Cuéntanos sobre ti y tu negocio
          </p>
        </div>

        {action.value?.failed && action.value?.formErrors?.length > 0 && (
          <Alert variant="error" class="mb-4">{action.value.formErrors[0]}</Alert>
        )}

        <Form action={action} class="space-y-4">
          <Input
            name="fullName"
            type="text"
            label="Nombre Completo"
            placeholder="Juan Pérez García"
            required
            error={action.value?.fieldErrors?.fullName?.[0]}
            helperText="Mínimo 5 caracteres, máximo 50"
          />

          <Input
            name="organizationName"
            type="text"
            label="Nombre del Negocio"
            placeholder="Mi Empresa S.A."
            required
            error={action.value?.fieldErrors?.organizationName?.[0]}
            helperText="Mínimo 3 caracteres, máximo 100"
          />

          <Input
            name="phone"
            type="tel"
            label="Teléfono"
            placeholder="+34 919 123 456"
            required
            error={action.value?.fieldErrors?.phone?.[0]}
            helperText="Formato: +34 919 123 456 o similar"
          />

          <div class="flex justify-end pt-4">
            <Button type="submit" disabled={action.isRunning}>
              {action.isRunning && <Spinner size="sm" />}
              Continuar →
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Paso 1: Identidad Corporativa - Onucall',
  meta: [
    {
      name: 'description',
      content: 'Configura la identidad de tu negocio: nombre completo, nombre de la empresa y teléfono de contacto para tu asistente de voz IA.',
    },
  ],
};
