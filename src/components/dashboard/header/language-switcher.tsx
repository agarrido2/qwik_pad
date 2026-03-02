/**
 * Language Switcher - Selector de idioma
 *
 * Componente visual para cambiar el idioma de la plataforma.
 * (Funcionalidad pendiente de implementar)
 */

import { component$ } from "@builder.io/qwik";
import { Dropdown, DropdownItem } from "~/components/ui";

export const LanguageSwitcher = component$(() => {
  return (
    <Dropdown align="right" width="w-40">
      <button
        q:slot="trigger"
        type="button"
        class="text-foreground hover:bg-muted hover:text-foreground flex h-9 w-9 items-center justify-center rounded-md transition-colors"
        aria-label="Cambiar idioma"
      >
        <span class="text-lg leading-none" aria-hidden="true" title="Español">
          🇪🇸
        </span>
      </button>

      <DropdownItem>
        <span class="mr-2 text-lg leading-none" aria-hidden="true">
          🇪🇸
        </span>
        Español
      </DropdownItem>

      <DropdownItem>
        <span class="mr-2 text-lg leading-none" aria-hidden="true">
          🇬🇧
        </span>
        English
      </DropdownItem>

      <DropdownItem>
        <span class="mr-2 text-lg leading-none" aria-hidden="true">
          🇵🇹
        </span>
        Português
      </DropdownItem>
    </Dropdown>
  );
});
