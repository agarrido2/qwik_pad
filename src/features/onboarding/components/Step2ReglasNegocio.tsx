/**
 * Step2ReglasNegocio - Paso 2 del wizard: sector y descripción
 * 
 * 2 campos: industrySlug (select), businessDescription (textarea).
 * El select tiene 7 sectores alineados con industrySectorEnum del schema.
 */

import { component$ } from '@builder.io/qwik';
import type { OnboardingFormData, OnboardingFieldErrors } from './types';

interface Step2Props {
  formData: OnboardingFormData;
  fieldErrors?: OnboardingFieldErrors;
}

export const Step2ReglasNegocio = component$<Step2Props>(({ formData, fieldErrors }) => {
  return (
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-neutral-900 mb-4">
        2. Reglas de Negocio
      </h2>
      
      {/* Sector */}
      <div>
        <label for="industrySlug" class="block text-sm font-medium text-neutral-700 mb-2">
          Sector de tu negocio *
        </label>
        <select
          id="industrySlug"
          name="industrySlug"
          class="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          value={formData.industrySlug}
          onChange$={(e: Event, el: HTMLSelectElement) => (formData.industrySlug = el.value)}
          required
        >
          <option value="">Selecciona un sector</option>
          <option value="concesionario">🚗 Concesionario</option>
          <option value="inmobiliaria">🏠 Inmobiliaria</option>
          <option value="retail">🛍️ Retail</option>
          <option value="alquiladora">🚙 Alquiladora de vehículos</option>
          <option value="despacho">📋 Despacho profesional</option>
          <option value="clinica">🏥 Clínica/Centro médico</option>
          <option value="sat">🔧 Servicio Técnico (SAT)</option>
        </select>
        {fieldErrors?.industrySlug && (
          <p class="text-red-500 text-sm mt-1" role="alert">
            {fieldErrors.industrySlug[0]}
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
