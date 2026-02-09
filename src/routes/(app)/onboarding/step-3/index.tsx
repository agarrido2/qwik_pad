/**
 * Onboarding Step 3 - Confirmación y creación de workspace
 * Lee datos de pasos 1 y 2, ejecuta completeOnboarding y redirige al dashboard
 */

import { component$ } from '@builder.io/qwik';
import {
  type DocumentHead,
  routeAction$,
  routeLoader$,
  zod$,
  Form,
} from '@builder.io/qwik-city';
import { Button, Alert, Card, CardContent, CardHeader, CardTitle } from '~/components/ui';
import { OnboardingProgress } from '~/components/onboarding/onboarding-progress';
import { OnboardingStep3Schema } from '~/lib/schemas/onboarding.schemas';
import { OnboardingService } from '~/lib/services/onboarding.service';
import { getAuthGuardData } from '~/lib/auth/auth-guard';
import type { IndustrySlug } from '~/lib/utils/demo-data-templates';

// Verificar que se llega con datos de pasos 1 y 2
export const useOnboardingSummary = routeLoader$(async (requestEvent) => {
  const step1Cookie = requestEvent.cookie.get('onboarding_step1');
  const step2Cookie = requestEvent.cookie.get('onboarding_step2');

  if (!step1Cookie) throw requestEvent.redirect(302, '/onboarding/step-1');
  if (!step2Cookie) throw requestEvent.redirect(302, '/onboarding/step-2');

  const step1 = JSON.parse(step1Cookie.value) as {
    organizationName: string;
    organizationSlug: string;
  };
  const step2 = JSON.parse(step2Cookie.value) as {
    industrySlug: string;
  };

  // Mapeo de slugs a nombres legibles
  const industryNames: Record<string, string> = {
    concesionario: 'Concesionario de Autos',
    inmobiliaria: 'Inmobiliaria',
    alquiladora: 'Alquiladora de Vehículos',
    despacho: 'Despacho Profesional',
    retail: 'Retail / Comercio',
    sat: 'Servicio Técnico (SAT)',
    clinica: 'Clínica / Salud',
  };

  return {
    organizationName: step1.organizationName,
    organizationSlug: step1.organizationSlug,
    industrySlug: step2.industrySlug,
    industryName: industryNames[step2.industrySlug] ?? step2.industrySlug,
  };
});

// Action: Finalizar onboarding → crear org + demo data → dashboard
export const useCompleteOnboardingAction = routeAction$(
  async (_data, requestEvent) => {
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
        organizationName: step1.organizationName,
        organizationSlug: step1.organizationSlug,
        industrySlug: step2.industrySlug as IndustrySlug,
      });

      // Limpiar cookies de onboarding
      requestEvent.cookie.delete('onboarding_step1', { path: '/' });
      requestEvent.cookie.delete('onboarding_step2', { path: '/' });

      throw requestEvent.redirect(302, '/dashboard');
    } catch (err: any) {
      if (err?.status === 302) throw err;
      return requestEvent.fail(500, { message: err.message || 'Error al crear tu workspace' });
    }
  },
  zod$(OnboardingStep3Schema),
);

export default component$(() => {
  const summary = useOnboardingSummary();
  const action = useCompleteOnboardingAction();

  return (
    <div class="space-y-8">
      <OnboardingProgress currentStep={3} />

      <div class="rounded-xl bg-white p-8 shadow-md">
        <div class="mb-6">
          <h1 class="text-xl font-bold text-neutral-900">Todo listo para empezar</h1>
          <p class="mt-1 text-sm text-neutral-600">
            Revisa tus datos y crearemos tu workspace con datos de demostración
          </p>
        </div>

        {action.value?.failed && (
          <Alert variant="error" class="mb-4">{action.value.message}</Alert>
        )}

        {/* Resumen */}
        <Card class="mb-6">
          <CardHeader>
            <CardTitle>Resumen de tu workspace</CardTitle>
          </CardHeader>
          <CardContent>
            <dl class="space-y-3 text-sm">
              <div class="flex justify-between">
                <dt class="font-medium text-neutral-500">Empresa</dt>
                <dd class="text-neutral-900">{summary.value.organizationName}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="font-medium text-neutral-500">URL</dt>
                <dd class="text-neutral-900">
                  app.onucall.com/<strong>{summary.value.organizationSlug}</strong>
                </dd>
              </div>
              <div class="flex justify-between">
                <dt class="font-medium text-neutral-500">Sector</dt>
                <dd class="text-neutral-900">{summary.value.industryName}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Features incluidos */}
        <div class="mb-6 rounded-lg bg-primary-50 p-4">
          <p class="mb-2 text-sm font-semibold text-primary-900">
            Tu plan Free incluye:
          </p>
          <ul class="space-y-1 text-sm text-primary-800">
            <li class="flex items-center gap-2">
              <span class="text-primary-600" aria-hidden="true">✓</span>
              Datos demo personalizados para tu sector
            </li>
            <li class="flex items-center gap-2">
              <span class="text-primary-600" aria-hidden="true">✓</span>
              1 agente de voz preconfigurado
            </li>
            <li class="flex items-center gap-2">
              <span class="text-primary-600" aria-hidden="true">✓</span>
              50 llamadas de prueba al mes
            </li>
            <li class="flex items-center gap-2">
              <span class="text-primary-600" aria-hidden="true">✓</span>
              Dashboard con métricas básicas
            </li>
          </ul>
        </div>

        <Form action={action}>
          <input type="hidden" name="confirmed" value="true" />

          <div class="flex justify-between pt-4">
            <a
              href="/onboarding/step-2"
              class="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900"
            >
              ← Atrás
            </a>
            <Button type="submit" loading={action.isRunning}>
              🚀 Crear mi workspace
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Paso 3: Confirmar - Onucall',
};
