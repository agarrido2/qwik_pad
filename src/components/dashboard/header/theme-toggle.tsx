/**
 * Theme Toggle - Botón de cambio de tema (dark/light mode)
 *
 * Placeholder: la funcionalidad real de dark mode se implementará en futuras
 * iteraciones. Por ahora solo muestra el ícono sin acción.
 */

import { component$ } from '@builder.io/qwik';
import { MoonIcon } from '~/components/icons/moon-icon';
import { Button } from '~/components/ui';

export const ThemeToggle = component$(() => {
  return (
    <Button 
    variant="ghost" 
    size="icon" 
    aria-label="Cambiar tema" 
    title="Cambiar tema (próximamente)">
      <MoonIcon aria-hidden="true" class="h-5 w-5" />
    </Button>
  );
});