/**
 * Layout público - Envuelve landing, pricing, etc.
 * Renderiza PublicLayout (Header marketing + Footer)
 */

import { component$, Slot } from '@builder.io/qwik';
import { PublicLayout } from '~/components/layouts';

export default component$(() => {
  return (
    <PublicLayout>
      <Slot />
    </PublicLayout>
  );
});
