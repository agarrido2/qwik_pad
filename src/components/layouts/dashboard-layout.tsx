import {
  component$,
  useSignal,
  useVisibleTask$,
  Slot,
} from "@builder.io/qwik";
import { Sidebar } from "../dashboard/sidebar";
import { SidebarHeader } from "../dashboard/sidebar-header";



export const DashboardLayout = component$(() => {
  const collapsed  = useSignal(false);
  const mobileOpen = useSignal(false);
  const isMobile   = useSignal(false);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    const mq = window.matchMedia("(max-width: 1023px)");

    isMobile.value = mq.matches;

    // Cierra el drawer si cambia a desktop
    const handler = (e: MediaQueryListEvent) => {
      isMobile.value = e.matches;
      if (!e.matches) mobileOpen.value = false;
    };

    mq.addEventListener("change", handler);
    cleanup(() => mq.removeEventListener("change", handler));
  }, { strategy: "document-ready" });

  return (
    <div
      class={[
        "grid h-screen overflow-hidden bg-body",
        "grid-rows-[64px_1fr]",
        // Mobile — sin columna sidebar en el grid
        "grid-cols-[1fr]",
        "[grid-template-areas:'header''main']",
        // Desktop — con columna sidebar
        "lg:[grid-template-areas:'sidebar_header''sidebar_main']",
        collapsed.value
          ? "lg:grid-cols-[64px_1fr]"
          : "lg:grid-cols-[280px_1fr]",
        "transition-[grid-template-columns] duration-300 ease-in-out",
      ]}
    >
      {/* Backdrop mobile */}
      {mobileOpen.value && (
        <div
          class="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick$={() => (mobileOpen.value = false)}
        />
      )}

      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        isMobile={isMobile}
      />
      <SidebarHeader
        collapsed={collapsed}
        mobileOpen={mobileOpen}
      />

      <main class="[grid-area:main] overflow-y-auto bg-body p-6">
        <Slot />
      </main>
    </div>
  );
});
