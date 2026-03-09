import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { TrustedCompanies } from '~/components/shared/TrustedCompanies';

export default component$(() => {
  return (
    <div class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 class="text-5xl font-extrabold tracking-tight mb-6">
        Bienvenido a <span class="bg-linear-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">Qwik Pad</span>
      </h1>
      <p class="text-xl text-gray-600 max-w-2xl mb-8">
        La plataforma definitiva para gestionar tu negocio de forma rápida y eficiente.
      </p>
      <div class="flex gap-4">
        <a 
          href="/dashboard" 
          class="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          Ir al Dashboard
        </a>
        <a 
          href="/login" 
          class="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors"
        >
          Iniciar Sesión
        </a>
      </div>
      <TrustedCompanies />
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Qwik Pad - Inicio',
  meta: [
    {
      name: 'description',
      content: 'Landing page de Qwik Pad',
    },
  ],
};
