/**
 * Step2ReglasNegocio - Paso 2 del wizard: descripción del concesionario
 *
 * El sector ya está hardcoded como 'concesionario' (no es seleccionable).
 */

import { component$ } from '@builder.io/qwik';
import { DEFAULT_SECTOR, SECTOR_METADATA } from '~/features/onboarding/constants';
import type { OnboardingFormData, OnboardingFieldErrors } from './types';

interface Step2Props {
  formData: OnboardingFormData;
  fieldErrors?: OnboardingFieldErrors;
}

export const Step2ReglasNegocio = component$<Step2Props>(({ formData, fieldErrors }) => {
  if (!formData.sector || formData.sector !== DEFAULT_SECTOR) {
    formData.sector = DEFAULT_SECTOR;
  }

  return (
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-neutral-900 mb-4">
        2. Información del Concesionario
      </h2>

      <div class="p-4 bg-primary-50 border border-primary-200 rounded-lg">
        <div class="flex items-center gap-3">
          <span class="text-4xl">{SECTOR_METADATA.icon}</span>
          <div>
            <p class="font-medium text-neutral-900">{SECTOR_METADATA.label}</p>
            <p class="text-sm text-neutral-600">{SECTOR_METADATA.description}</p>
          </div>
        </div>
      </div>

      <input type="hidden" name="sector" value={DEFAULT_SECTOR} />
      
      {/* Descripción */}
      <div>
        <label for="businessDescription" class="block text-sm font-medium text-neutral-700 mb-2">
          Descripción de tu concesionario *
        </label>
        <textarea
          id="businessDescription"
          name="businessDescription"
          rows={4}
          class="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Describe brevemente tu concesionario: marcas que vendes, si tienes vehículos nuevos y/o de ocasión, horarios de atención y ubicación. Esto ayudará al asistente a responder mejor a tus clientes."
          value={formData.businessDescription}
          onInput$={(e: Event, el: HTMLTextAreaElement) => (formData.businessDescription = el.value)}
          required
        />
        <p class="text-xs text-neutral-500 mt-1">
          {formData.businessDescription.length}/500 caracteres (mínimo 20)
        </p>
        {fieldErrors?.businessDescription && (
          <p class="text-red-500 text-sm mt-1" role="alert">
            {fieldErrors.businessDescription[0]}
          </p>
        )}
      </div>
    </div>
  );
});
