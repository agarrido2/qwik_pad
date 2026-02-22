/**
 * Step2ReglasNegocio - Paso 2 del wizard: sector y descripción
 * 
 * 2 campos: sector (híbrido: catálogo + texto libre), businessDescription (textarea).
 */

import { component$ } from '@builder.io/qwik';
import { SECTOR_OPTIONS } from '~/features/onboarding/constants';
import type { OnboardingFormData, OnboardingFieldErrors } from './types';

interface Step2Props {
  formData: OnboardingFormData;
  fieldErrors?: OnboardingFieldErrors;
}

export const Step2ReglasNegocio = component$<Step2Props>(({ formData, fieldErrors }) => {
  const hasPresetSelection = SECTOR_OPTIONS.some((option) => option.value === formData.sector);

  return (
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-neutral-900 mb-4">
        2. Reglas de Negocio
      </h2>
      
      {/* Sector */}
      <div>
        <label for="sectorPreset" class="block text-sm font-medium text-neutral-700 mb-2">
          Sector de tu negocio *
        </label>
        <select
          id="sectorPreset"
          class="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          value={hasPresetSelection ? formData.sector : 'otro'}
          onChange$={(e: Event, el: HTMLSelectElement) => {
            if (el.value === 'otro') {
              formData.sector = hasPresetSelection ? '' : formData.sector;
              return;
            }

            formData.sector = el.value;
          }}
          required
        >
          <option value="">Selecciona un sector</option>
          {SECTOR_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{`${option.icon} ${option.label}`}</option>
          ))}
          <option value="otro">✍️ Otro (escribir manualmente)</option>
        </select>

        {!hasPresetSelection && (
          <div class="mt-3">
            <label for="customSector" class="block text-sm font-medium text-neutral-700 mb-2">
              Escribe tu sector
            </label>
            <input
              id="customSector"
              type="text"
              class="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ej: Peluquería canina"
              value={formData.sector}
              onInput$={(e: Event, el: HTMLInputElement) => {
                formData.sector = el.value;
              }}
              required
            />
          </div>
        )}

        <input type="hidden" name="sector" value={formData.sector} />

        {fieldErrors?.sector && (
          <p class="text-red-500 text-sm mt-1" role="alert">
            {fieldErrors.sector[0]}
          </p>
        )}
      </div>
      
      {/* Descripción */}
      <div>
        <label for="businessDescription" class="block text-sm font-medium text-neutral-700 mb-2">
          Descripción de tu negocio *
        </label>
        <textarea
          id="businessDescription"
          name="businessDescription"
          rows={4}
          class="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Describe brevemente qué hace tu empresa, productos/servicios principales, horarios, etc. Esto ayudará al asistente a responder mejor a tus clientes."
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
