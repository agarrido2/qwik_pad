/**
 * Layout público - Envuelve landing, pricing, etc.
 * Renderiza MainLayout (Header marketing + Footer)
 */

import { component$, Slot } from '@builder.io/qwik';
import { MainLayout } from '~/components/layouts';

export default component$(() => {
  return (
    <MainLayout>
      <Slot />
    </MainLayout>
  );
});
