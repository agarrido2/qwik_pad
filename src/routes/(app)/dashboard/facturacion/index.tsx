/**
 * Facturación - Gestión de suscripción y pagos
 * 
 * Features:
 * - Ver plan actual y estado
 * - Upgrade/Downgrade de plan
 * - Gestión de métodos de pago
 * - Historial de facturas
 * 
 * Protected: requireOwnerRole (layout.tsx)
 * 
 * Nota: Esta es una implementación básica placeholder.
 * La integración completa con Stripe se implementará en futuras iteraciones.
 */

import { component$ } from '@builder.io/qwik';
import { type DocumentHead, routeLoader$ } from '@builder.io/qwik-city';
import { Card, CardContent, CardHeader, CardTitle, Button, Alert } from '~/components/ui';
import { AuthService } from '~/lib/services/auth.service';
import { cn } from '~/lib/utils/cn';

// ============================================================================
// TYPES
// ============================================================================

type SubscriptionTier = 'free' | 'starter' | 'pro' | 'enterprise';

interface Plan {
  tier: SubscriptionTier;
  name: string;
  price: number;
  features: string[];
  recommended?: boolean;
  current?: boolean;
}

// ============================================================================
// LOADER
// ============================================================================

/**
 * Loader: Obtiene información de suscripción del usuario
 * En producción, esto consultará Stripe API
 */
export const useSubscriptionLoader = routeLoader$(async (requestEvent) => {
  const authUser = await AuthService.getAuthUser(requestEvent);
  if (!authUser) {
    throw requestEvent.redirect(302, '/login');
  }

  // TODO: Integrar con Stripe API para obtener datos reales
  // Por ahora retornamos datos mock basados en el schema
  return {
    currentTier: 'free' as SubscriptionTier,
    status: 'active' as const,
    billingEmail: authUser.email,
    nextBillingDate: null,
    lastPayment: null,
  };
});

// ============================================================================
// CONSTANTS
// ============================================================================

const PLANS: Plan[] = [
  {
    tier: 'free',
    name: 'Free',
    price: 0,
    features: [
      'Modo demo',
      'Datos de demostración',
      'Sin número real',
      'Acceso limitado',
    ],
  },
  {
    tier: 'starter',
    name: 'Starter',
    price: 49,
    recommended: true,
    features: [
      '1 número de teléfono',
      'Agente básico Retell AI',
      '500 minutos/mes',
      'Soporte por email',
    ],
  },
  {
    tier: 'pro',
    name: 'Pro',
    price: 149,
    features: [
      'Múltiples números',
      'Integraciones CRM/Agenda',
      '2000 minutos/mes',
      'Soporte prioritario',
    ],
  },
  {
    tier: 'enterprise',
    name: 'Enterprise',
    price: 499,
    features: [
      'Números ilimitados',
      'Soporte dedicado',
      'Minutos ilimitados',
      'SLA garantizado',
    ],
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default component$(() => {
  const subscription = useSubscriptionLoader();

  const currentPlan = PLANS.find((p) => p.tier === subscription.value.currentTier);

  return (
    <div class="space-y-6">
      {/* Header */}
      <div>
        <h1 class="text-2xl font-bold text-neutral-900">Facturación y Suscripción</h1>
        <p class="mt-1 text-sm text-neutral-600">
          Gestiona tu plan, métodos de pago y revisa tu historial de facturas
        </p>
      </div>

      {/* Banner informativo */}
      <Alert variant="info" title="Integración en desarrollo">
        Esta página está en fase de desarrollo. La integración con Stripe para gestionar pagos
        se implementará próximamente. Por ahora puedes revisar los planes disponibles.
      </Alert>

      {/* Plan actual */}
      <Card>
        <CardHeader>
          <CardTitle>Tu Plan Actual</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex items-start justify-between">
            <div>
              <div class="flex items-center gap-3">
                <h3 class="text-2xl font-bold text-neutral-900">
                  {currentPlan?.name || 'Free'}
                </h3>
                <span class="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Activo
                </span>
              </div>
              <p class="mt-2 text-3xl font-bold text-neutral-900">
                ${currentPlan?.price || 0}
                <span class="text-base font-normal text-neutral-600">/mes</span>
              </p>
              <p class="mt-2 text-sm text-neutral-600">
                Email de facturación: <strong>{subscription.value.billingEmail}</strong>
              </p>
            </div>
            {subscription.value.currentTier === 'free' && (
              <Button disabled>
                <svg
                  class="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
                Mejorar Plan
              </Button>
            )}
          </div>

          {/* Features del plan actual */}
          <div class="mt-6 pt-6 border-t border-neutral-200">
            <h4 class="text-sm font-medium text-neutral-700 mb-3">
              Incluido en tu plan:
            </h4>
            <ul class="space-y-2">
              {currentPlan?.features.map((feature) => (
                <li key={feature} class="flex items-start gap-2 text-sm text-neutral-600">
                  <svg
                    class="h-5 w-5 text-green-500 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Planes disponibles */}
      <div>
        <h2 class="text-xl font-bold text-neutral-900 mb-4">Planes Disponibles</h2>
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => (
            <Card
              key={plan.tier}
              class={cn(
                'relative',
                plan.tier === subscription.value.currentTier && 'ring-2 ring-primary-500'
              )}
            >
              {plan.recommended && (
                <div class="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span class="px-3 py-1 rounded-full text-xs font-medium bg-primary-600 text-white">
                    Recomendado
                  </span>
                </div>
              )}

              <CardHeader>
                <CardTitle class="text-lg">{plan.name}</CardTitle>
                <p class="text-3xl font-bold text-neutral-900 mt-2">
                  ${plan.price}
                  <span class="text-sm font-normal text-neutral-600">/mes</span>
                </p>
              </CardHeader>
              <CardContent>
                <ul class="space-y-2 mb-4">
                  {plan.features.map((feature) => (
                    <li key={feature} class="flex items-start gap-2 text-sm text-neutral-600">
                      <svg
                        class="h-4 w-4 text-primary-500 flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {plan.tier === subscription.value.currentTier ? (
                  <Button variant="outline" disabled class="w-full">
                    Plan Actual
                  </Button>
                ) : plan.tier === 'free' ? (
                  <Button variant="outline" disabled class="w-full">
                    Downgrade
                  </Button>
                ) : (
                  <Button disabled class="w-full">
                    Seleccionar
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Métodos de pago */}
      <Card>
        <CardHeader>
          <CardTitle>Métodos de Pago</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-center py-8">
            <svg
              class="mx-auto h-12 w-12 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-neutral-900">
              No hay métodos de pago configurados
            </h3>
            <p class="mt-1 text-sm text-neutral-500">
              Añade una tarjeta de crédito para activar planes de pago
            </p>
            <div class="mt-6">
              <Button disabled>
                <svg
                  class="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Añadir Método de Pago
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historial de facturas */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Facturas</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-center py-8">
            <svg
              class="mx-auto h-12 w-12 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-neutral-900">Sin facturas</h3>
            <p class="mt-1 text-sm text-neutral-500">
              El historial de pagos aparecerá aquí cuando actualices tu plan
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

// ============================================================================
// SEO
// ============================================================================

export const head: DocumentHead = {
  title: 'Facturación - Onucall',
  meta: [
    {
      name: 'description',
      content:
        'Gestiona tu suscripción, métodos de pago y revisa el historial de facturas de tu cuenta de Onucall.',
    },
    // Open Graph
    {
      property: 'og:title',
      content: 'Facturación - Onucall',
    },
    {
      property: 'og:description',
      content:
        'Gestiona tu suscripción, métodos de pago y revisa el historial de facturas de tu cuenta de Onucall.',
    },
    {
      property: 'og:type',
      content: 'website',
    },
    // Twitter Card
    {
      name: 'twitter:card',
      content: 'summary',
    },
    {
      name: 'twitter:title',
      content: 'Facturación - Onucall',
    },
    {
      name: 'twitter:description',
      content:
        'Gestiona tu suscripción, métodos de pago y revisa el historial de facturas de tu cuenta de Onucall.',
    },
  ],
  links: [
    {
      rel: 'canonical',
      href: 'https://onucall.com/dashboard/facturacion',
    },
  ],
};
