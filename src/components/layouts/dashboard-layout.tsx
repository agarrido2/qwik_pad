import { component$, Slot } from '@builder.io/qwik';
import { DashboardSidebar, DashboardHeader, DashboardFooter } from '~/components/dashboard';

/**
 * DashboardLayout - Shell orquestador del dashboard
 * 
 * Arquitectura de 4 componentes:
 * 1. Sidebar: fixed left-0 (w-72) - Navegación principal
 * 2. Header: fixed top-0 left-72 - Notificaciones + Profile
 * 3. Main: ml-72 mt-16 mb-12 - Contenido dinámico (Slot)
 * 4. Footer: fixed bottom-0 - Toast messages + Info
 * 
 * Pattern según ARQUITECTURA_FOLDER.md:
 * - Layout ORQUESTA, no implementa UI directamente
 * - Cada sección es un componente independiente
 * - Datos vienen de OrganizationContext (proveído en (app)/layout.tsx)
 * 
 * Responsive: Mobile collapse del sidebar en futuras iteraciones
 */
export const DashboardLayout = component$(() => {
  return (
    <div class="min-h-screen bg-neutral-50">
      {/* Sidebar - Navegación principal (fixed left) */}
      <DashboardSidebar />

      {/* Header - Barra superior (fixed top, left-72 para respetar sidebar) */}
      <DashboardHeader title="Dashboard" notificationCount={0} />

      {/* Main content - Margen para sidebar (ml-72), header (mt-16) y footer (mb-12) */}
      <main class="ml-72 mt-16 mb-12 p-6 min-h-[calc(100vh-7rem)]">
        <Slot />
      </main>

      {/* Footer - Barra inferior con toasts (fixed bottom) */}
      <DashboardFooter />
    </div>
  );
});
