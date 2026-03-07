import { component$, sync$, type Signal, useContext } from "@builder.io/qwik";
import { Button } from "~/components/ui/button";
import { IconMap } from "~/components/icons/dashboard-icons";
import { AuthContext } from "~/lib/context/auth.context";
import { cn } from "~/lib/utils/cn";

const THEME_STORAGE_KEY = "onucall-theme";

interface HeaderProps {
  collapsed:  Signal<boolean>;
  mobileOpen: Signal<boolean>;
}

export const SidebarHeader = component$<HeaderProps>(({ collapsed, mobileOpen }) => {
  const auth = useContext(AuthContext);
  const displayName = auth.user.fullName ?? auth.user.email;
  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U";

  return (
    <header class="[grid-area:header] flex items-center gap-3 h-16 px-6 bg-card border-b border-border shadow-sm shrink-0">

      {/* ── Hamburguesa — mobile ───────────────────────── */}
      <button
        type="button"
        aria-label={mobileOpen.value ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={mobileOpen.value}
        onClick$={() => (mobileOpen.value = !mobileOpen.value)}
        class="lg:hidden flex flex-col justify-center items-center w-8 h-8 gap-0 rounded-md hover:bg-accent transition-colors shrink-0"
      >
        {/* Línea superior */}
        <span class={cn(
          "block h-0.5 w-5 bg-font rounded-full transition-all duration-300 ease-in-out origin-center",
          mobileOpen.value ? "translate-y-0.75 rotate-45" : "-translate-y-1"
        )} />
        {/* Línea central */}
        <span class={cn(
          "block h-0.5 w-5 bg-font rounded-full transition-all duration-300 ease-in-out",
          mobileOpen.value ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100"
        )} />
        {/* Línea inferior */}
        <span class={cn(
          "block h-0.5 w-5 bg-font rounded-full transition-all duration-300 ease-in-out origin-center",
          mobileOpen.value ? "-translate-y-0.75 -rotate-45" : "translate-y-1"
        )} />
      </button>

      {/* ── Toggle sidebar — desktop ───────────────────── */}
      <Button
        variant="ghost"
        size="sm"
        class="hidden lg:flex"
        onClick$={() => (collapsed.value = !collapsed.value)}
        title={collapsed.value ? "Expandir menú" : "Colapsar menú"}
      >
        {IconMap["workflow"]}
      </Button>

      {/* Título */}
      <h1 class="text-sm font-semibold text-font hidden md:block">Dashboard</h1>

      {/* Spacer */}
      <div class="flex-1" />

      {/* Toggle tema */}
      <button
        type="button"
        aria-label="Cambiar modo"
        onClick$={sync$(() => {
          const isDark = document.documentElement.classList.contains("dark");
          const next = isDark ? "light" : "dark";
          document.documentElement.classList.remove("light", "dark");
          document.documentElement.classList.add(next);
          localStorage.setItem(THEME_STORAGE_KEY, next);
        })}
        class="p-2 rounded-lg hover:bg-accent transition-colors"
      >
        {/* Sol — visible solo en dark mode */}
        <svg class="h-5 w-5 hidden dark:block" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
        </svg>
        {/* Luna — visible solo en light mode */}
        <svg class="h-5 w-5 block dark:hidden" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      </button>

      {/* Usuario */}
      <div class="flex items-center gap-3">
        <span class="text-sm text-font-muted hidden sm:block">{displayName}</span>
        <div class="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white text-xs font-bold shrink-0">
          {initials}
        </div>
      </div>

    </header>
  );
});
