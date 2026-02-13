/**
 * Demo Widget Component (v1 - Email Verification Flow)
 * @description Formulario de solicitud de demo con verificación por email en 2 pasos
 * 
 * Flujo:
 * 1. Usuario llena formulario → Envía request → Recibe email con código
 * 2. Usuario ingresa código → Sistema verifica → Dispara llamada Retell
 * 
 * Estados:
 * - 'form': Formulario inicial (default)
 * - 'verification': Modal de código (después de Step 1 success)
 * - 'success': Modal de éxito (después de Step 2 success)
 */

import { component$, useSignal, useVisibleTask$, $ } from '@builder.io/qwik';
import { Form } from '@builder.io/qwik-city';
import { SECTOR_LABELS } from '../data/agents';
import { VerificationModal } from './VerificationModal';

interface DemoWidgetProps {
  requestAction: any; // ActionStore de useDemoRequestAction (Step 1)
  verifyAction: any; // ActionStore de useVerifyCodeAction (Step 2)
}

export const DemoWidget = component$<DemoWidgetProps>(
  ({ requestAction, verifyAction }) => {
    // Lista de industrias para el selector
    const industries = Object.entries(SECTOR_LABELS);
    
    // Estado del flujo: 'form' | 'verification' | 'success'
    const flowState = useSignal<'form' | 'verification' | 'success'>('form');

    // Email del usuario (necesario para Step 2)
    const userEmail = useSignal('');

    // Estado para modal de éxito final
    const successCountdown = useSignal(5);

    // Refs
    const formRef = useSignal<HTMLFormElement>();

    /**
     * Resetear flujo completo
     */
    const resetFlow = $(() => {
      console.log('[DemoWidget] Reseteando flujo');
      flowState.value = 'form';
      userEmail.value = '';
      formRef.value?.reset();
      requestAction.value = undefined;
      verifyAction.value = undefined;
    });

    /**
     * Handler para cancelar verificación
     */
    const handleCancelVerification = $(() => {
      console.log('[DemoWidget] Cancelando verificación');
      flowState.value = 'form';
      userEmail.value = '';
      verifyAction.value = undefined;
    });

    /**
     * Detectar éxito en Step 1 (email enviado) → Mostrar modal de verificación
     */
    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(({ track }) => {
      const value = track(() => requestAction.value);

      if (value?.success && value.email) {
        console.log('[DemoWidget] Step 1 success, mostrando modal de verificación');
        userEmail.value = value.email;
        flowState.value = 'verification';
      }
    });

    /**
     * Detectar éxito en Step 2 (código verificado + llamada disparada) → Mostrar modal de éxito
     */
    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(({ track }) => {
      const value = track(() => verifyAction.value);

      if (value?.success) {
        console.log('[DemoWidget] Step 2 success, mostrando modal de éxito');
        flowState.value = 'success';
        successCountdown.value = 5;

        // Countdown de 5 segundos para cerrar y resetear
        const interval = setInterval(() => {
          successCountdown.value--;
          if (successCountdown.value <= 0) {
            clearInterval(interval);
            resetFlow();
          }
        }, 1000);

        return () => clearInterval(interval);
      }
    });

    /**
     * Handler para reenviar código (Step 1 nuevamente)
     */
    const handleResendCode = $(() => {
      console.log('[DemoWidget] Reenviando código');
      // Trigger submit del formulario original
      formRef.value?.requestSubmit();
    });

  return (
    <>
      {/* ========== FORMULARIO FIJO EN LANDING ========== */}
      <div class="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
        <div class="mb-6 text-center">
          <h3 class="text-2xl font-bold text-gray-900">
            Prueba nuestra IA ahora
          </h3>
          <p class="mt-2 text-gray-600">
            Recibe una llamada de demostración en menos de 30 segundos
          </p>
        </div>

        {/* Formulario - siempre visible */}
        <Form ref={formRef} action={requestAction} class="space-y-4">
          {/* Nombre */}
          <div>
            <label
              for="demo-name"
              class="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Nombre completo
            </label>
            <input
              id="demo-name"
              type="text"
              name="name"
              placeholder="Tu nombre"
              required
              class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            {requestAction.value?.fieldErrors?.name && (
              <p class="mt-1 text-sm text-red-600">
                {requestAction.value.fieldErrors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              for="demo-email"
              class="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="demo-email"
              type="email"
              name="email"
              placeholder="tu@empresa.com"
              required
              class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            {requestAction.value?.fieldErrors?.email && (
              <p class="mt-1 text-sm text-red-600">
                {requestAction.value.fieldErrors.email}
              </p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label
              for="demo-phone"
              class="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Teléfono
            </label>
            <input
              id="demo-phone"
              type="tel"
              name="phone"
              placeholder="+34612345678"
              required
              class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            {requestAction.value?.fieldErrors?.phone && (
              <p class="mt-1 text-sm text-red-600">
                {requestAction.value.fieldErrors.phone}
              </p>
            )}
            <p class="mt-1 text-xs text-gray-500">
              Formato internacional (ej: +34612345678)
            </p>
          </div>

          {/* Industria */}
          <div>
            <label
              for="demo-industry"
              class="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Sector de tu empresa
            </label>
            <select
              id="demo-industry"
              name="industry"
              required
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Selecciona una industria</option>
              {industries.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {requestAction.value?.fieldErrors?.industry && (
              <p class="mt-1 text-sm text-red-600">
                {requestAction.value.fieldErrors.industry}
              </p>
            )}
          </div>

          {/* Términos y condiciones */}
          <div class="flex items-start gap-2">
            <input
              id="demo-terms"
              type="checkbox"
              name="acceptTerms"
              value="true"
              required
              class="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label for="demo-terms" class="text-sm text-gray-600">
              Acepto los{' '}
              <a href="/terms" class="text-blue-600 hover:underline">
                términos y condiciones
              </a>{' '}
              y la{' '}
              <a href="/privacy" class="text-blue-600 hover:underline">
                política de privacidad
              </a>
            </label>
          </div>
          {requestAction.value?.fieldErrors?.acceptTerms && (
            <p class="text-sm text-red-600">
              {requestAction.value.fieldErrors.acceptTerms}
            </p>
          )}

          {/* Error general */}
          {requestAction.value &&
            !requestAction.value.success &&
            requestAction.value.message && (
              <div
                role="alert"
                class="rounded-lg bg-red-50 p-3 text-sm text-red-600"
              >
                {requestAction.value.message}
              </div>
            )}

          {/* Submit */}
          <button
            type="submit"
            disabled={requestAction.isRunning}
            class="w-full rounded-lg bg-blue-600 px-4 py-3 text-center font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {requestAction.isRunning ? (
              <span class="flex items-center justify-center gap-2">
                <svg
                  class="h-5 w-5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Enviando código...
              </span>
            ) : (
              '📧 Enviar código de verificación'
            )}
          </button>

          <p class="text-center text-xs text-gray-500">
            Máximo 2 demos por email al mes
          </p>
        </Form>
      </div>

      {/* ========== MODAL DE VERIFICACIÓN (Step 2) ========== */}
        {flowState.value === 'verification' && userEmail.value && (
          <VerificationModal
            email={userEmail.value}
            action={verifyAction}
            onCancel$={handleCancelVerification}
            onResend$={handleResendCode}
          />
        )}

        {/* ========== MODAL DE ÉXITO (Post Step 2) ========== */}
        {flowState.value === 'success' && (
          <div
            class="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="success-modal-title"
          >
            {/* Overlay oscuro */}
            <div
              class="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick$={resetFlow}
              aria-hidden="true"
            />

            {/* Card informativa */}
            <div class="relative z-10 w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
              {/* Botón cerrar */}
              <button
                type="button"
                onClick$={resetFlow}
                class="absolute right-3 top-3 text-gray-400 transition-colors hover:text-gray-600"
                aria-label="Cerrar"
              >
                <svg
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Icono teléfono */}
              <div class="mb-4 text-6xl">📞</div>

              <h3
                id="success-modal-title"
                class="mb-2 text-2xl font-bold text-gray-900"
              >
                ¡Llamada en camino!
              </h3>

              <p class="mb-2 font-medium text-green-800">
                {verifyAction.value?.message ||
                  'Tu solicitud ha sido procesada correctamente'}
              </p>

              <p class="mb-6 text-sm text-green-600">
                Mantén tu teléfono cerca. Recibirás la llamada en los próximos
                10-15 segundos.
              </p>

              {/* Countdown */}
              <div class="flex items-center justify-center gap-2 text-sm text-gray-500">
                <svg
                  class="h-4 w-4 animate-pulse"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Cerrando en {successCountdown.value}s...</span>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
);