import { $, component$, type Signal } from "@builder.io/qwik";
import { SidebarMenu } from "./sidebar-menu";
import { SidebarFooter } from "./sidebar-footer";

interface SidebarProps {
  collapsed:  Signal<boolean>;
  mobileOpen: Signal<boolean>;
  isMobile:   Signal<boolean>;
}

export const Sidebar = component$<SidebarProps>(
  ({ collapsed, mobileOpen, isMobile }) => {
    return (
      <aside
        class={[
          "fixed inset-y-0 left-0 z-30 flex flex-col",
          "bg-primary/80 text-white",
          "overflow-y-scroll overflow-x-hidden",
          "transition-all duration-300 ease-in-out",
          // Mobile — drawer controlado por mobileOpen
          "w-70",
          mobileOpen.value ? "translate-x-0" : "-translate-x-full",
          // Desktop — integrado en grid, siempre visible
          "lg:relative lg:translate-x-0 lg:[grid-area:sidebar]",
          collapsed.value ? "lg:w-[64px]" : "lg:w-[280px]",
        ]}
      >
        {/* Logo */}
        <div class="flex h-16 items-center justify-center border-b border-white/10 shrink-0 px-4">
          {collapsed.value && !isMobile.value ? (
            <span class="text-xl font-bold">O</span>
          ) : (
            <span class="text-xl font-bold tracking-tight">Onucall</span>
          )}
        </div>

        {/* Menú */}
        <SidebarMenu
          collapsed={collapsed.value}
          isMobile={isMobile.value}
          onNavigate$={$(() => {
            mobileOpen.value = false;
          })}
        />

        {/* Footer */}
        <SidebarFooter />
      </aside>
    );
  }
);
