/**
 * Theme Toggle - Botón de cambio de tema (dark/light/system).
 *
 * Persistencia en localStorage + clases en <html>.
 * useVisibleTask$ justificado: requiere localStorage, matchMedia y classList (browser APIs).
 */

import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { Button } from "~/components/ui";
import { MoonIcon } from "~/components/icons/moon-icon";
import { SunIcon } from "~/components/icons/sun-icon";

// ── Tipos y constantes de módulo ─────────────────────────────────────────────

export type ThemeMode = "system" | "light" | "dark";

const THEME_STORAGE_KEY = "theme";

/** Rotación circular de modes: system → light → dark → system */
const THEME_CYCLE: Record<ThemeMode, ThemeMode> = {
  system: "light",
  light: "dark",
  dark: "system",
};

const THEME_LABELS: Record<ThemeMode, string> = {
  system: "System",
  light: "Claro",
  dark: "Oscuro",
};

// ── Helpers de DOM puros (sin capturas de closure) ───────────────────────────

/** Aplica las clases de tema sobre <html>. No captura estado Qwik. */
function applyThemeClass(mode: ThemeMode): void {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  if (mode !== "system") root.classList.add(mode);
}

/** Lee y valida el tema persistido en localStorage. */
function readStoredTheme(): ThemeMode {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
}

// ── Componente ────────────────────────────────────────────────────────────────

export const ThemeToggle = component$(() => {
  // useSignal para estado primitivo (más eficiente que useStore para un solo valor)
  const mode = useSignal<ThemeMode>("system");

  // Hidratación inicial: leer localStorage + suscribir a cambios del sistema.
  // useVisibleTask$ obligatorio aquí: localStorage y matchMedia son browser-only APIs.
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(
    ({ cleanup }) => {
      // 1. Restaurar preferencia guardada y aplicarla al DOM.
      const stored = readStoredTheme();
      mode.value = stored;
      applyThemeClass(stored);

      // 2. Reaccionar a cambios de preferencia del sistema operativo.
      //    Solo afecta cuando el usuario no ha fijado una preferencia explícita.
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const onSystemThemeChange = () => {
        if (mode.value === "system") {
          applyThemeClass("system");
        }
      };

      mediaQuery.addEventListener("change", onSystemThemeChange);
      cleanup(() =>
        mediaQuery.removeEventListener("change", onSystemThemeChange),
      );
    },
    { strategy: "document-ready" },
  );

  // Handler de ciclo: captura solo la Signal (primitivo serializable).
  const cycleTheme$ = $(() => {
    const next = THEME_CYCLE[mode.value];
    mode.value = next;
    localStorage.setItem(THEME_STORAGE_KEY, next);
    applyThemeClass(next);
  });

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Cambiar tema"
      title={THEME_LABELS[mode.value]}
      onClick$={cycleTheme$}
      class="text-foreground hover:bg-muted hover:text-foreground relative overflow-hidden"
    >
      {/* Sol — visible en modo LIGHT */}
      <SunIcon
        aria-hidden="true"
        class={[
          "absolute h-5 w-5 transition-all duration-300",
          mode.value === "light" ? "scale-100 rotate-0" : "scale-0 -rotate-90",
        ]}
      />

      {/* Luna — visible en modo DARK */}
      <MoonIcon
        aria-hidden="true"
        class={[
          "absolute h-5 w-5 transition-all duration-300",
          mode.value === "dark" ? "scale-100 rotate-0" : "scale-0 rotate-90",
        ]}
      />

      {/* Indicador de sistema — visible en modo AUTO */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        class={[
          "absolute h-5 w-5 transition-all duration-300",
          mode.value === "system"
            ? "scale-100 rotate-0"
            : "scale-0 rotate-90 opacity-0",
        ]}
      >
        <rect x="2" y="3" width="20" height="14" rx="2" stroke-width="2" />
        <line
          x1="8"
          y1="21"
          x2="16"
          y2="21"
          stroke-width="2"
          stroke-linecap="round"
        />
        <line
          x1="12"
          y1="17"
          x2="12"
          y2="21"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>

      <span class="sr-only">
        Cambiar tema. Actual: {THEME_LABELS[mode.value]}
      </span>
    </Button>
  );
});
