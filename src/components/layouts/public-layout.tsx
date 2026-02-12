import { component$, Slot } from '@builder.io/qwik';
import { Header, Footer } from '~/components/shared';

/**
 * PublicLayout - Layout orquestador para páginas públicas
 * 
 * Patrón: Composition over Embedded HTML.
 * Este layout coordina la estructura visual (Header + Main + Footer) delegando
 * la implementación a componentes reutilizables en components/shared/.
 * 
 * Arquitectura:
 * - Header: Navegación principal, logo, auth actions
 * - Main: Contenido dinámico inyectado via <Slot />
 * - Footer: Enlaces corporativos, copyright
 * 
 * Compliance: ARQUITECTURA_FOLDER.md - Layouts orquestan, no implementan UI.
 */
export const PublicLayout = component$(() => {
  return (
    <div class="flex min-h-screen flex-col">
      <Header />
      
      <main class="flex-1">
        <Slot />
      </main>
      
      <Footer />
    </div>
  );
});
