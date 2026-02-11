/**
 * Onboarding Step 3 - Su Asistente
 * - Género (male/female)
 * - Nombre
 * - Nivel de amabilidad (1-5)
 * - Nivel de simpatía (1-5)
 */

import { component$, useSignal } from '@builder.io/qwik';
import {
  type DocumentHead,
  routeAction$,
  routeLoader$,
  zod$,
  Form,
} from '@builder.io/qwik-city';
import { Button, Input, Alert, Card, CardContent } from '~/components/ui';
import { OnboardingProgress } from '~/components/onboarding/onboarding-progress';
import { OnboardingStep3Schema } from '~/lib/schemas/onboarding.schemas';
import { OnboardingService } from '~/lib/services/onboarding.service';
import { getAuthGuardData } from '~/lib/auth/auth-guard';
import type { IndustrySlug } from '~/lib/utils/demo-data-templates';

// Verificar que los pasos 1 y 2 se completaron
export const useOnboardingSummary = routeLoader$(async (requestEvent) => {
  const step1Cookie = requestEvent.cookie.get('onboarding_step1');
  const step2Cookie = requestEvent.cookie.get('onboarding_step2');

  if (!step1Cookie) throw requestEvent.redirect(302, '/onboarding/step-1');
  if (!step2Cookie) throw requestEvent.redirect(302, '/onboarding/step-2');

  const step1 = JSON.parse(step1Cookie.value) as {
    fullName: string;
    organizationName: string;
    phone: string;
  };
  const step2 = JSON.parse(step2Cookie.value) as {
    industrySlug: string;
    businessDescription: string;
  };

  return {
    step1,
    step2,
  };
});

// Action: Finalizar onboarding
export const useCompleteOnboardingAction = routeAction$(
  async (data, requestEvent) => {
    const authData = await getAuthGuardData(requestEvent);
    if (!authData) {
      throw requestEvent.redirect(302, '/login');
    }

    const step1Cookie = requestEvent.cookie.get('onboarding_step1');
    const step2Cookie = requestEvent.cookie.get('onboarding_step2');

    if (!step1Cookie || !step2Cookie) {
      return requestEvent.fail(400, { message: 'Datos de onboarding incompletos' });
    }

    const step1 = JSON.parse(step1Cookie.value);
    const step2 = JSON.parse(step2Cookie.value);

    try {
      await OnboardingService.completeOnboarding(authData.authUser.id, {
        // Paso 1
        fullName: step1.fullName,
        organizationName: step1.organizationName,
        phone: step1.phone,
        // Paso 2
        industrySlug: step2.industrySlug as IndustrySlug,
        businessDescription: step2.businessDescription,
        // Paso 3
        assistantGender: data.assistantGender,
        assistantName: data.assistantName,
        assistantKindnessLevel: data.assistantKindnessLevel, // Ya es number gracias a z.coerce
        assistantFriendlinessLevel: data.assistantFriendlinessLevel, // Ya es number gracias a z.coerce
      });

      // Limpiar cookies
      requestEvent.cookie.delete('onboarding_step1', { path: '/' });
      requestEvent.cookie.delete('onboarding_step2', { path: '/' });

      throw requestEvent.redirect(302, '/dashboard');
    } catch (err: any) {
      // Si es un redirect, lanzarlo (éxito)
      if (err?.status === 302) throw err;
      
      // Log del error para debugging
      console.error('Error en onboarding:', err);
      
      // Retornar mensaje de error descriptivo
      const errorMessage = err.message || 'Error desconocido al crear tu workspace. Contacta con soporte.';
      return requestEvent.fail(500, { message: errorMessage });
    }
  },
  zod$(OnboardingStep3Schema),
);

export default component$(() => {
  const summary = useOnboardingSummary();
  const action = useCompleteOnboardingAction();
  
  const gender = useSignal<'male' | 'female'>('female');
  const kindness = useSignal(3);
  const friendliness = useSignal(3);

  return (
    <div class="space-y-8">
      <OnboardingProgress currentStep={3} />

      <div class="rounded-xl bg-white p-8 shadow-md">
        <div class="mb-6">
          <h1 class="text-xl font-bold text-neutral-900">Su Asistente</h1>
          <p class="mt-1 text-sm text-neutral-600">
            Personaliza la voz que atenderá a tus clientes
          </p>
        </div>

        {action.value?.failed && (
          <Alert variant="error" class="mb-4">
            {action.value.message || 
             action.value?.fieldErrors?.assistantGender?.[0] ||
             action.value?.fieldErrors?.assistantName?.[0] ||
             action.value?.fieldErrors?.assistantKindnessLevel?.[0] ||
             action.value?.fieldErrors?.assistantFriendlinessLevel?.[0] ||
             'Ha ocurrido un error al finalizar la configuración. Por favor, revisa los campos e inténtalo de nuevo.'}
          </Alert>
        )}

        <Form action={action} class="space-y-6">
          {/* Género del Asistente */}
          <div>
            <label class="mb-3 block text-sm font-medium text-neutral-700">
              Género del asistente *
            </label>
            <div class="grid grid-cols-2 gap-4">
              <button
                type="button"
                class={`rounded-lg border-2 p-4 text-center transition-colors ${
                  gender.value === 'male'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-neutral-200 hover:border-primary-300'
                }`}
                onClick$={() => {
                  gender.value = 'male';
                }}
              >
                <div class="text-3xl mb-2">👨</div>
                <div class="font-medium">Hombre</div>
              </button>
              <button
                type="button"
                class={`rounded-lg border-2 p-4 text-center transition-colors ${
                  gender.value === 'female'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-neutral-200 hover:border-primary-300'
                }`}
                onClick$={() => {
                  gender.value = 'female';
                }}
              >
                <div class="text-3xl mb-2">👩</div>
                <div class="font-medium">Mujer</div>
              </button>
            </div>
            <input type="hidden" name="assistantGender" value={gender.value} />
            {action.value?.fieldErrors?.assistantGender?.[0] && (
              <p class="mt-2 text-sm text-error leading-relaxed" role="alert">
                {action.value.fieldErrors.assistantGender[0]}
              </p>
            )}
          </div>

          {/* Nombre del Asistente */}
          <Input
            name="assistantName"
            type="text"
            label="Nombre del asistente"
            placeholder="Ana, Carlos, María..."
            required
            error={action.value?.fieldErrors?.assistantName?.[0]}
            helperText="Mínimo 5 caracteres, máximo 50"
          />

          {/* Nivel de Amabilidad */}
          <div>
            <label class="mb-3 block text-sm font-medium text-neutral-700">
              Nivel de amabilidad *
            </label>
            <div class="flex items-center gap-4">
              <input
                type="range"
                name="assistantKindnessLevel"
                min="1"
                max="5"
                value={kindness.value}
                class="flex-1"
                onInput$={(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  kindness.value = Number(target.value);
                }}
              />
              <span class="w-12 text-center text-lg font-bold text-primary-600">
                {kindness.value}
              </span>
            </div>
            <div class="mt-2 flex justify-between text-xs text-neutral-500">
              <span>Profesional</span>
              <span>Muy amable</span>
            </div>
            {action.value?.fieldErrors?.assistantKindnessLevel?.[0] && (
              <p class="mt-1 text-sm text-error leading-relaxed" role="alert">
                {action.value.fieldErrors.assistantKindnessLevel[0]}
              </p>
            )}
          </div>

          {/* Nivel de Simpatía */}
          <div>
            <label class="mb-3 block text-sm font-medium text-neutral-700">
              Nivel de simpatía *
            </label>
            <div class="flex items-center gap-4">
              <input
                type="range"
                name="assistantFriendlinessLevel"
                min="1"
                max="5"
                value={friendliness.value}
                class="flex-1"
                onInput$={(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  friendliness.value = Number(target.value);
                }}
              />
              <span class="w-12 text-center text-lg font-bold text-primary-600">
                {friendliness.value}
              </span>
            {action.value?.fieldErrors?.assistantFriendlinessLevel?.[0] && (
              <p class="mt-1 text-sm text-error leading-relaxed" role="alert">
                {action.value.fieldErrors.assistantFriendlinessLevel[0]}
              </p>
            )}
            </div>
            <div class="mt-2 flex justify-between text-xs text-neutral-500">
              <span>Formal</span>
              <span>Muy simpático</span>
            </div>
          </div>

          {/* Resumen */}
          <Card class="bg-neutral-50">
            <CardContent class="pt-6">
              <h3 class="mb-3 text-sm font-semibold text-neutral-700">Resumen de configuración</h3>
              <dl class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <dt class="text-neutral-500">Empresa:</dt>
                  <dd class="font-medium text-neutral-900">{summary.value.step1.organizationName}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-neutral-500">Sector:</dt>
                  <dd class="font-medium text-neutral-900">{summary.value.step2.industrySlug}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <div class="flex justify-between pt-4">
            <a
              href="/onboarding/step-2"
              class="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900"
            >
              ← Atrás
            </a>
            <Button type="submit" loading={action.isRunning}>
              🚀 Finalizar configuración
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Paso 3: Su Asistente - Onucall',
};
