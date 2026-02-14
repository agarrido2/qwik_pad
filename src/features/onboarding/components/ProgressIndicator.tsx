/**
 * ProgressIndicator - Indicadores de paso del wizard de onboarding
 * 
 * 3 círculos numéricos con estados: pendiente, actual, completado.
 * Usa aria-* para accesibilidad completa (progressbar + labels).
 * 
 * @param currentStep - Paso actual (0-indexed)
 */

import { component$ } from '@builder.io/qwik';
import type { Signal } from '@builder.io/qwik';

interface ProgressIndicatorProps {
  currentStep: Signal<number>;
}

export const ProgressIndicator = component$<ProgressIndicatorProps>(({ currentStep }) => {
  return (
    <div 
      role="progressbar" 
      aria-valuenow={currentStep.value + 1} 
      aria-valuemin={1} 
      aria-valuemax={3}
      aria-label={`Paso ${currentStep.value + 1} de 3`}
      class="flex justify-center gap-4 mb-8"
    >
      <div 
        aria-label={`Paso 1${currentStep.value === 0 ? ' (actual)' : currentStep.value > 0 ? ' (completado)' : ''}`}
        class={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${currentStep.value === 0 ? 'bg-primary-600 text-white' : currentStep.value > 0 ? 'bg-green-500 text-white' : 'bg-neutral-200 text-neutral-400'}`}
      >
        {currentStep.value > 0 ? '✓' : '1'}
      </div>
      <div 
        aria-label={`Paso 2${currentStep.value === 1 ? ' (actual)' : currentStep.value > 1 ? ' (completado)' : ''}`}
        class={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${currentStep.value === 1 ? 'bg-primary-600 text-white' : currentStep.value > 1 ? 'bg-green-500 text-white' : 'bg-neutral-200 text-neutral-400'}`}
      >
        {currentStep.value > 1 ? '✓' : '2'}
      </div>
      <div 
        aria-label={`Paso 3${currentStep.value === 2 ? ' (actual)' : ''}`}
        class={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${currentStep.value === 2 ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-400'}`}
      >
        3
      </div>
    </div>
  );
});
