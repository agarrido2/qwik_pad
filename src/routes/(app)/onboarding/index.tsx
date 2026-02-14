/**
 * Onboarding Page (SIMPLIFICADO - Todo inline)
 * @description Wizard de configuración inicial en 3 pasos, 9 campos totales
 * 
 * FLUJO:
 * 1. Guard detecta onboardingCompleted = false → redirige aquí
 * 2. Usuario completa 3 pasos en un mismo Form
 * 3. Submit final dispara routeAction$ con validación Zod
 * 4. Servicio guarda en organizations + marca onboardingCompleted = true
 * 5. Redirección a /dashboard
 * 
 * ARQUITECTURA SIMPLIFICADA:
 * - Form envuelve TODO el wizard
 * - Hidden inputs preservan valores de pasos anteriores
 * - Navegación: type="button" (NO submit)
 * - Submit final: type="submit" (DISPARA action)
 * 
 * SEGURIDAD:
 * - Validación client-side: useTask$ reactivo
 * - Validación server-side: zod$(OnboardingCompleteSchema)
 * - Auth middleware heredado de (app)/layout.tsx (usuario ya validado)
 */

import { component$, useSignal, useStore, useTask$, $ } from '@builder.io/qwik';
import { Form, routeAction$, routeLoader$, zod$, type DocumentHead } from '@builder.io/qwik-city';
import { OnboardingCompleteSchema, OnboardingService } from '~/lib/onboarding';
import { getAuthGuardData } from '~/lib/auth/auth-guard';
import type { IndustrySlug } from '~/lib/utils/demo-data-templates';

// ═══════════════════════════════════════════════════════════════════
// ROUTE LOADER: Exponer usuario a componentes
// NOTA: El auth guard está en layout.tsx (no es necesario duplicarlo aquí)
// ═══════════════════════════════════════════════════════════════════

export const useOnboardingUser = routeLoader$(async (requestEvent) => {
  const data = await getAuthGuardData(requestEvent);
  
  if (!data) {
    throw requestEvent.redirect(302, '/login');
  }
  
  return {
    userId: data.authUser.id,
    email: data.authUser.email ?? '',
    fullName: data.dbUser.fullName ?? '',
  };
});

// ═══════════════════════════════════════════════════════════════════
// ROUTE ACTION: Submit del onboarding
// ═══════════════════════════════════════════════════════════════════

export const useOnboardingAction = routeAction$(
  async (formData, requestEvent) => {
    if (import.meta.env.DEV) {
      console.log('🚀 [OnboardingAction] EJECUTÁNDOSE');
      console.log('📦 [OnboardingAction] FormData recibido:', formData);
    }
    
    const data = await getAuthGuardData(requestEvent);
    
    if (!data) {
      console.error('❌ [OnboardingAction] No hay usuario autenticado');
      return requestEvent.fail(401, { message: 'No hay usuario autenticado' });
    }
    
    if (import.meta.env.DEV) {
      console.log('👤 [OnboardingAction] Usuario:', data.authUser.id, data.authUser.email);
    }
    
    try {
      // Llamar al servicio que orquesta toda la lógica
      await OnboardingService.completeOnboarding(data.authUser.id, {
        fullName: formData.fullName,
        organizationName: formData.organizationName,
        phone: formData.phone,
        industrySlug: formData.industrySlug as IndustrySlug,
        businessDescription: formData.businessDescription,
        assistantGender: formData.assistantGender,
        assistantName: formData.assistantName,
        assistantKindnessLevel: formData.assistantKindnessLevel,
        assistantFriendlinessLevel: formData.assistantFriendlinessLevel,
      });
      
      if (import.meta.env.DEV) {
        console.log('✅ [OnboardingAction] Guardado exitoso, redirigiendo...');
      }
      
      // Éxito: redirigir a dashboard
      throw requestEvent.redirect(302, '/dashboard');
    } catch (err: any) {
      // Si es un redirect, lanzarlo (éxito)
      if (err?.status === 302) throw err;
      
      console.error('❌ [OnboardingAction] Error al guardar:', err);
      return requestEvent.fail(500, { 
        message: err.message || 'Error al completar onboarding. Contacta con soporte.' 
      });
    }
  },
  zod$(OnboardingCompleteSchema)
);

// ═══════════════════════════════════════════════════════════════════
// COMPONENT: Wizard inline (sin componentes externos)
// ═══════════════════════════════════════════════════════════════════

export default component$(() => {
  const action = useOnboardingAction();
  const user = useOnboardingUser();
  
  // ═══════════════════════════════════════════════════════════════
  // PATRÓN CORRECTO QWIK: useStore para formularios multi-paso
  // Todos los datos del formulario en un único store reactivo
  // ═══════════════════════════════════════════════════════════════
  const formData = useStore({
    // Paso 1: Identidad Corporativa
    fullName: user.value.fullName || '',
    organizationName: '',
    phone: '',
    // Paso 2: Reglas del Negocio
    industrySlug: '',
    businessDescription: '',
    // Paso 3: Su Asistente
    assistantGender: 'female',
    assistantName: '',
    assistantKindnessLevel: 3,
    assistantFriendlinessLevel: 3,
  });
  
  const currentStep = useSignal(0);
  const isStepValid = useSignal(false);
  
  // Validación reactiva por paso
  useTask$(({ track }) => {
    track(() => currentStep.value);
    
    if (currentStep.value === 0) {
      track(() => formData.fullName);
      track(() => formData.organizationName);
      track(() => formData.phone);
      isStepValid.value =
        formData.fullName.trim().length >= 5 &&
        formData.organizationName.trim().length >= 3 &&
        formData.phone.trim().length >= 7;
    } else if (currentStep.value === 1) {
      track(() => formData.industrySlug);
      track(() => formData.businessDescription);
      isStepValid.value =
        formData.industrySlug !== '' &&
        formData.businessDescription.trim().length >= 20;
    } else if (currentStep.value === 2) {
      track(() => formData.assistantGender);
      track(() => formData.assistantName);
      isStepValid.value =
        formData.assistantGender !== '' &&
        formData.assistantName.trim().length >= 5;
    }
  });
  
  // Navegación
  const goNext = $(() => {
    if (isStepValid.value && currentStep.value < 2) {
      currentStep.value++;
    }
  });
  
  const goPrev = $(() => {
    if (currentStep.value > 0) {
      currentStep.value--;
    }
  });
  
  // DEBUG: Log al renderizar (solo en desarrollo)
  if (import.meta.env.DEV) {
    console.log('🎭 [Render] currentStep:', currentStep.value, '| isStepValid:', isStepValid.value);
  }
  
  return (
    <main class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4">
      <div class="max-w-4xl mx-auto">
        {/* Header */}
        <header class="text-center mb-10">
          <div class="inline-block p-4 bg-white rounded-full shadow-lg mb-4">
            <span class="text-5xl" aria-hidden="true">🤖</span>
          </div>
          <h1 class="text-4xl font-bold text-neutral-900 mb-3">
            Configura tu Asistente de IA
          </h1>
          <p class="text-lg text-neutral-600">
            Solo 3 pasos rápidos para activar tu asistente telefónico
          </p>
        </header>
        
        {/* Indicadores de paso */}
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
        
        {/* Wizard Form */}
        <Form 
          action={action} 
          class="bg-white rounded-xl shadow-lg border border-neutral-200 p-8"
          onSubmit$={() => {
            if (import.meta.env.DEV) {
              console.log('📤 [Form] onSubmit$ disparado');
              console.log('📊 [Form] Valores actuales (formData):', formData);
            }
          }}
        >
          {/* ═══════════════════════════════════════════════════════════
              PASO 1: Identidad Corporativa (3 campos)
          ═══════════════════════════════════════════════════════════ */}
          {currentStep.value === 0 && (
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
                {action.value?.fieldErrors?.fullName && (
                  <p class="text-red-500 text-sm mt-1" role="alert">
                    {action.value.fieldErrors.fullName[0]}
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
                {action.value?.fieldErrors?.organizationName && (
                  <p class="text-red-500 text-sm mt-1" role="alert">
                    {action.value.fieldErrors.organizationName[0]}
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
                {action.value?.fieldErrors?.phone && (
                  <p class="text-red-500 text-sm mt-1" role="alert">
                    {action.value.fieldErrors.phone[0]}
                  </p>
                )}
              </div>
            </div>
          )}
          
          {/* ═══════════════════════════════════════════════════════════
              PASO 2: Reglas de Negocio (2 campos)
          ═══════════════════════════════════════════════════════════ */}
          {currentStep.value === 1 && (
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
                {action.value?.fieldErrors?.industrySlug && (
                  <p class="text-red-500 text-sm mt-1" role="alert">
                    {action.value.fieldErrors.industrySlug[0]}
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
                {action.value?.fieldErrors?.businessDescription && (
                  <p class="text-red-500 text-sm mt-1" role="alert">
                    {action.value.fieldErrors.businessDescription[0]}
                  </p>
                )}
              </div>
            </div>
          )}
          
          {/* ═══════════════════════════════════════════════════════════
              PASO 3: Personalidad del Asistente (4 campos)
          ═══════════════════════════════════════════════════════════ */}
          {currentStep.value === 2 && (
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
                <input type="hidden" name="assistantGender" value={formData.assistantGender} />
                {action.value?.fieldErrors?.assistantGender && (
                  <p class="text-red-500 text-sm mt-1" role="alert">
                    {action.value.fieldErrors.assistantGender[0]}
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
                {action.value?.fieldErrors?.assistantName && (
                  <p class="text-red-500 text-sm mt-1" role="alert">
                    {action.value.fieldErrors.assistantName[0]}
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
              {action.value?.message && (
                <div class="bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
                  <p class="text-red-700 text-sm">
                    ❌ {action.value.message}
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* ═══════════════════════════════════════════════════════════
              INPUTS HIDDEN: Preservar valores de TODOS los pasos
              CRÍTICO: Qwik Form solo serializa inputs presentes en DOM
              
              ESTRATEGIA: Renderizar SIEMPRE todos los campos como hidden,
              excepto los del paso actual que se muestran visibles
          ═══════════════════════════════════════════════════════════ */}
          
          {/* Hidden inputs PASO 1 (cuando NO es el paso actual) */}
          {currentStep.value !== 0 && (
            <>
              <input type="hidden" name="fullName" value={formData.fullName} />
              <input type="hidden" name="organizationName" value={formData.organizationName} />
              <input type="hidden" name="phone" value={formData.phone} />
            </>
          )}
          
          {/* Hidden inputs PASO 2 (cuando NO es el paso actual) */}
          {currentStep.value !== 1 && (
            <>
              <input type="hidden" name="industrySlug" value={formData.industrySlug} />
              <input type="hidden" name="businessDescription" value={formData.businessDescription} />
            </>
          )}
          
          {/* Hidden inputs PASO 3 (cuando NO es el paso actual) */}
          {currentStep.value !== 2 && (
            <>
              <input type="hidden" name="assistantGender" value={formData.assistantGender} />
              <input type="hidden" name="assistantName" value={formData.assistantName} />
              <input type="hidden" name="assistantKindnessLevel" value={formData.assistantKindnessLevel.toString()} />
              <input type="hidden" name="assistantFriendlinessLevel" value={formData.assistantFriendlinessLevel.toString()} />
            </>
          )}
          
          {/* Botones de navegación */}
          <div class="flex justify-between items-center mt-8">
            {currentStep.value === 0 ? (
              <a
                href="/dashboard"
                class="px-6 py-3 rounded-lg font-medium transition-all bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              >
                ← Cancelar
              </a>
            ) : (
              <button
                type="button"
                onClick$={goPrev}
                class="px-6 py-3 rounded-lg font-medium transition-all bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              >
                ← Anterior
              </button>
            )}
            
            <span class="text-sm text-neutral-500">
              Paso {currentStep.value + 1} de 3
            </span>
            
            {currentStep.value < 2 ? (
              <button
                type="button"
                onClick$={goNext}
                disabled={!isStepValid.value}
                class={[
                  'px-6 py-3 rounded-lg font-medium transition-all',
                  !isStepValid.value
                    ? 'bg-primary-300 text-white cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700',
                ]}
              >
                Siguiente →
              </button>
            ) : (
              <button
                type="submit"
                disabled={!isStepValid.value || action.isRunning}
                onClick$={() => {
                  if (import.meta.env.DEV) {
                    console.log('🔵 [Submit Button] CLICK detectado');
                    console.log('🔵 [Submit Button] isStepValid:', isStepValid.value);
                    console.log('🔵 [Submit Button] action.isRunning:', action.isRunning);
                  }
                }}
                class={[
                  'px-6 py-3 rounded-lg font-medium transition-all',
                  !isStepValid.value || action.isRunning
                    ? 'bg-green-300 text-white cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700',
                ]}
              >
                {action.isRunning ? 'Guardando...' : 'Completar Configuración'}
              </button>
            )}
          </div>
        </Form>
      </div>
    </main>
  );
});

// ═══════════════════════════════════════════════════════════════════
// DOCUMENT HEAD: SEO y metadatos
// ═══════════════════════════════════════════════════════════════════

export const head: DocumentHead = {
  title: 'Configuración Inicial - Onucall',
  meta: [
    {
      name: 'description',
      content: 'Configura tu asistente de IA en 3 sencillos pasos y empieza a recibir llamadas automáticamente',
    },
    {
      name: 'robots',
      content: 'noindex, nofollow',
    },
  ],
};
