/**
 * DashboardLayout - Shell orquestador del dashboard
 *
 * Arquitectura de 4 componentes:
 * 1. Sidebar: fixed left-0 - w-72 expandido / w-16 colapsado (desktop)
 * 2. Header: fixed top-0 - se desplaza con el sidebar
 * 3. Main: margen dinámico según estado del sidebar
 * 4. Footer: fixed bottom-0
 *
 * Collapse behavior:
 * - Mobile (<1024px): Sidebar como overlay (isOpen)
 *   → Backdrop semitransparente detrás
 *   → Se cierra con backdrop click o navegación
 * - Desktop (≥1024px): Sidebar colapsa a iconos w-16 (isCollapsed)
 *   → Contenido se desplaza (ml-72 → ml-16)
 *   → Sin backdrop
 *
 * Estado: SidebarContext (provideSidebarContext en routes layout)
 * Colores: Sistema HSL (bg-background, sin hardcoded)
 */

import { component$, Slot, useContext } from "@builder.io/qwik";
import { SidebarContext } from "~/lib/context/sidebar.context";
import {
  DashboardSidebar,
  DashboardHeader,
  DashboardFooter,
} from "~/components/dashboard";

import { cn } from "~/lib/utils/cn";

export const DashboardLayout = component$(() => {
  const sidebar = useContext(SidebarContext);

  return (
    <div class="bg-card min-h-screen">
      {/* ── BACKDROP (mobile only) ─────────────────────────────────────────
          Visible cuando sidebar está abierto en mobile.
          Click cierra el sidebar.
          lg:hidden → invisible en desktop (el sidebar no es overlay)
      ──────────────────────────────────────────────────────────────────── */}
      {sidebar.isOpen.value && (
        <div
          class="sidebar-backdrop"
          onClick$={sidebar.closeMobile}
          aria-hidden="true"
        />
      )}

      {/* ── SIDEBAR ───────────────────────────────────────────────────────
          Mobile:  traducción X (-translate-x-full oculto / translate-x-0 visible)
          Desktop: ancho dinámico (w-72 expandido / w-16 colapsado)
          z-30 → encima del backdrop (z-20) y debajo del header (z-20 fixed)
      ──────────────────────────────────────────────────────────────────── */}
      <DashboardSidebar />

      {/* ── HEADER ────────────────────────────────────────────────────────
          fixed top-0, se desplaza según estado del sidebar en desktop.
          Mobile:  left-0 (sidebar es overlay, no empuja el header)
          Desktop: left-72 expandido / left-16 colapsado
      ──────────────────────────────────────────────────────────────────── */}
      <DashboardHeader
        notificationCount={0}
        class={cn(
          // Base: mobile full width
          "left-0",
          // Desktop: ajusta left según collapsed
          sidebar.isCollapsed.value ? "lg:left-19" : "lg:left-75",
        )}
      />

      {/* ── MAIN CONTENT ──────────────────────────────────────────────────
          Mobile:  ml-0 (sidebar es overlay, no ocupa espacio)
          Desktop: ml-72 expandido / ml-16 colapsado
          mt-19 → gap visual sobre header (h-16 + 12px)
          bottom-15 → gap visual sobre footer (h-12 + 12px)
          Scroll interno para mantener gaps visibles siempre.
      ──────────────────────────────────────────────────────────────────── */}
      <main
        class={cn(
          "bg-background fixed top-19 right-0 bottom-15 overflow-y-auto p-6",
          // Mobile: sin margen lateral (sidebar es overlay)
          "left-0",
          // Desktop: margen dinámico según collapsed
          sidebar.isCollapsed.value ? "lg:left-19" : "lg:left-75",
        )}
      >
        <Slot />
      </main>

      {/* ── FOOTER ────────────────────────────────────────────────────────
          fixed bottom-0, ocupa todo el ancho.
          La zona izquierda (w-72) se alinea visualmente con el sidebar.
      ──────────────────────────────────────────────────────────────────── */}
      <DashboardFooter />
    </div>
  );
});
