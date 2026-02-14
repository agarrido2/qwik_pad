/**
 * Step1IdentidadCorporativa - Paso 1 del wizard: datos del negocio
 * 
 * 3 campos: fullName, organizationName, phone.
 * Recibe formData (useStore) y fieldErrors (del routeAction) como props.
 * Los inputs usan onInput$ para binding bidireccional con el store padre.
 */

import { component$ } from '@builder.io/qwik';
import type { OnboardingFormData, OnboardingFieldErrors } from './types';

interface Step1Props {
  formData: OnboardingFormData;
  fieldErrors?: OnboardingFieldErrors;
}

export const Step1IdentidadCorporativa = component$<Step1Props>(({ formData, fieldErrors }) => {
  return (
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-neutral-900 mb-4">
        1. Identidad Corporativa
      </h2>
      
      {/* Nombre completo */}
      <div>
        <label for="fullName" class="block text-sm font-medium text-neutral-700 mb-2">
          Tu nombre completo *
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="Ej: Juan Pérez García"
          value={formData.fullName}
          onInput$={(e: Event, el: HTMLInputElement) => (formData.fullName = el.value)}
          required
          class="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        {fieldErrors?.fullName && (
          <p class="text-red-500 text-sm mt-1" role="alert">
            {fieldErrors.fullName[0]}
          </p>
        )}
      </div>
      
      {/* Nombre del negocio */}
      <div>
        <label for="organizationName" class="block text-sm font-medium text-neutral-700 mb-2">
          Nombre del negocio *
        </label>
        <input
          id="organizationName"
          name="organizationName"
          type="text"
          placeholder="Ej: Mi Empresa S.A."
          value={formData.organizationName}
          onInput$={(e: Event, el: HTMLInputElement) => (formData.organizationName = el.value)}
          required
          class="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        {fieldErrors?.organizationName && (
          <p class="text-red-500 text-sm mt-1" role="alert">
            {fieldErrors.organizationName[0]}
          </p>
        )}
      </div>
      
      {/* Teléfono */}
      <div>
        <label for="phone" class="block text-sm font-medium text-neutral-700 mb-2">
          Teléfono de contacto *
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+34 919 123 456"
          value={formData.phone}
          onInput$={(e: Event, el: HTMLInputElement) => (formData.phone = el.value)}
          required
          class="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        <p class="text-xs text-neutral-500 mt-1">
          Formato: +34 919 123 456 o similar
        </p>
        {fieldErrors?.phone && (
          <p class="text-red-500 text-sm mt-1" role="alert">
            {fieldErrors.phone[0]}
          </p>
        )}
      </div>
    </div>
  );
});
