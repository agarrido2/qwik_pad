/**
 * /internal/colors — Catálogo Visual de Colores
 *
 * Página de referencia interna: muestra todos los tokens de color del sistema
 * de diseño (CSS variables) aplicados a botones y badges.
 *
 * PROPÓSITO: Validación visual rápida antes de tomar decisiones de paleta.
 * ACCESO: Solo entorno de desarrollo / rutas internas.
 *
 * ARQUITECTURA: Componente puramente presentacional. Sin estado, sin loaders.
 * [CITE: PROJECT_RULES_CORE.md - Routes como orchestrators, no lógica de negocio]
 */

import { component$, sync$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

/* ─── Tipos ──────────────────────────────────────────────────────────────── */

interface ColorSwatch {
  name: string;
  bg: string;
  text: string;
  border?: string;
  hex: string;
  variable: string;
}

interface ButtonVariant {
  label: string;
  classes: string;
}

interface BadgeVariant {
  label: string;
  classes: string;
}

/* ─── Datos de Paleta ────────────────────────────────────────────────────── */

const SWATCHES: ColorSwatch[] = [
  {
    name: "Primary",
    bg: "bg-primary",
    text: "text-primary-foreground",
    hex: "#19B6F6",
    variable: "--primary: 197 92% 53%",
  },
  {
    name: "Primary Light",
    bg: "bg-primary-light",
    text: "text-primary-foreground",
    hex: "#3FC2F8",
    variable: "--primary-light: 197 92% 60%",
  },
  {
    name: "Secondary",
    bg: "bg-secondary",
    text: "text-secondary-foreground",
    hex: "#AC7EF4",
    variable: "--secondary: 263 84% 73%",
  },
  {
    name: "Secondary Light",
    bg: "bg-secondary-light",
    text: "text-secondary-foreground",
    hex: "#BF9BF7",
    variable: "--secondary-light: 263 84% 80%",
  },
  {
    name: "Brand Ink",
    bg: "bg-brand-ink",
    text: "text-white",
    hex: "#2F456A",
    variable: "--brand-ink: 218 39% 30%",
  },
  {
    name: "Accent",
    bg: "bg-accent",
    text: "text-accent-foreground",
    hex: "#D6F2FD",
    variable: "--accent: 197 80% 94%",
  },
  {
    name: "Success",
    bg: "bg-success",
    text: "text-success-foreground",
    hex: "#1F8C3B",
    variable: "--success: 142 76% 32%",
  },
  {
    name: "Error",
    bg: "bg-error",
    text: "text-error-foreground",
    hex: "#D92626",
    variable: "--error: 0 72% 50%",
  },
  {
    name: "Warning",
    bg: "bg-warning",
    text: "text-warning-foreground",
    hex: "#B86A08",
    variable: "--warning: 38 92% 38%",
  },
  {
    name: "Info",
    bg: "bg-info",
    text: "text-info-foreground",
    hex: "#0B9FD8",
    variable: "--info: 199 89% 48%",
  },
  {
    name: "Destructive",
    bg: "bg-destructive",
    text: "text-destructive-foreground",
    hex: "#EF4444",
    variable: "--destructive: 0 84% 60%",
  },
  {
    name: "Muted",
    bg: "bg-muted",
    text: "text-muted-foreground",
    hex: "#EDF2F9",
    variable: "--muted: 210 30% 96%",
  },
  {
    name: "Card",
    bg: "bg-card",
    text: "text-card-foreground",
    border: "border border-border",
    hex: "#FFFFFF",
    variable: "--card: 0 0% 100%",
  },
  {
    name: "Background",
    bg: "bg-background",
    text: "text-foreground",
    border: "border border-border",
    hex: "#F0F5F3",
    variable: "--background: 160 17% 96%",
  },
];

/* ─── Variantes de Botones ───────────────────────────────────────────────── */

const BUTTON_VARIANTS: ButtonVariant[] = [
  {
    label: "Primary",
    classes:
      "bg-primary text-primary-foreground hover:bg-primary-light focus-visible:ring-2 focus-visible:ring-ring",
  },
  {
    label: "Secondary",
    classes:
      "bg-secondary text-secondary-foreground hover:bg-secondary-light focus-visible:ring-2 focus-visible:ring-ring",
  },
  {
    label: "Brand Ink",
    classes:
      "bg-brand-ink text-white hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring",
  },
  {
    label: "Success",
    classes:
      "bg-success text-success-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring",
  },
  {
    label: "Error",
    classes:
      "bg-error text-error-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring",
  },
  {
    label: "Warning",
    classes:
      "bg-warning text-warning-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring",
  },
  {
    label: "Info",
    classes:
      "bg-info text-info-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring",
  },
  {
    label: "Destructive",
    classes:
      "bg-destructive text-destructive-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring",
  },
  {
    label: "Outline Primary",
    classes:
      "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring",
  },
  {
    label: "Outline Secondary",
    classes:
      "border-2 border-secondary text-secondary bg-transparent hover:bg-secondary hover:text-secondary-foreground focus-visible:ring-2 focus-visible:ring-ring",
  },
  {
    label: "Ghost",
    classes:
      "bg-transparent text-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
  },
  {
    label: "Accent",
    classes:
      "bg-accent text-accent-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring",
  },
];

/* ─── Variantes de Badges ────────────────────────────────────────────────── */

const BADGE_VARIANTS: BadgeVariant[] = [
  { label: "Primary", classes: "bg-primary text-primary-foreground" },
  { label: "Secondary", classes: "bg-secondary text-secondary-foreground" },
  { label: "Brand Ink", classes: "bg-brand-ink text-white" },
  { label: "Success", classes: "bg-success text-success-foreground" },
  { label: "Error", classes: "bg-error text-error-foreground" },
  { label: "Warning", classes: "bg-warning text-warning-foreground" },
  { label: "Info", classes: "bg-info text-info-foreground" },
  {
    label: "Destructive",
    classes: "bg-destructive text-destructive-foreground",
  },
  {
    label: "Outline Primary",
    classes: "border border-primary text-primary bg-transparent",
  },
  {
    label: "Outline Secondary",
    classes: "border border-secondary text-secondary bg-transparent",
  },
  {
    label: "Muted",
    classes: "bg-muted text-muted-foreground",
  },
  {
    label: "Accent",
    classes: "bg-accent text-accent-foreground",
  },
];

const MODE_OPTIONS = ["light", "dark", "system"] as const;

/* ─── Componente Principal ───────────────────────────────────────────────── */

export default component$(() => {
  return (
    <main class="bg-background min-h-screen p-8 font-sans">
      {/* Encabezado */}
      <header class="border-border mb-10 border-b pb-6">
        <p class="text-muted-foreground mb-1 text-xs font-semibold tracking-widest uppercase">
          /internal/colors
        </p>
        <h1 class="text-foreground text-3xl font-bold">
          Catálogo de Colores del Sistema
        </h1>
        <p class="text-muted-foreground mt-2 max-w-xl text-sm">
          Muestra visual de todos los tokens de color definidos en{" "}
          <code class="bg-muted rounded px-1.5 py-0.5 text-xs">global.css</code>
          . Usa esta página para evaluar la paleta antes de tomar decisiones de
          diseño.
        </p>

        <div class="mt-5 flex flex-wrap items-center gap-4">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Modo
            </span>
            {MODE_OPTIONS.map((mode) => (
              <button
                key={mode}
                type="button"
                class="border-border bg-card text-foreground hover:bg-muted rounded-md border px-3 py-1.5 text-xs font-medium"
                onClick$={sync$(() => {
                  const root = document.documentElement;
                  root.classList.remove("light", "dark");
                  if (mode !== "system") {
                    root.classList.add(mode);
                  }
                  localStorage.setItem("theme", mode);
                })}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Sección: Swatches de Color */}
      <section class="mb-14">
        <h2 class="text-foreground mb-1 text-lg font-semibold">
          Tokens de Color
        </h2>
        <p class="text-muted-foreground mb-5 text-sm">
          Cada token refleja su valor en modo actual. Activa el modo oscuro para
          ver la variante dark.
        </p>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {SWATCHES.map((swatch) => (
            <div
              key={swatch.name}
              class="border-border overflow-hidden rounded-lg border shadow-sm"
            >
              {/* Muestra de color */}
              <div
                class={[
                  swatch.bg,
                  swatch.text,
                  swatch.border ?? "",
                  "flex h-20 items-center justify-center text-sm font-semibold",
                ].join(" ")}
              >
                {swatch.name}
              </div>
              {/* Metadatos */}
              <div class="bg-card px-3 py-2">
                <p class="text-foreground font-mono text-xs font-semibold">
                  {swatch.hex}
                </p>
                <p class="text-muted-foreground mt-0.5 truncate text-xs">
                  {swatch.variable}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sección: Botones */}
      <section class="mb-14">
        <h2 class="text-foreground mb-1 text-lg font-semibold">Botones</h2>
        <p class="text-muted-foreground mb-5 text-sm">
          Variantes disponibles en tamaños SM, MD y LG.
        </p>

        {/* Tamaño MD (referencia central) */}
        <div class="mb-6">
          <p class="text-muted-foreground mb-3 text-xs font-medium tracking-widest uppercase">
            Tamaño MD (base)
          </p>
          <div class="flex flex-wrap gap-3">
            {BUTTON_VARIANTS.map((btn) => (
              <button
                key={btn.label}
                type="button"
                class={[
                  btn.classes,
                  "inline-flex cursor-pointer items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-150 outline-none",
                ].join(" ")}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tamaño SM */}
        <div class="mb-6">
          <p class="text-muted-foreground mb-3 text-xs font-medium tracking-widest uppercase">
            Tamaño SM
          </p>
          <div class="flex flex-wrap gap-3">
            {BUTTON_VARIANTS.map((btn) => (
              <button
                key={btn.label}
                type="button"
                class={[
                  btn.classes,
                  "inline-flex cursor-pointer items-center justify-center rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150 outline-none",
                ].join(" ")}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tamaño LG */}
        <div class="mb-6">
          <p class="text-muted-foreground mb-3 text-xs font-medium tracking-widest uppercase">
            Tamaño LG
          </p>
          <div class="flex flex-wrap gap-3">
            {BUTTON_VARIANTS.map((btn) => (
              <button
                key={btn.label}
                type="button"
                class={[
                  btn.classes,
                  "inline-flex cursor-pointer items-center justify-center rounded-md px-6 py-3 text-base font-semibold transition-all duration-150 outline-none",
                ].join(" ")}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Botones Deshabilitados */}
        <div>
          <p class="text-muted-foreground mb-3 text-xs font-medium tracking-widest uppercase">
            Estado Deshabilitado
          </p>
          <div class="flex flex-wrap gap-3">
            {["Primary", "Secondary", "Success", "Error"].map((name) => (
              <button
                key={name}
                type="button"
                disabled
                class="bg-muted text-muted-foreground inline-flex cursor-not-allowed items-center justify-center rounded-md px-4 py-2 text-sm font-medium opacity-60"
              >
                {name} (disabled)
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Sección: Badges */}
      <section class="mb-14">
        <h2 class="text-foreground mb-1 text-lg font-semibold">Badges</h2>
        <p class="text-muted-foreground mb-5 text-sm">
          Etiquetas de estado, categorías y notificaciones.
        </p>

        {/* Rounded full (pill) — estilo más común */}
        <div class="mb-6">
          <p class="text-muted-foreground mb-3 text-xs font-medium tracking-widest uppercase">
            Pill (rounded-full)
          </p>
          <div class="flex flex-wrap items-center gap-2">
            {BADGE_VARIANTS.map((badge) => (
              <span
                key={badge.label}
                class={[
                  badge.classes,
                  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                ].join(" ")}
              >
                {badge.label}
              </span>
            ))}
          </div>
        </div>

        {/* Rounded — estilo cuadrado suave */}
        <div class="mb-6">
          <p class="text-muted-foreground mb-3 text-xs font-medium tracking-widest uppercase">
            Rounded (rounded-md)
          </p>
          <div class="flex flex-wrap items-center gap-2">
            {BADGE_VARIANTS.map((badge) => (
              <span
                key={badge.label}
                class={[
                  badge.classes,
                  "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium",
                ].join(" ")}
              >
                {badge.label}
              </span>
            ))}
          </div>
        </div>

        {/* Con punto indicador */}
        <div>
          <p class="text-muted-foreground mb-3 text-xs font-medium tracking-widest uppercase">
            Con indicador (dot)
          </p>
          <div class="flex flex-wrap items-center gap-2">
            {BADGE_VARIANTS.slice(0, 6).map((badge) => (
              <span
                key={badge.label}
                class={[
                  badge.classes,
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                ].join(" ")}
              >
                <span class="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                {badge.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Sección: Combinaciones Contextuales */}
      <section class="mb-14">
        <h2 class="text-foreground mb-1 text-lg font-semibold">
          Combinaciones Contextuales
        </h2>
        <p class="text-muted-foreground mb-5 text-sm">
          Ejemplos de cómo los colores interactúan en tarjetas de estado y
          alertas típicas del dashboard.
        </p>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              {
                type: "success",
                title: "Llamada completada",
                desc: "El agente finalizó con éxito.",
                bg: "bg-success/10",
                border: "border-success/30",
                text: "text-success",
                badge: "bg-success text-success-foreground",
              },
              {
                type: "error",
                title: "Error de conexión",
                desc: "No se pudo iniciar la llamada.",
                bg: "bg-error/10",
                border: "border-error/30",
                text: "text-error",
                badge: "bg-error text-error-foreground",
              },
              {
                type: "warning",
                title: "Créditos bajos",
                desc: "Quedan menos de 10 min.",
                bg: "bg-warning/10",
                border: "border-warning/30",
                text: "text-warning",
                badge: "bg-warning text-warning-foreground",
              },
              {
                type: "info",
                title: "Actualización disponible",
                desc: "Nueva versión de agente lista.",
                bg: "bg-info/10",
                border: "border-info/30",
                text: "text-info",
                badge: "bg-info text-info-foreground",
              },
            ] as const
          ).map((card) => (
            <div
              key={card.type}
              class={[
                card.bg,
                card.border,
                "flex flex-col gap-2 rounded-lg border p-4",
              ].join(" ")}
            >
              <div class="flex items-center justify-between">
                <p class={["text-sm font-semibold", card.text].join(" ")}>
                  {card.title}
                </p>
                <span
                  class={[
                    card.badge,
                    "rounded-full px-2 py-0.5 text-xs font-semibold capitalize",
                  ].join(" ")}
                >
                  {card.type}
                </span>
              </div>
              <p class="text-muted-foreground text-xs">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer class="border-border text-muted-foreground border-t pt-6 text-xs">
        <p>
          Tokens definidos en{" "}
          <code class="bg-muted rounded px-1 py-0.5">
            src/assets/css/global.css
          </code>{" "}
          — Tailwind CSS v4 CSS-first.
        </p>
        <p class="mt-1">
          Solo uso interno. No incluir en builds de producción.
        </p>
      </footer>
    </main>
  );
});

export const head: DocumentHead = {
  title: "Color Catalog · Internal",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
};
