/**
 * Step3PersonalidadAsistente - Paso 3 del wizard: personalidad del agente
 * 
 * 4 campos: assistantGender (toggle), assistantName (text),
 * assistantKindnessLevel (range 1-5), assistantFriendlinessLevel (range 1-5).
 * 
 * También muestra error global del action si existe.
 */

import { component$ } from '@builder.io/qwik';
import type { OnboardingFormData, OnboardingFieldErrors } from './types';

interface Step3Props {
  formData: OnboardingFormData;
  fieldErrors?: OnboardingFieldErrors;
  /** Mensaje global de error del action (ej: "Error al completar onboarding") */
  globalError?: string;
}

export const Step3PersonalidadAsistente = component$<Step3Props>(({ formData, fieldErrors, globalError }) => {
  return (
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-neutral-900 mb-4">
        3. Personalidad del Asistente
      </h2>
      
      {/* Género de voz */}
      <div>
        <label class="block text-sm font-medium text-neutral-700 mb-3">
          Género de voz *
        </label>
        <div class="grid grid-cols-2 gap-4">
          <button
            type="button"
            class={`p-4 border-2 rounded-lg text-center transition-all ${formData.assistantGender === 'male' ? 'border-primary-600 bg-primary-50' : 'border-neutral-300 hover:border-primary-300'}`}
            onClick$={() => (formData.assistantGender = 'male')}
          >
            <span class="text-3xl block mb-2" aria-hidden="true">👨</span>
            <p class="font-medium">Masculina</p>
          </button>
          <button
            type="button"
            class={`p-4 border-2 rounded-lg text-center transition-all ${formData.assistantGender === 'female' ? 'border-primary-600 bg-primary-50' : 'border-neutral-300 hover:border-primary-300'}`}
            onClick$={() => (formData.assistantGender = 'female')}
          >
            <span class="text-3xl block mb-2" aria-hidden="true">👩</span>
            <p class="font-medium">Femenina</p>
          </button>
        </div>
        {/* Hidden input para serializar en el Form */}
        <input type="hidden" name="assistantGender" value={formData.assistantGender} />
        {fieldErrors?.assistantGender && (
          <p class="text-red-500 text-sm mt-1" role="alert">
            {fieldErrors.assistantGender[0]}
          </p>
        )}
      </div>
      
      {/* Nombre del asistente */}
      <div>
        <label for="assistantName" class="block text-sm font-medium text-neutral-700 mb-2">
          Nombre del asistente *
        </label>
        <input
          id="assistantName"
          name="assistantName"
          type="text"
          placeholder="Ej: María"
          value={formData.assistantName}
          onInput$={(e: Event, el: HTMLInputElement) => (formData.assistantName = el.value)}
          required
          class="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        {fieldErrors?.assistantName && (
          <p class="text-red-500 text-sm mt-1" role="alert">
            {fieldErrors.assistantName[0]}
          </p>
        )}
      </div>
      
      {/* Nivel de amabilidad */}
      <div>
        <label for="assistantKindnessLevel" class="block text-sm font-medium text-neutral-700 mb-2">
          Nivel de amabilidad *
        </label>
        <div class="flex items-center gap-4">
          <span class="text-sm text-neutral-600">Formal</span>
          <input
            type="range"
            id="assistantKindnessLevel"
            name="assistantKindnessLevel"
            min="1"
            max="5"
            value={formData.assistantKindnessLevel}
            onInput$={(e: Event, el: HTMLInputElement) => {
              formData.assistantKindnessLevel = parseInt(el.value);
            }}
            class="flex-1"
          />
          <span class="text-sm text-neutral-600">Amable</span>
          <span class="text-lg font-bold text-primary-600 w-8 text-center">
            {formData.assistantKindnessLevel}
          </span>
        </div>
      </div>
      
      {/* Nivel de simpatía */}
      <div>
        <label for="assistantFriendlinessLevel" class="block text-sm font-medium text-neutral-700 mb-2">
          Nivel de simpatía *
        </label>
        <div class="flex items-center gap-4">
          <span class="text-sm text-neutral-600">Neutral</span>
          <input
            type="range"
            id="assistantFriendlinessLevel"
            name="assistantFriendlinessLevel"
            min="1"
            max="5"
            value={formData.assistantFriendlinessLevel}
            onInput$={(e: Event, el: HTMLInputElement) => {
              formData.assistantFriendlinessLevel = parseInt(el.value);
            }}
            class="flex-1"
          />
          <span class="text-sm text-neutral-600">Simpático</span>
          <span class="text-lg font-bold text-primary-600 w-8 text-center">
            {formData.assistantFriendlinessLevel}
          </span>
        </div>
      </div>
      
      {/* Error global del action (si existe) */}
      {globalError && (
        <div class="bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
          <p class="text-red-700 text-sm">
            ❌ {globalError}
          </p>
        </div>
      )}
    </div>
  );
});
