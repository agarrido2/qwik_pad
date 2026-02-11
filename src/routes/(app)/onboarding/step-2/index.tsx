/**
 * Onboarding Step 2 - Reglas del Negocio
 * - Sector
 * - Descripción del negocio
 */

import { component$, useSignal } from '@builder.io/qwik';
import {
  type DocumentHead,
  routeAction$,
  routeLoader$,
  zod$,
  Form,
} from '@builder.io/qwik-city';
import { Button, Alert, Select, type SelectOption } from '~/components/ui';
import { OnboardingProgress } from '~/components/onboarding/onboarding-progress';
import { OnboardingStep2Schema } from '~/lib/schemas/onboarding.schemas';
import { db } from '~/lib/db';
import { industryTypes } from '~/lib/db/schema';

// Cargar industrias disponibles desde DB y convertir a formato SelectOption
export const useIndustries = routeLoader$(async () => {
  const industries = await db
    .select({
      slug: industryTypes.slug,
      name: industryTypes.name,
      description: industryTypes.description,
      icon: industryTypes.icon,
    })
    .from(industryTypes);

  return industries.map(industry => ({
    value: industry.slug,
    label: industry.name,
    description: industry.description,
    icon: industry.icon,
  })) as SelectOption[];
});

// Verificar que el paso 1 se completó
export const useCheckStep1 = routeLoader$(async (requestEvent) => {
  const step1Cookie = requestEvent.cookie.get('onboarding_step1');
  if (!step1Cookie) {
    throw requestEvent.redirect(302, '/onboarding/step-1');
  }
  return JSON.parse(step1Cookie.value) as {
    fullName: string;
    organizationName: string;
    phone: string;
  };
});

// Action: Guardar sector y descripción, avanzar al paso 3
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
  const description = useSignal('');

  return (
    <div class="space-y-8">
      <OnboardingProgress currentStep={2} />

      <div class="rounded-xl bg-white p-8 shadow-md">
        <div class="mb-6">
          <h1 class="text-xl font-bold text-neutral-900">Reglas del Negocio</h1>
          <p class="mt-1 text-sm text-neutral-600">
            Ayúdanos a configurar tu asistente para {step1Data.value.organizationName}
          </p>
        </div>

        {action.value?.failed && (
          <Alert variant="error" class="mb-4">
            {action.value?.fieldErrors?.industrySlug?.[0] || 
             action.value?.fieldErrors?.businessDescription?.[0] || 
             'Completa todos los campos'}
          </Alert>
        )}

        <Form action={action} class="space-y-6">
          {/* Selector de Industria con componente Select */}
          <Select
            name="industrySlug"
            label="Sector de tu negocio"
            options={industries.value}
            value={selectedIndustry.value}
            onChange$={(value: string) => {
              selectedIndustry.value = value;
            }}
            placeholder="Selecciona el sector de tu negocio"
            required
            error={action.value?.fieldErrors?.industrySlug?.[0]}
          />

          {/* Descripción del Negocio */}
          <div>
            <label for="businessDescription" class="mb-2 block text-sm font-medium text-neutral-700">
              Descripción del negocio *
            </label>
            <textarea
              id="businessDescription"
              name="businessDescription"
              rows={5}
              class="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Describe tu negocio, servicios principales, horarios, etc. Esto ayudará al asistente a responder mejor a tus clientes."
              required
              value={description.value}
              onInput$={(e: Event) => {
                const target = e.target as HTMLTextAreaElement;
                description.value = target.value;
              }}
            />
            <p class="mt-1 text-xs text-neutral-500">
              {description.value.length}/500 caracteres (mínimo 20)
            </p>
          </div>

          <div class="flex justify-between pt-4">
            <a
              href="/onboarding/step-1"
              class="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900"
            >
              ← Atrás
            </a>
            <Button type="submit" loading={action.isRunning}>
              Continuar →
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Paso 2: Reglas del Negocio - Onucall',
};
