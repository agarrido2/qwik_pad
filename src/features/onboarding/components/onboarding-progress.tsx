/**
 * OnboardingProgress - Barra de progreso visual del onboarding (3 pasos)
 */

import { component$ } from '@builder.io/qwik';
import { cn } from '~/lib/utils/cn';

export interface OnboardingProgressProps {
  currentStep: number;
  totalSteps?: number;
}

export const OnboardingProgress = component$<OnboardingProgressProps>(
  ({ currentStep, totalSteps = 3 }) => {
    const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

    return (
      <div class="w-full" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={totalSteps} aria-label={`Paso ${currentStep} de ${totalSteps}`}>
        <div class="mb-2 flex justify-between text-sm text-neutral-500">
          <span>Paso {currentStep} de {totalSteps}</span>
        </div>
        <div class="flex gap-2">
          {steps.map((step) => (
            <div
              key={step}
              class={cn(
                'h-2 flex-1 rounded-full transition-colors',
                step <= currentStep ? 'bg-primary-600' : 'bg-neutral-200'
              )}
            />
          ))}
        </div>
      </div>
    );
  }
);
