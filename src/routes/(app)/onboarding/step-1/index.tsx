/**
 * Onboarding Step 1 - Nombre de empresa + Slug
 * El slug se auto-genera desde el nombre (kebab-case)
 */

import { component$, useSignal, useTask$, $ } from '@builder.io/qwik';
import { type DocumentHead, routeAction$, zod$, Form } from '@builder.io/qwik-city';
import { Button, Input, Alert } from '~/components/ui';
import { OnboardingProgress } from '~/components/onboarding/onboarding-progress';
import { OnboardingStep1Schema } from '~/lib/schemas/onboarding.schemas';
import { OrganizationService } from '~/lib/services/organization.service';

// Action: Validar nombre y slug, avanzar al paso 2
export const useStep1Action = routeAction$(
  async (data, requestEvent) => {
    // Verificar disponibilidad del slug
    const available = await OrganizationService.isSlugAvailable(data.organizationSlug);
    if (!available) {
      return requestEvent.fail(400, {
        message: 'Este identificador ya está en uso. Prueba con otro.',
      });
    }

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
  const orgName = useSignal('');
  const slug = useSignal('');

  // Auto-generar slug a partir del nombre (kebab-case)
  const updateSlug = $((name: string) => {
    slug.value = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // quitar acentos
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  });

  // Sincronizar slug cuando cambia el nombre
  useTask$(({ track }) => {
    const name = track(() => orgName.value);
    updateSlug(name);
  });

  return (
    <div class="space-y-8">
      <OnboardingProgress currentStep={1} />

      <div class="rounded-xl bg-white p-8 shadow-md">
        <div class="mb-6">
          <h1 class="text-xl font-bold text-neutral-900">¿Cómo se llama tu empresa?</h1>
          <p class="mt-1 text-sm text-neutral-600">
            Este será el nombre de tu workspace en Onucall
          </p>
        </div>

        {action.value?.failed && (
          <Alert variant="error" class="mb-4">{action.value.message}</Alert>
        )}

        <Form action={action} class="space-y-4">
          <div>
            <Input
              name="organizationName"
              type="text"
              label="Nombre de la empresa"
              placeholder="Mi Empresa S.A."
              required
              value={orgName.value}
              onInput$={(e: Event) => {
                const target = e.target as HTMLInputElement;
                orgName.value = target.value;
              }}
              error={action.value?.fieldErrors?.organizationName?.[0]}
            />
          </div>

          <div>
            <Input
              name="organizationSlug"
              type="text"
              label="Identificador único (URL)"
              placeholder="mi-empresa"
              required
              value={slug.value}
              onInput$={(e: Event) => {
                const target = e.target as HTMLInputElement;
                slug.value = target.value;
              }}
              error={action.value?.fieldErrors?.organizationSlug?.[0]}
            />
            <p class="mt-1 text-xs text-neutral-400">
              app.onucall.com/<strong>{slug.value || 'tu-empresa'}</strong>
            </p>
          </div>

          <div class="flex justify-end pt-4">
            <Button type="submit" loading={action.isRunning}>
              Siguiente
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Paso 1: Tu empresa - Onucall',
};
