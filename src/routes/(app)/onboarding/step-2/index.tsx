/**
 * Onboarding Step 2 - Selección de industria/sector
 * Lee datos del paso 1 desde cookie, permite elegir sector
 */

import { component$, useSignal } from '@builder.io/qwik';
import {
  type DocumentHead,
  routeAction$,
  routeLoader$,
  zod$,
  Form,
} from '@builder.io/qwik-city';
import { Button, Alert } from '~/components/ui';
import { OnboardingProgress } from '~/components/onboarding/onboarding-progress';
import { IndustrySelector, type IndustryOption } from '~/components/onboarding/industry-selector';
import { OnboardingStep2Schema } from '~/lib/schemas/onboarding.schemas';
import { db } from '~/lib/db';
import { industryTypes } from '~/lib/db/schema';

// Cargar industrias disponibles desde DB
export const useIndustries = routeLoader$(async () => {
  const industries = await db
    .select({
      slug: industryTypes.slug,
      name: industryTypes.name,
      description: industryTypes.description,
      icon: industryTypes.icon,
    })
    .from(industryTypes);

  return industries as IndustryOption[];
});

// Verificar que el paso 1 se completó
export const useCheckStep1 = routeLoader$(async (requestEvent) => {
  const step1Cookie = requestEvent.cookie.get('onboarding_step1');
  if (!step1Cookie) {
    throw requestEvent.redirect(302, '/onboarding/step-1');
  }
  return JSON.parse(step1Cookie.value) as {
    organizationName: string;
    organizationSlug: string;
  };
});

// Action: Guardar industria seleccionada y avanzar al paso 3
export const useStep2Action = routeAction$(
  async (data, requestEvent) => {
    // Guardar selección en cookie
    requestEvent.cookie.set('onboarding_step2', JSON.stringify(data), {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 3600,
    });

    throw requestEvent.redirect(302, '/onboarding/step-3');
  },
  zod$(OnboardingStep2Schema),
);

export default component$(() => {
  const industries = useIndustries();
  const step1Data = useCheckStep1();
  const action = useStep2Action();
  const selectedIndustry = useSignal('');

  return (
    <div class="space-y-8">
      <OnboardingProgress currentStep={2} />

      <div class="rounded-xl bg-white p-8 shadow-md">
        <div class="mb-6">
          <h1 class="text-xl font-bold text-neutral-900">¿En qué sector opera {step1Data.value.organizationName}?</h1>
          <p class="mt-1 text-sm text-neutral-600">
            Configuraremos tu asistente de voz con plantillas especializadas para tu sector
          </p>
        </div>

        {action.value?.failed && (
          <Alert variant="error" class="mb-4">
            {action.value?.fieldErrors?.industrySlug?.[0] || 'Selecciona un sector'}
          </Alert>
        )}

        <Form action={action} class="space-y-6">
          {/* Hidden input que se actualiza con la selección */}
          <input type="hidden" name="industrySlug" value={selectedIndustry.value} />

          <IndustrySelector
            industries={industries.value}
            selectedSlug={selectedIndustry.value}
            onSelect$={(slug: string) => {
              selectedIndustry.value = slug;
            }}
          />

          <div class="flex justify-between pt-4">
            <a
              href="/onboarding/step-1"
              class="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900"
            >
              ← Atrás
            </a>
            <Button
              type="submit"
              loading={action.isRunning}
              disabled={!selectedIndustry.value}
            >
              Siguiente
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Paso 2: Tu sector - Onucall',
};
