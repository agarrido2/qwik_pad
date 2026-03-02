/**
 * Dashboard Footer - Barra inferior del dashboard
 *
 * Estructura: fixed bottom-0 left-0 right-0 h-12
 * - Zona izquierda: ancho dinámico según sidebar (w-72 / w-16)
 * - Zona derecha (flex-1): Fecha + Soporte IT + Versión
 *
 * Fix 2026-02-17:
 * - Zona izquierda responde al collapse del sidebar via SidebarContext
 */

import { component$, useComputed$, useContext } from "@builder.io/qwik";
import { SidebarContext } from "~/lib/context/sidebar.context";
import { cn } from "~/lib/utils/cn";

export const DashboardFooter = component$(() => {
  const sidebar = useContext(SidebarContext);

  const currentDate = useComputed$(() => {
    return new Date().toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  });

  const appVersion = import.meta.env.PUBLIC_APP_VERSION || "1.0.0";

  return (
    <footer
      class={cn(
        "dashboard-footer bg-background fixed right-0 bottom-0 z-10 flex h-12 items-center border-0 px-4 sm:px-6",
        "left-0",
        sidebar.isCollapsed.value ? "lg:left-19" : "lg:left-75",
      )}
    >
      <div class="flex w-full items-center justify-between">
        <span class="text-muted-foreground text-xs">{currentDate.value}</span>

        <span class="text-muted-foreground/60 text-xs">v{appVersion}</span>
      </div>
    </footer>
  );
});
