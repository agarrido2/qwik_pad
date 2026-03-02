import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { Button } from "~/components/ui";

export type OnucallColorTheme = "indigo" | "cyan" | "blue";

const COLOR_THEME_STORAGE_KEY = "onucall-theme";

const COLOR_THEME_CYCLE: Record<OnucallColorTheme, OnucallColorTheme> = {
  blue: "indigo",
  indigo: "cyan",
  cyan: "blue",
};

const COLOR_THEME_LABELS: Record<OnucallColorTheme, string> = {
  blue: "Blue",
  indigo: "Indigo",
  cyan: "Cyan",
};

function applyColorTheme(theme: OnucallColorTheme): void {
  document.documentElement.setAttribute("data-onucall-theme", theme);
}

function readStoredColorTheme(): OnucallColorTheme {
  const stored = localStorage.getItem(COLOR_THEME_STORAGE_KEY);
  if (stored === "indigo" || stored === "cyan" || stored === "blue") {
    return stored;
  }
  return "indigo";
}

export const ColorThemeToggle = component$(() => {
  const colorTheme = useSignal<OnucallColorTheme>("indigo");

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(
    () => {
      const storedTheme = readStoredColorTheme();
      colorTheme.value = storedTheme;
      applyColorTheme(storedTheme);
    },
    { strategy: "document-ready" },
  );

  const cycleColorTheme$ = $(() => {
    const nextTheme = COLOR_THEME_CYCLE[colorTheme.value];
    colorTheme.value = nextTheme;
    localStorage.setItem(COLOR_THEME_STORAGE_KEY, nextTheme);
    applyColorTheme(nextTheme);
  });

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label="Cambiar tema de color"
      title={`Tema de color: ${COLOR_THEME_LABELS[colorTheme.value]}`}
      onClick$={cycleColorTheme$}
      class="text-foreground hover:bg-muted hover:text-foreground gap-2"
    >
      <span class="bg-primary inline-block h-2.5 w-2.5 rounded-full" />
      <span class="hidden sm:inline">
        {COLOR_THEME_LABELS[colorTheme.value]}
      </span>
    </Button>
  );
});
