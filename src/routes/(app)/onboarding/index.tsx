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
import { ProgressIndicator } from '~/features/onboarding/components/ProgressIndicator';
import { Step1IdentidadCorporativa } from '~/features/onboarding/components/Step1IdentidadCorporativa';
import { Step2ReglasNegocio } from '~/features/onboarding/components/Step2ReglasNegocio';
import { Step3PersonalidadAsistente } from '~/features/onboarding/components/Step3PersonalidadAsistente';
import type { OnboardingFieldErrors } from '~/features/onboarding/components/types';

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
      if (import.meta.env.DEV) {
        console.error('❌ [OnboardingAction] No hay usuario autenticado');
      }
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
        sector: formData.sector,
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
      
      if (import.meta.env.DEV) {
        console.error('❌ [OnboardingAction] Error al guardar:', err);
      }
      return requestEvent.fail(500, { 
        message: err.message || 'Error al completar onboarding. Contacta con soporte.' 
      });
    }
  },
  zod$(OnboardingCompleteSchema)
);

// ═══════════════════════════════════════════════════════════════════
// COMPONENT: Wizard con componentes de paso extraídos
// Cada paso vive en features/onboarding/components/ (Orchestrator Pattern)
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
    sector: '',
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
      track(() => formData.sector);
      track(() => formData.businessDescription);
      isStepValid.value =
        formData.sector.trim().length >= 2 &&
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

  // Extraer fieldErrors del action para pasar a los componentes de paso
  const fieldErrors = action.value?.fieldErrors as OnboardingFieldErrors | undefined;
  
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
        <ProgressIndicator currentStep={currentStep} />
        
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
          {/* Paso 1: Identidad Corporativa */}
          {currentStep.value === 0 && (
            <Step1IdentidadCorporativa formData={formData} fieldErrors={fieldErrors} />
          )}
          
          {/* Paso 2: Reglas de Negocio */}
          {currentStep.value === 1 && (
            <Step2ReglasNegocio formData={formData} fieldErrors={fieldErrors} />
          )}
          
          {/* Paso 3: Personalidad del Asistente */}
          {currentStep.value === 2 && (
            <Step3PersonalidadAsistente 
              formData={formData} 
              fieldErrors={fieldErrors}
              globalError={action.value?.message}
            />
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
              <input type="hidden" name="sector" value={formData.sector} />
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
