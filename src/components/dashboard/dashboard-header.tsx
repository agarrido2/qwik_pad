/**
 * Dashboard Header - Barra superior del dashboard
 *
 * Posicionamiento: fixed top-0 left-72 right-0 h-16
 * - left-72 (288px) alineado con sidebar w-72
 * - Elementos: Título + Notificaciones + Dark mode toggle + Profile dropdown
 *
 * Colores 2026-02-17:
 * - Migrado a sistema HSL (bg-card, border-border, text-foreground)
 * - Dark mode automático sin cambios adicionales
 */

import { component$, useContext } from "@builder.io/qwik";
import { SidebarContext } from "~/lib/context/sidebar.context";
import {
  NotificationUser,
  ThemeToggle,
  ProfileUser,
  LanguageSwitcher,
} from "./header";
import { cn } from "~/lib/utils/cn";
import { Button, Input } from "~/components/ui";

interface DashboardHeaderProps {
  notificationCount?: number;
  class?: string;
}

export const DashboardHeader = component$<DashboardHeaderProps>(
  ({ notificationCount = 0, class: className }) => {
    const sidebar = useContext(SidebarContext);

    return (
      <header
        class={cn(
          "bg-background fixed top-0 right-0 h-16",
          "z-20 flex items-center justify-between gap-4 px-6",
          className,
        )}
      >
        {/* Izquierda: Layout toggles + Buscador */}
        <div class="flex w-full min-w-0 items-center gap-4 lg:w-1/2">
          {/* Menú Mobile Overlay */}
          <Button
            onClick$={sidebar.toggleOpen}
            variant="ghost"
            size="icon"
            class="text-muted-foreground hover:bg-muted hover:text-muted-foreground -ml-2 shrink-0 lg:hidden"
            aria-label="Abrir menú"
          >
            <svg
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </Button>

          {/* Menú Desktop Collapse */}
          <Button
            onClick$={sidebar.toggleCollapse}
            variant="ghost"
            size="icon"
            class="text-muted-foreground hover:bg-muted hover:text-muted-foreground -ml-2 hidden shrink-0 lg:flex"
            aria-label={
              sidebar.isCollapsed.value ? "Expandir menú" : "Contraer menú"
            }
          >
            <svg
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <rect
                width="18"
                height="18"
                x="3"
                y="3"
                rx="2"
                stroke-width="2"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 3v18"
              />
            </svg>
          </Button>

          {/* Buscador global */}
          <div class="relative hidden min-w-0 flex-1 sm:block lg:ml-2">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                class="text-muted-foreground h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <Input
              name="global-search"
              placeholder="Buscar en el dashboard..."
              inputClass="pl-10 h-10 w-full bg-card border-border/60 hover:border-border focus-visible:bg-card"
            />
          </div>
        </div>

        {/* Derecha: Actions */}
        <div class="text-foreground flex shrink-0 items-center gap-3">
          <LanguageSwitcher />
          <NotificationUser count={notificationCount} />
          <ThemeToggle />
          <ProfileUser />
        </div>
      </header>
    );
  },
);
