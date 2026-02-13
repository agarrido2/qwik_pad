/**
 * VerificationModal Component
 * @description Modal de verificación de código de 6 dígitos para confirmar email
 * 
 * Características:
 * - Input auto-formateado para 6 dígitos numéricos
 * - Auto-focus al montar
 * - Countdown para reenvío (60 segundos)
 * - Manejo de errores inline
 * - Integración con routeAction$ de Qwik City
 */

import { component$, useSignal, useVisibleTask$, $, type QRL } from '@builder.io/qwik';
import { Form } from '@builder.io/qwik-city';

interface VerificationModalProps {
  email: string;
  action: any; // ActionStore de useVerifyCodeAction
  onCancel$: QRL<() => void>;
  onResend$?: QRL<() => void>;
}

export const VerificationModal = component$<VerificationModalProps>(
  ({ email, action, onCancel$, onResend$ }) => {
    // Estado del input de código (6 dígitos)
    const codeValue = useSignal('');
    const inputRef = useSignal<HTMLInputElement>();
    
    // Countdown para botón de reenvío (60 segundos después de mostrar el modal)
    const resendCountdown = useSignal(60);
    const canResend = useSignal(false);

    /**
     * Auto-focus en el input al montar el componente
     * useVisibleTask$ se ejecuta solo en el cliente (O(1) hydration de Qwik)
     */
    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(() => {
      inputRef.value?.focus();
      
      // Iniciar countdown para habilitar reenvío
      const interval = setInterval(() => {
        if (resendCountdown.value > 0) {
          resendCountdown.value--;
        } else {
          canResend.value = true;
          clearInterval(interval);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    });

    /**
     * Handler para formatear input (solo números, máximo 6 dígitos)
     * QRL ($) para optimizar la serialización de Qwik
     */
    const handleCodeInput = $((event: Event) => {
      const input = event.target as HTMLInputElement;
      const value = input.value.replace(/\D/g, ''); // Solo dígitos
      codeValue.value = value.slice(0, 6); // Máximo 6
      input.value = codeValue.value;
    });

    /**
     * Handler para pegar código (extraer solo números)
     */
    const handlePaste = $((event: ClipboardEvent) => {
      event.preventDefault();
      const pastedText = event.clipboardData?.getData('text') || '';
      const digits = pastedText.replace(/\D/g, '').slice(0, 6);
      codeValue.value = digits;
      if (inputRef.value) {
        inputRef.value.value = digits;
      }
    });

    /**
     * Handler para reenviar código
     * Reinicia el countdown y llama al callback del parent
     */
    const handleResend = $(() => {
      if (canResend.value && onResend$) {
        resendCountdown.value = 60;
        canResend.value = false;
        onResend$();
      }
    });

    return (
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="verification-modal-title"
      >
        {/* Overlay oscuro con blur */}
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick$={onCancel$}
          aria-hidden="true"
        />

        {/* Card del modal */}
        <div class="relative z-10 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
          {/* Botón cerrar */}
          <button
            type="button"
            onClick$={onCancel$}
            class="absolute right-3 top-3 text-gray-400 transition-colors hover:text-gray-600"
            aria-label="Cerrar modal"
          >
            <svg
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Header */}
          <div class="mb-6 text-center">
            <div class="mb-4 text-5xl">📧</div>
            <h3
              id="verification-modal-title"
              class="text-2xl font-bold text-gray-900"
            >
              Verifica tu email
            </h3>
            <p class="mt-2 text-sm text-gray-600">
              Hemos enviado un código de 6 dígitos a:
            </p>
            <p class="mt-1 font-medium text-blue-600">{email}</p>
          </div>

          {/* Formulario de verificación */}
          <Form action={action} class="space-y-4">
            {/* Hidden email field (necesario para la validación en servidor) */}
            <input type="hidden" name="email" value={email} />

            {/* Input de código */}
            <div>
              <label
                for="verification-code"
                class="mb-2 block text-center text-sm font-medium text-gray-700"
              >
                Ingresa el código
              </label>
              <input
                ref={inputRef}
                id="verification-code"
                type="text"
                name="code"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                required
                onInput$={handleCodeInput}
                onPaste$={handlePaste}
                class="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-center text-2xl font-bold tracking-widest text-gray-900 placeholder:text-gray-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
              />
              {/* Mensajes de error del action */}
              {action.value?.fieldErrors?.code && (
                <p class="mt-2 text-center text-sm text-red-600">
                  {action.value.fieldErrors.code}
                </p>
              )}
            </div>

            {/* Mensaje de error general del servidor */}
            {action.value && !action.value.success && action.value.message && (
              <div
                role="alert"
                class="rounded-lg bg-red-50 p-3 text-sm text-red-600"
              >
                {action.value.message}
              </div>
            )}

            {/* Botón de submit */}
            <button
              type="submit"
              disabled={action.isRunning || codeValue.value.length !== 6}
              class="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {action.isRunning ? (
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
                  Verificando...
                </span>
              ) : (
                '✅ Verificar y recibir llamada'
              )}
            </button>

            {/* Botón de reenvío con countdown */}
            <div class="text-center">
              {canResend.value ? (
                <button
                  type="button"
                  onClick$={handleResend}
                  class="text-sm font-medium text-blue-600 hover:underline"
                >
                  Reenviar código
                </button>
              ) : (
                <p class="text-sm text-gray-500">
                  Reenviar código en {resendCountdown.value}s
                </p>
              )}
            </div>
          </Form>

          {/* Instrucciones adicionales */}
          <div class="mt-6 rounded-lg bg-blue-50 p-3 text-center">
            <p class="text-xs text-blue-800">
              💡 <strong>Consejo:</strong> Revisa tu carpeta de spam si no ves
              el email
            </p>
            <p class="mt-1 text-xs text-blue-600">
              El código expira en 10 minutos
            </p>
          </div>
        </div>
      </div>
    );
  }
);